"""Intent detection și template-uri de răspuns pentru ghidul AI turistic."""

import random
import re

# ─── Sistem de prompturi pentru Gemini ────────────────────────────────────────

SYSTEM_PROMPT = (
    "Ești un ghid turistic AI pentru monumente istorice din România. "
    "Răspunzi EXCLUSIV în română, prietenos și concis: maxim 3 propoziții, maxim 60 de cuvinte. "
    "Evită limbajul academic și repetarea salutărilor. "
    "Fii natural, ca un ghid local entuziast care iubește arhitectura."
)


def build_gemini_prompt(question: str, building: dict, history: list[dict]) -> str:
    facts = building.get("facts", [])
    facts_str = "; ".join(facts) if facts else "—"
    ctx = (
        f"[Date clădire]\n"
        f"Nume: {building.get('name', '?')}\n"
        f"An: {building.get('year', '?')}\n"
        f"Arhitect: {building.get('architect', '?')}\n"
        f"Stil: {building.get('style', '?')}\n"
        f"Categorie: {building.get('tag', '?')}\n"
        f"Fapte: {facts_str}\n"
        f"Descriere: {building.get('blurb', '')}\n"
    )
    history_str = ""
    for msg in history[-5:]:
        role = "Utilizator" if msg.get("role") == "user" else "Ghid AI"
        history_str += f"{role}: {msg.get('content', '')}\n"

    return (
        f"{SYSTEM_PROMPT}\n\n"
        f"{ctx}\n"
        f"{history_str}"
        f"Utilizator: {question}\n"
        f"Ghid AI:"
    )


# ─── Detectie intentie (rule-based) ───────────────────────────────────────────

INTENT_PATTERNS: dict[str, list[str]] = {
    "year":      [r"când", r"\ban\b", r"constru", r"ridic", r"edificat", r"vechi", r"vârst", r"perioad", r"epoc"],
    "architect": [r"arhitect", r"proiectat", r"creat", r"desenat", r"autor", r"cine\s+a"],
    "style":     [r"stil", r"arhitectur", r"design", r"materiale", r"cum arat", r"aspect", r"structur", r"faiad"],
    "history":   [r"poveste", r"istori", r"eveniment", r"semnific", r"important", r"trecut", r"memorie"],
    "facts":     [r"fapt", r"curiozitate", r"știai", r"interesant", r"special", r"unic", r"record", r"surprinz"],
    "location":  [r"unde", r"locați", r"cartier", r"strad", r"adres"],
}


def detect_intent(question: str) -> str:
    q = question.lower()
    for intent, patterns in INTENT_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, q):
                return intent
    return "general"


# ─── Șabloane răspunsuri (max 60 cuvinte, max 3 propoziții) ───────────────────

def _fact(building: dict, idx: int = 0) -> str:
    facts = building.get("facts", [])
    if not facts:
        return ""
    return facts[idx % len(facts)]


def _blurb_short(building: dict) -> str:
    blurb = building.get("blurb", "")
    if not blurb:
        return ""
    sentences = blurb.split(".")
    return sentences[0].strip() + "." if sentences else blurb


TEMPLATES: dict[str, list[str]] = {
    "year": [
        "{name} a văzut lumina zilei în {year}. {fact0}",
        "Construit în {year}, {name} a rezistat timpului cu grație. {blurb_short}",
        "În {year}, {architect} a dat naștere unui monument ce definește orașul și astăzi. {fact1}",
    ],
    "architect": [
        "{architect} a conceput {name} în stil {style}, lăsând un semn de neșters în peisajul urban. {fact0}",
        "Opera lui {architect}, {name} îmbină {style} cu o eleganță aparte. {fact1}",
        "{name} poartă amprenta vizionară a arhitectului {architect}. {blurb_short}",
    ],
    "style": [
        "{name} este un exemplu strălucit de arhitectură {style}. Fiecare detaliu reflectă spiritul epocii. {fact0}",
        "Stilul {style} al clădirii te transpune direct în epoca în care {architect} a creat această bijuterie. {fact0}",
        "Clădirea combină elementele {style} cu funcționalitate modernă. {fact1}",
    ],
    "history": [
        "{name} este mai mult decât pietre și mortar — este un martor al istoriei. {blurb_short}",
        "De la inaugurarea sa în {year}, {name} a văzut momente definitorii ale trecutului nostru. {fact0}",
        "{blurb_short} Astăzi, {name} rămâne un simbol viu al identității urbane.",
    ],
    "facts": [
        "Iată un fapt fascinant: {fact0}",
        "Știai că {name} ascunde un secret? {fact0} Mai mult, {fact1}",
        "Curiozitate: {fact1} Și mai surprinzător: {fact0}",
    ],
    "location": [
        "{name} se află în centrul orașului, accesibil cu ușurință. {fact0}",
        "Monumentul este amplasat strategic, la coordonatele {lat}/{lng}. {blurb_short}",
        "Poți ajunge la {name} pe jos din centru. {fact0}",
    ],
    "general": [
        "{blurb_short} {fact0}",
        "Despre {name}: {blurb_short} Mai exact, {fact1}",
        "{name} — {tag} din {year}. {fact0}",
    ],
}


def rule_based_response(question: str, building: dict) -> str:
    intent = detect_intent(question)
    templates = TEMPLATES.get(intent, TEMPLATES["general"])
    template = random.choice(templates)

    coords = building.get("coordinates") or {}
    text = template.format(
        name=building.get("name", "Clădirea"),
        year=building.get("year", "?"),
        architect=building.get("architect", "arhitect necunoscut"),
        style=building.get("style", "clasic"),
        tag=building.get("tag", "monument"),
        fact0=_fact(building, 0),
        fact1=_fact(building, 1),
        blurb_short=_blurb_short(building),
        lat=coords.get("lat", "?"),
        lng=coords.get("lng", "?"),
    )
    # Curata spatii duble si puncte duble
    text = re.sub(r"\s{2,}", " ", text).strip()
    text = re.sub(r"\.{2,}", ".", text)
    return text


# ─── Sugestii de întrebări per categorie ──────────────────────────────────────

_SUGGESTIONS: dict[str, list[str]] = {
    "Monument Istoric": [
        "Cum a supraviețuit de-a lungul timpului?",
        "Ce evenimente istorice s-au petrecut aici?",
        "De ce a fost ales acest stil arhitectural?",
    ],
    "Patrimoniu UNESCO": [
        "De ce a primit statutul UNESCO?",
        "Ce îl face special față de alte monumente?",
        "Cum este protejat de autorități?",
    ],
    "Clădire Administrativă": [
        "Ce funcții îndeplinește astăzi?",
        "Cât timp a durat construcția?",
        "Care este povestea din spatele ei?",
    ],
    "Muzeu": [
        "Ce colecții importante găsim înăuntru?",
        "Cât costă biletul de intrare?",
        "Care este piesa de rezistență?",
    ],
}

_DEFAULT_SUGGESTIONS = [
    "Când a fost construit?",
    "Cine l-a proiectat?",
    "Ce stil arhitectural are?",
]


def get_suggestions(building: dict) -> list[str]:
    tag = building.get("tag", "")
    base = _SUGGESTIONS.get(tag, _DEFAULT_SUGGESTIONS)
    # Adauga una specifica cladirii daca are fapte
    facts = building.get("facts", [])
    extra = []
    if facts:
        extra = [f"Povestește-mi mai mult despre: \"{facts[0][:40]}...\""]
    combined = base + extra
    return combined[:3]
