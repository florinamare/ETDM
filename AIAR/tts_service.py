"""Edge TTS — sinteză vocală gratuită, fără API key."""

import asyncio
import base64
import logging
import os
import re

import edge_tts

logger = logging.getLogger(__name__)

DEFAULT_VOICE = os.getenv("TTS_VOICE", "ro-RO-AlinaNeural")

# Voci românești disponibile
RO_VOICES = {
    "alina": "ro-RO-AlinaNeural",   # voce feminină
    "emil":  "ro-RO-EmilNeural",    # voce masculină
}


def _wrap_ssml(text: str, voice: str) -> str:
    """Adaugă SSML pentru pronunție mai naturală."""
    # Înlocuiește ghilimele curiloase cu cele normale
    text = text.replace("„", '"').replace(""", '"').replace(""", '"')
    lang = "ro-RO"
    return (
        f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="{lang}">'
        f'<voice name="{voice}">'
        f'<prosody rate="-5%" pitch="+2Hz">{text}</prosody>'
        f'</voice></speak>'
    )


async def synthesize(text: str, voice: str | None = None) -> bytes:
    """Returnează bytes MP3 din text. Aruncă excepție dacă Edge TTS nu răspunde."""
    selected_voice = voice or DEFAULT_VOICE
    if selected_voice not in RO_VOICES.values():
        selected_voice = DEFAULT_VOICE

    # Limitează lungimea textului pentru TTS (Edge are ~1000 char recomandat)
    if len(text) > 800:
        text = text[:800].rsplit(".", 1)[0] + "."

    communicate = edge_tts.Communicate(text, selected_voice)
    audio_chunks: list[bytes] = []

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])

    if not audio_chunks:
        raise RuntimeError("Edge TTS nu a returnat audio")

    return b"".join(audio_chunks)


async def synthesize_b64(text: str, voice: str | None = None) -> str:
    """Returnează audio MP3 ca string base64."""
    audio_bytes = await synthesize(text, voice)
    return base64.b64encode(audio_bytes).decode("utf-8")
