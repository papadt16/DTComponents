"""
Settings for the desk-robot backend (server + PC robot emulator).
Everything you might want to change lives here.
"""
import os
from pathlib import Path

BASE_DIR = Path(os.environ.get("CLASSBOT_HOME", Path(__file__).resolve().parent))
CACHE_DIR = BASE_DIR / "cache"            # server: generated clips are cached here
ROBOT_FLASH = BASE_DIR / "robot_flash"    # emulator: stands in for the robot's flash memory


def _load_dotenv():
    """Tiny .env reader so you never have to type keys in a terminal."""
    env_file = Path(__file__).resolve().parent / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


_load_dotenv()


def _clean(value: str, name: str) -> str:
    """Forgives common paste slips: stray spaces/newlines, quotes, or pasting the whole 'NAME=value' line."""
    v = (value or "").strip().strip('"').strip("'").strip()
    if v.upper().startswith(name.upper() + "="):
        v = v[len(name) + 1:].strip().strip('"').strip("'").strip()
    return v


def _env(name: str) -> str:
    """Reads a setting, also tolerating a mistyped NAME (trailing space, zero instead of letter O)."""
    v = _clean(os.environ.get(name, ""), name)
    if v:
        return v
    for k, val in os.environ.items():
        if k.strip().upper().replace("0", "O") == name and _clean(val, name):
            return _clean(val, name)
    return ""

# ---------------- Robot identity ----------------
ROBOT_NAME = os.environ.get("ROBOT_NAME", "Maya")

# ---------------- Server side: who does the hearing, thinking and talking ----------------
# BRAIN: "groq" = Groq Whisper (hearing) + Llama (thinking), very fast. Falls back to Gemini if it fails.
# VOICE: "edge"  = edge-tts (free Microsoft voices, no key). Falls back to Gemini's voice if it fails.
GROQ_API_KEY = _env("GROQ_API_KEY")
GROQ_BASE_URL = os.environ.get("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
GROQ_CHAT_MODEL = os.environ.get("GROQ_CHAT_MODEL", "openai/gpt-oss-20b")   # fast; run list_groq_models.py to see yours
GROQ_CHAT_FALLBACK = "openai/gpt-oss-120b"       # bigger and smarter, a little slower
GROQ_STT_MODEL = "whisper-large-v3-turbo"
STT_LANGUAGE = "en"                              # helps Whisper; "" lets it guess
GROQ_TIMEOUT = 15
BRAIN_PROVIDER = os.environ.get("BRAIN_PROVIDER", "groq" if GROQ_API_KEY else "gemini")
VOICE_PROVIDER = os.environ.get("VOICE_PROVIDER", "edge")
# If the main voice fails: "off" = Maya stays silent for that reply (she keeps ONE voice, always), "gemini" = use Google's voice.
VOICE_FALLBACK = os.environ.get("VOICE_FALLBACK", "off")
EDGE_RETRIES = int(os.environ.get("EDGE_RETRIES", "2") or 0)   # extra tries when the free voice service hiccups
EDGE_VOICE = os.environ.get("EDGE_VOICE", "en-IE-EmilyNeural")   # run: edge-tts --list-voices
EDGE_MP3_RATE = 24000                                           # what edge-tts produces
# Shift EVERY mood's speed (percent) and pitch (Hz). Try pitch +4..+10 for a smaller, cuter robot voice,
# or rate -5 to slow it down. Change them on Render's Environment page, no code needed.
EDGE_RATE_OFFSET = int(os.environ.get("EDGE_RATE_OFFSET", "10") or 0)
EDGE_PITCH_OFFSET = int(os.environ.get("EDGE_PITCH_OFFSET", "6") or 0)
MAX_REPLY_WORDS = 28                                            # hard limit on how long one spoken reply can be
# (speed, pitch) per mood, so the voice sounds a little different when the face changes
EDGE_EMOTION = {
    "neutral": ("+0%", "+0Hz"), "happy": ("+6%", "+3Hz"), "excited": ("+12%", "+5Hz"),
    "curious": ("+0%", "+4Hz"), "thinking": ("-4%", "+0Hz"), "surprised": ("+8%", "+6Hz"),
    "sad": ("-10%", "-4Hz"), "sleepy": ("-16%", "-5Hz"),
}

# ---------------- Server side: Google Gemini (the backup) ----------------
API_KEY = _env("GEMINI_API_KEY")
API_URL = os.environ.get(
    "GEMINI_API_URL", "https://generativelanguage.googleapis.com/v1beta/interactions"
)
CHAT_MODEL = "gemini-3.8-flash"             # understands audio, writes the reply
CHAT_MODEL_FALLBACK = "gemini-3.5-flash-lite"   # tried once if the main model says "high demand" (503); "" = off
TTS_MODEL = "gemini-3.8-flash-lite-tts"     # or "gemini-3.8-flash-tts" for richer acting
TTS_VOICE = "Leda"                          # Gemini's backup voice (female, youthful). Others: Kore, Aoede, Sulafat...
TTS_STYLE = "warm, friendly and a little playful"
REQUEST_TIMEOUT = 60
CHAT_TIMEOUT = 20      # seconds to wait for the main brain before trying the backup model
TTS_TIMEOUT = 30       # seconds to wait for the voice
# Google's FREE plan allows only a few spoken replies per minute (about 3 at the time of writing; the
# exact number is on your AI Studio rate-limits page). The server stays under it so requests don't
# fail. If you move to a paid tier, raise it; 0 turns the limiter off.
TTS_REQUESTS_PER_MIN = int(os.environ.get("TTS_REQUESTS_PER_MIN", "3"))
# Clips that are the same for everybody are made ONCE on your PC (python make_static_clips.py),
# committed to GitHub next to the server, and served with no Google call at all.
STATIC_CLIPS_DIR = Path(__file__).resolve().parent / "static_clips"

# ---------------- Server side: who may use it ----------------
# Comma-separated secret tokens, one per robot. Make one with:  python make_token.py
DEVICE_TOKENS = [t.strip() for t in os.environ.get("DEVICE_TOKENS", "").replace("\n", ",").split(",") if t.strip()]
ALLOW_NO_AUTH = os.environ.get("ALLOW_NO_AUTH", "") == "1"   # local testing only!
MAX_BODY_BYTES = 1_500_000                  # about 45 s of 16 kHz audio
RATE_LIMIT_PER_MIN = 20                     # conversation turns per robot per minute

# ---------------- Audio ----------------
MIC_RATE = 16000        # what the INMP441 will record at
TTS_RATE = 16000        # what we ask the speech model to produce
MP3_KBPS = 48           # size of clips stored on the robot (about 6 KB per second)

# ---------------- Behaviour ----------------
HISTORY_TURNS_IN_PROMPT = 6     # recent turns sent with every request
MAX_FACTS = 40                  # facts remembered about the owner
GUEST_SECONDS = 300             # how long a guest session lasts

# ---------------- Robot emulator ----------------
SERVER_URL = os.environ.get("ROBOT_SERVER_URL", "http://127.0.0.1:8000")
FORCE_TLS12 = "1" in (os.environ.get("ROBOT_FORCE_TLS12", ""), os.environ.get("FORCE_TLS12", ""))   # workaround for networks that mangle TLS 1.3
DEVICE_TOKEN = os.environ.get("ROBOT_DEVICE_TOKEN", "")

# ---------------- Voice clips ----------------
# Generated by the server on request and stored in the robot's flash.
# generic=True  -> no name inside, can be made before the robot knows you.
# {name} is the owner's name, {robot} is ROBOT_NAME.
CLIP_TEMPLATES = {
    "intro":           {"generic": True,  "text": "Hello! I'm {robot}, your new desk robot. What's your name, and what would you like me to know about you?"},
    "need_internet":   {"generic": True,  "text": "I need the internet to get to know you. Please connect me to Wi-Fi."},
    "no_brain_generic": {"generic": True, "text": "I can't reach my brain right now, but I'm still here with you."},
    "didnt_catch":     {"generic": True,  "text": "Hmm, I didn't catch that. Could you say it again?"},
    "voice_trouble":   {"generic": True,  "text": "Sorry, my voice is acting up. Could you ask me again?"},
    "tickle":          {"generic": True,  "text": "Hehe, that tickles!"},
    "ouch":            {"generic": True,  "text": "Ouch! Please be gentle."},
    "put_me_down":     {"generic": True,  "text": "Whoa! Put me down, please!"},
    "dizzy":           {"generic": True,  "text": "Oooh, I'm all dizzy now."},
    "welcome_back":    {"generic": False, "text": "Welcome back, {name}! I missed you."},
    "no_brain":        {"generic": False, "text": "I can't reach my brain right now, {name}, but I'm still here with you."},
    "greet_morning":   {"generic": False, "text": "Good morning, {name}! Ready for a great day?"},
    "greet_afternoon": {"generic": False, "text": "Good afternoon, {name}!"},
    "greet_evening":   {"generic": False, "text": "Good evening, {name}. How was your day?"},
    "hello":           {"generic": False, "text": "Hi {name}!"},
    "break_time":      {"generic": False, "text": "{name}, time for a short break. Stretch your legs!"},
    "focus_start":     {"generic": False, "text": "Okay {name}, focus time. You've got this!"},
    "low_battery":     {"generic": False, "text": "I'm getting tired, {name}. Please charge me."},
    "goodnight":       {"generic": False, "text": "Goodnight, {name}. Sleep well!"},
    "bye":             {"generic": False, "text": "See you later, {name}!"},
}
