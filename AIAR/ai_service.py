"""AI Service — Gemini (gratuit) cu fallback rule-based."""

import asyncio
import logging
import os

from prompts import build_gemini_prompt, get_suggestions, rule_based_response

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
_gemini_model = None


def _get_gemini_model():
    global _gemini_model
    if _gemini_model is not None:
        return _gemini_model
    if not GEMINI_API_KEY:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel("gemini-2.5-flash")
        logger.info("Gemini 2.5 Flash inițializat ✓")
        return _gemini_model
    except Exception as e:
        logger.warning(f"Gemini indisponibil: {e} — se folosesc răspunsuri rule-based")
        return None


async def _ask_gemini(question: str, building: dict, history: list[dict]) -> str:
    model = _get_gemini_model()
    if model is None:
        raise RuntimeError("Gemini API key lipsă sau invalid")

    prompt = build_gemini_prompt(question, building, history)

    # Rulăm sincronul în thread pool pentru a nu bloca event loop-ul
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        lambda: model.generate_content(
            prompt,
            generation_config={
                "max_output_tokens": 120,
                "temperature": 0.7,
            },
        ),
    )
    text = response.text.strip()
    # Curăță prefixe de tip "Ghid AI:" dacă modelul le repetă
    for prefix in ("Ghid AI:", "AI:", "Răspuns:"):
        if text.startswith(prefix):
            text = text[len(prefix):].strip()
    return text


async def get_answer(question: str, building: dict, history: list[dict]) -> dict:
    """
    Returnează {'answer': str, 'suggestions': list[str]}.
    Folosește Gemini dacă e configurat, altfel rule-based.
    """
    suggestions = get_suggestions(building)

    # Încearcă Gemini
    if GEMINI_API_KEY:
        try:
            answer = await _ask_gemini(question, building, history)
            return {"answer": answer, "suggestions": suggestions, "source": "gemini"}
        except Exception as e:
            logger.warning(f"Gemini error, fallback rule-based: {e}")

    # Fallback rule-based
    answer = rule_based_response(question, building)
    return {"answer": answer, "suggestions": suggestions, "source": "rule-based"}
