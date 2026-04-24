"""AIAR Microservice — FastAPI · Edge TTS · Gemini AI · Gemini Vision · Gemini STT"""

import logging
import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_service import get_answer
from tts_service import synthesize_b64
from vision_service import recognize_from_image
from stt_service import transcribe_audio

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ETDM AIAR Service",
    description="AI + Edge TTS + Gemini Vision + Gemini STT pentru ghidul turistic AR",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Modele ───────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class AskRequest(BaseModel):
    question: str
    building: dict
    history: list[ChatMessage] = []


class VoiceRequest(BaseModel):
    question: str
    building: dict
    history: list[ChatMessage] = []
    voice: str | None = None


class VisionRequest(BaseModel):
    image_b64: str


class STTRequest(BaseModel):
    audio_b64: str
    mime_type: str = "audio/mp4"


# ─── Endpoint-uri ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "AIAR v2"}


@app.post("/ai/ask")
async def ask_endpoint(req: AskRequest):
    """Returnează răspuns text AI despre o clădire."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="question este gol")
    if not req.building:
        raise HTTPException(status_code=400, detail="building lipsește")

    history = [msg.model_dump() for msg in req.history]
    result = await get_answer(req.question, req.building, history)
    return result


@app.post("/ai/voice")
async def voice_endpoint(req: VoiceRequest):
    """Returnează răspuns text + audio MP3 base64."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="question este gol")
    if not req.building:
        raise HTTPException(status_code=400, detail="building lipsește")

    history = [msg.model_dump() for msg in req.history]

    ai_result = await get_answer(req.question, req.building, history)
    answer = ai_result["answer"]

    audio_b64 = None
    try:
        audio_b64 = await synthesize_b64(answer, req.voice)
    except Exception as e:
        logger.warning(f"TTS error: {e}")

    return {
        "answer": answer,
        "audio_b64": audio_b64,
        "suggestions": ai_result.get("suggestions", []),
        "source": ai_result.get("source", "unknown"),
    }


@app.post("/vision/recognize")
async def vision_recognize_endpoint(req: VisionRequest):
    """Identifică clădirea din imagine folosind Gemini Vision."""
    if not req.image_b64:
        raise HTTPException(status_code=400, detail="image_b64 lipsește")

    building = await recognize_from_image(req.image_b64)

    if not building:
        raise HTTPException(status_code=404, detail="Clădire nerecunoscută")

    return {"building": building, "method": "gemini-vision"}


@app.post("/stt/transcribe")
async def stt_endpoint(req: STTRequest):
    """Transcrie audio în text cu Gemini STT."""
    if not req.audio_b64:
        raise HTTPException(status_code=400, detail="audio_b64 lipsește")

    text = await transcribe_audio(req.audio_b64, req.mime_type)
    return {"text": text}


# ─── Pornire ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5002))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
