"""
The robot's hosted brain.   Run locally:   uvicorn server:app --reload
The robot talks ONLY to this server; the Google key never leaves it.

Endpoints (all but /healthz need the header  X-Device-Token: <token>):
  GET  /healthz                 wake-up / "are you there?" (no token needed)
  POST /v1/hello                JSON in/out: robot checks in, learns server time + clip version
  POST /v1/turn                 framed: [len][meta JSON][WAV]  ->  [len][result JSON][MP3, ADPCM or PCM 16 kHz]
  GET  /v1/clips/manifest       ?name=Ada   which clips the robot should hold
  GET  /v1/clips/{key}          ?name=Ada&fmt=mp3   one clip (made once, then cached)
"""
import hmac
import os
import platform
import time
from collections import defaultdict, deque

from fastapi import FastAPI, Request, Response
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse

import adpcm
import audio
import clipsvc
import config
import engine
import gemini
import protocol
import voice

BUILD = "2026-11-09-stream"


def _env_report():
    """Names (never values) of settings that look relevant, and whether each has a value."""
    out = {}
    for k, v in os.environ.items():
        if any(x in k.upper() for x in ("GRO", "API_KEY", "TOKEN", "BRAIN", "VOICE")):
            out[k] = "set" if v.strip() else "EMPTY"
    return out


app = FastAPI(title="Desk Robot Brain", docs_url=None, redoc_url=None)
print(f"[startup] build={BUILD} brain={config.BRAIN_PROVIDER} voice={config.VOICE_PROVIDER} "
      f"groq_key_set={bool(config.GROQ_API_KEY)} gemini_key_set={bool(config.API_KEY)} "
      f"tokens={len(config.DEVICE_TOKENS)} python={platform.python_version()}", flush=True)
_hits = defaultdict(deque)


def _deny(code, error, **extra):
    return JSONResponse({"ok": False, "error": error, **extra}, status_code=code)


def _check(request: Request, rate_limited=False):
    """Returns None if allowed, otherwise an error response."""
    token = request.headers.get("x-device-token", "")
    if not config.ALLOW_NO_AUTH:
        if not config.DEVICE_TOKENS:
            return _deny(503, "server_not_configured")
        if not any(hmac.compare_digest(token, t) for t in config.DEVICE_TOKENS):
            return _deny(401, "bad_token")
    if rate_limited:
        q, now = _hits[token], time.time()
        while q and now - q[0] > 60:
            q.popleft()
        if len(q) >= config.RATE_LIMIT_PER_MIN:
            return _deny(429, "slow_down", retry_after=int(60 - (now - q[0])) + 1)
        q.append(now)
    return None


@app.get("/healthz")
def healthz():
    # Shows only YES/NO for each key, never the keys themselves.
    return {"ok": True, "robot": config.ROBOT_NAME, "clip_version": clipsvc.version(),
            "brain": config.BRAIN_PROVIDER, "voice": config.VOICE_PROVIDER, "build": BUILD,
            "keys": {"groq": bool(config.GROQ_API_KEY), "gemini": bool(config.API_KEY)},
            "tokens": len(config.DEVICE_TOKENS),
            "env_names": _env_report(),
            # Render fills these in itself: they say WHICH service answered and which code it is running.
            "render": {"service_id": os.environ.get("RENDER_SERVICE_ID"),
                       "service_name": os.environ.get("RENDER_SERVICE_NAME"),
                       "url": os.environ.get("RENDER_EXTERNAL_URL"),
                       "commit": (os.environ.get("RENDER_GIT_COMMIT") or "")[:7] or None},
            "brain_forced_by_env": "BRAIN_PROVIDER" in os.environ,
            "python": platform.python_version()}


@app.post("/v1/hello")
async def hello(request: Request):
    if (bad := _check(request)):
        return bad
    return {"ok": True, "server_time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "clip_version": clipsvc.version(), "rate": config.TTS_RATE}


@app.post("/v1/turn")
async def turn(request: Request):
    if (bad := _check(request, rate_limited=True)):
        return bad
    if int(request.headers.get("content-length", "0") or 0) > config.MAX_BODY_BYTES:
        return _deny(413, "too_big")
    body = await request.body()
    if len(body) > config.MAX_BODY_BYTES:
        return _deny(413, "too_big")
    try:
        meta, wav = protocol.unpack(body)
    except (ValueError, UnicodeDecodeError):
        return _deny(400, "bad_frame")

    if wav and meta.get("audio_codec") == "adpcm":           # the ESP32 sends 4-bit audio to save time
        try:
            rate = int(meta.get("audio_rate", config.MIC_RATE))
            samples = meta.get("audio_samples")
            wav = audio.pcm_to_wav(adpcm.decode(wav, int(samples) if samples else None), rate)
        except (ValueError, TypeError):
            return _deny(400, "bad_audio")
    t0 = time.time()
    try:
        result = await run_in_threadpool(engine.run_turn, meta, wav or None)
    except gemini.RateLimited as e:
        return _deny(429, "rate_limited", retry_after=e.retry_after, detail=str(e)[:200])
    except gemini.GeminiError as e:
        return _deny(502, "brain_unavailable", detail=str(e)[:200])
    brain_ms = int((time.time() - t0) * 1000)

    payload, voice_ms, voice_timing = b"", 0, {}
    result["audio"] = None
    if meta.get("want_audio", True):
        t1 = time.time()
        try:
            out = await run_in_threadpool(voice.speak, result["reply"], result["emotion"],
                                          meta.get("audio_format", "mp3"))
            payload = out["payload"]
            result["audio"] = {"format": out["kind"], "rate": out["rate"], "bytes": len(payload)}
            if "samples" in out:
                result["audio"]["samples"] = out["samples"]
            result["voice"] = out["provider"]
            voice_timing = out.get("timing", {})
            if out.get("note"):
                result["voice_note"] = out["note"]
        except gemini.RateLimited as e:                  # the text is still useful
            result["tts_error"] = "rate_limited"
            result["retry_after"] = e.retry_after
        except gemini.GeminiError as e:
            result["tts_error"] = str(e)[:200]
            if getattr(e, "notes", None):
                result["voice_note"] = "; ".join(e.notes)[:300]
        voice_ms = int((time.time() - t1) * 1000)
    result["ok"] = True
    result["timings"] = {"brain_ms": brain_ms, "voice_ms": voice_ms, **voice_timing}
    return Response(protocol.pack(result, payload), media_type="application/octet-stream")


@app.get("/v1/clips/manifest")
def clips_manifest(request: Request, name: str = ""):
    if (bad := _check(request)):
        return bad
    return clipsvc.manifest(name)


@app.get("/v1/clips/{key}")
def clip(key: str, request: Request, name: str = "", fmt: str = "mp3"):
    if (bad := _check(request)):
        return bad
    try:
        data, mime = clipsvc.get_clip(key, name, fmt if fmt in ("wav", "mp3", "adpcm") else "mp3", reserve=1)
    except clipsvc.ClipError as e:
        return _deny(404, str(e))
    except gemini.RateLimited as e:
        return _deny(429, "rate_limited", retry_after=e.retry_after, detail=str(e)[:200])
    except gemini.GeminiError as e:
        return _deny(502, "brain_unavailable", detail=str(e)[:200])
    return Response(data, media_type=mime)
