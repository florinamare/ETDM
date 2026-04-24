"""Gemini STT — transcriere vocală în text (Speech-to-Text)."""

import asyncio
import base64
import logging
import os

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

STT_PROMPT = """Ești un sistem de transcriere vocală pentru o aplicație turistică din România.
Transcrie exact ce s-a spus în înregistrarea audio.
Răspunde NUMAI cu textul transcris, în română.
Nu adăuga explicații, salutări sau alte cuvinte.
Dacă nu se aude nimic clar, răspunde cu șirul gol: """


async def transcribe_audio(audio_b64: str, mime_type: str = "audio/mp4") -> str:
    """
    Transcrie audio base64 cu Gemini 1.5 Flash.
    Returnează textul transcris sau string gol dacă eșuează.
    """
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY lipsă — STT dezactivat")
        return ""

    if not audio_b64:
        return ""

    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")

        audio_bytes = base64.b64decode(audio_b64)

        # Gemini acceptă audio/mp4, audio/aac, audio/wav, audio/ogg etc.
        supported_types = {
            "audio/mp4", "audio/m4a", "audio/aac",
            "audio/wav", "audio/mpeg", "audio/mp3",
            "audio/ogg", "audio/flac", "audio/webm",
        }
        if mime_type not in supported_types:
            mime_type = "audio/mp4"

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: model.generate_content(
                [
                    STT_PROMPT,
                    {"mime_type": mime_type, "data": audio_bytes},
                ],
                generation_config={"max_output_tokens": 200, "temperature": 0.1},
            ),
        )

        text = response.text.strip()
        logger.info(f"STT result: '{text}'")
        return text

    except Exception as e:
        logger.error(f"Gemini STT error: {e}")
        return ""
