"""
Picks who speaks. Maya has ONE voice (edge-tts). If it hiccups we retry it a couple of times; only if
VOICE_FALLBACK=gemini do we switch to Google's voice, and the reply says so (voice_note).
"""
import time

import adpcm
import audio
import config
import gemini
import speech


def signature() -> str:
    """Changes when the voice changes, so saved clips get re-made."""
    if config.VOICE_PROVIDER == "edge":
        return f"edge:{config.EDGE_VOICE}:{config.EDGE_RATE_OFFSET}:{config.EDGE_PITCH_OFFSET}:{config.TTS_RATE}"
    return f"gemini:{config.TTS_MODEL}:{config.TTS_VOICE}:{config.TTS_RATE}"


def _order():
    if config.VOICE_PROVIDER != "edge":
        return ["gemini"]
    have_gemini = bool(config.API_KEY) or "127.0.0.1" in config.API_URL
    return ["edge"] + (["gemini"] if (config.VOICE_FALLBACK == "gemini" and have_gemini) else [])


def _gemini_style(emotion):
    style = config.TTS_STYLE
    return style + (f", sounding {emotion}" if emotion and emotion != "neutral" else "")


def _edge_with_retries(text, emotion, notes):
    last = None
    for attempt in range(1 + max(0, config.EDGE_RETRIES)):
        try:
            mp3 = speech.edge_mp3(text, emotion)
            if attempt:
                notes.append(f"edge worked on try {attempt + 1}")
            return mp3
        except gemini.GeminiError as e:
            last = e
            notes.append(f"edge try {attempt + 1} failed: {str(e)[:100]}")
            print(f"[voice] {notes[-1]}", flush=True)
            time.sleep(0.4)
    raise last


def _pack(payload, kind, rate, provider, notes, samples=None, timing=None):
    out = {"payload": payload, "kind": kind, "rate": rate, "provider": provider, "note": "; ".join(notes),
           "timing": timing or {}}
    if samples is not None:
        out["samples"] = samples
    return out


def speak(text: str, emotion: str | None = None, fmt="mp3", reserve: int = 0) -> dict:
    """
    fmt: "mp3" (small, needs a decoder), "pcm" (raw 16-bit, for the PC), or "adpcm" (4x smaller than pcm, for the ESP32).
    -> {"payload", "kind", "rate", "provider", "note", "timing", ["samples"]}.  Raises the last error if every voice fails.
    """
    fmt = {True: "mp3", False: "pcm"}.get(fmt, fmt)
    notes, last = [], None
    for provider in _order():
        try:
            t0 = time.time()
            if provider == "edge":
                mp3 = _edge_with_retries(text, emotion, notes)
                edge_ms = int((time.time() - t0) * 1000)
                if fmt == "mp3":
                    return _pack(mp3, "mp3", config.EDGE_MP3_RATE, "edge", notes, timing={"edge_ms": edge_ms})
                pcm, rate = speech.mp3_to_pcm(mp3, config.TTS_RATE), config.TTS_RATE
            else:
                pcm, rate = gemini.tts(text, _gemini_style(emotion), reserve=reserve)
                edge_ms = int((time.time() - t0) * 1000)
                if config.VOICE_PROVIDER == "edge":
                    notes.append("used Gemini voice")
                if fmt == "mp3":
                    mp3 = audio.encode_mp3(pcm, rate, config.MP3_KBPS)
                    if mp3:
                        return _pack(mp3, "mp3", rate, "gemini", notes, timing={"edge_ms": edge_ms})
            t1 = time.time()
            if fmt == "adpcm":
                n = (len(pcm) // 2) // 2 * 2
                payload = adpcm.encode(pcm[: n * 2])
                return _pack(payload, "adpcm_ima", rate, provider, notes, samples=n,
                             timing={"edge_ms": edge_ms, "convert_ms": int((time.time() - t1) * 1000)})
            return _pack(pcm, "pcm_s16le", rate, provider, notes,
                         timing={"edge_ms": edge_ms, "convert_ms": int((time.time() - t1) * 1000)})
        except gemini.GeminiError as e:
            last = e
            notes.append(f"{provider} failed: {str(e)[:100]}")
    last.notes = notes
    raise last


def tts(text: str, emotion: str | None = None, reserve: int = 0):
    """Text -> (pcm_bytes, sample_rate), 16-bit mono. Used for saved clips."""
    out = speak(text, emotion, fmt="pcm", reserve=reserve)
    return out["payload"], out["rate"]
