"""Gemini Vision — recunoașterea clădirilor din imagini."""

import asyncio
import base64
import logging
import os

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# Trebuie să fie identice cu backend/data/buildings.json (ID + coords).
BUILDINGS = [
    {
        "id": "catedrala-mitropolitana",
        "name": "Catedrala Mitropolitană",
        "shortName": "Catedrala",
        "year": "1936–1946",
        "architect": "Ion Traianescu",
        "style": "Neo-Bizantin",
        "tag": "Patrimoniu Religios",
        "rating": 4.9,
        "accent": "#FFB26B",
        "coordinates": {"lat": 45.74619, "lng": 21.22631},
        "facts": [
            "Cel mai înalt monument din Timișoara — 83,7 m înălțime cu tot cu cruce.",
            "A fost construită în stilul bisericilor moldovenești din sec. XV–XVI.",
            "Catapeteasma este sculptată în lemn de tei și acoperită cu foiță de aur.",
        ],
        "blurb": "Simbol al Timișoarei și al credinței ortodoxe bănățene, catedrala domină Piața Victoriei și a devenit un reper vizual al orașului european al culturii 2023.",
    },
    {
        "id": "opera-nationala",
        "name": "Opera Națională",
        "shortName": "Opera",
        "year": "1875",
        "architect": "Fellner & Helmer",
        "style": "Baroc Vienez",
        "tag": "Monument Istoric",
        "rating": 4.8,
        "accent": "#8BD3FF",
        "coordinates": {"lat": 45.75344, "lng": 21.22549},
        "facts": [
            "Construită de celebra firmă vieneză Fellner & Helmer, autoare a peste 48 de teatre europene.",
            "Sala mare are 934 de locuri și o acustică remarcabilă.",
            "Fațada este decorată cu statui alegorice reprezentând muzica și drama.",
        ],
        "blurb": "Situată față în față cu Catedrala Mitropolitană pe Piața Victoriei, Opera Națională din Timișoara este una dintre cele mai elegante clădiri de spectacol din România.",
    },
    {
        "id": "castelul-huniade",
        "name": "Castelul Huniade",
        "shortName": "Castelul",
        "year": "sec. XIV",
        "architect": "Iancu de Hunedoara",
        "style": "Gotic Medieval",
        "tag": "Monument Istoric",
        "rating": 4.7,
        "accent": "#B8F0C2",
        "coordinates": {"lat": 45.75277, "lng": 21.23091},
        "facts": [
            "A fost reședința lui Iancu de Hunedoara, guvernatorul Ungariei în sec. XV.",
            "Adăpostește Muzeul Banatului, cu peste 1,7 milioane de obiecte de patrimoniu.",
            "A suferit incendii majore în 1443 și 1849, de fiecare dată fiind reconstruit.",
        ],
        "blurb": "Cel mai vechi monument medieval păstrat din Timișoara, construit inițial în stil gotic și extins de-a lungul secolelor. Astăzi este sediul Muzeului Banatului.",
    },
    {
        "id": "catedrala-romano-catolica",
        "name": "Catedrala Romano-Catolică",
        "shortName": "Dom-ul",
        "year": "1736–1754",
        "architect": "Joseph E. Fischer von Erlach",
        "style": "Baroc Imperial",
        "tag": "Patrimoniu Religios",
        "rating": 4.6,
        "accent": "#E1B9FF",
        "coordinates": {"lat": 45.75837, "lng": 21.22971},
        "facts": [
            "Este una dintre cele mai importante clădiri baroce din România.",
            "Construită după planurile arhitectului imperial vienez, sub patronajul lui Carol VI.",
            "Pictura interioară a bolții a fost realizată de Frantz Anton Maulbertsch.",
        ],
        "blurb": "Dom-ul catolic din Piața Unirii este vârful stilului baroc în Timișoara, construit în perioada dominației habsburgice și dedicat Sfântului Gheorghe.",
    },
    {
        "id": "palatul-baroc",
        "name": "Palatul Baroc",
        "shortName": "Palatul Baroc",
        "year": "1754",
        "architect": "Johann Theodor Kostka",
        "style": "Baroc Imperial",
        "tag": "Muzeu Național",
        "rating": 4.5,
        "accent": "#FFD36B",
        "coordinates": {"lat": 45.75859, "lng": 21.22876},
        "facts": [
            "A servit inițial drept Palat al Episcopiei Romano-Catolice.",
            "Găzduiește Muzeul de Artă din Timișoara cu colecții valoroase.",
            "Fațada barocă este una dintre cele mai bine păstrate din oraș.",
        ],
        "blurb": "Impunătoare clădire în stilul barocului vienez, construită în Piața Unirii, astăzi sediul Muzeului de Artă din Timișoara.",
    },
    {
        "id": "sinagoga-fabric",
        "name": "Sinagoga din Fabric",
        "shortName": "Sinagoga",
        "year": "1899",
        "architect": "Lipót Baumhorn",
        "style": "Moorish Revival",
        "tag": "Monument Arhitectural",
        "rating": 4.6,
        "accent": "#FF8BB6",
        "coordinates": {"lat": 45.75389, "lng": 21.24050},
        "facts": [
            "Proiectată de arhitectul maghiar Lipót Baumhorn, specialist în sinagogi.",
            "Una dintre cele mai mari și frumoase sinagogi din România.",
            "Interiorul este decorat cu vitralii colorate și ornamente arabe.",
        ],
        "blurb": "Bijuterie arhitecturală din cartierul Fabric, Sinagoga Baumhorn este un monument al comunității evreiești timișorene și un exemplu rar de stil moorish în România.",
    },
    {
        "id": "palatul-lloyd",
        "name": "Palatul Lloyd",
        "shortName": "Lloyd",
        "year": "1910",
        "architect": "Lipót Baumhorn",
        "style": "Eclectic",
        "tag": "Monument Arhitectural",
        "rating": 4.4,
        "accent": "#C6B8FF",
        "coordinates": {"lat": 45.75178, "lng": 21.22696},
        "facts": [
            "Construit pentru Camera de Comerț și Industrie din Timișoara.",
            "Fațada combină elemente neo-baroc și neo-renascentiste.",
            "Pe parterul său se află una dintre cele mai vechi cafenele din oraș.",
        ],
        "blurb": "Palatul Lloyd domină Piața Victoriei prin eleganța sa eclectic-barocă, reprezentând înflorirea economică a Timișoarei habsburgice de la începutul secolului XX.",
    },
    {
        "id": "bastionul-theresia",
        "name": "Bastionul Theresia",
        "shortName": "Theresia",
        "year": "1729",
        "architect": "Inginer militar habsburgic",
        "style": "Fortification Barocă",
        "tag": "Monument Istoric",
        "rating": 4.5,
        "accent": "#B8E0FF",
        "coordinates": {"lat": 45.75697, "lng": 21.23109},
        "facts": [
            "Parte din fortăreața habsburgică construită după eliberarea Timișoarei de sub turci.",
            "Astăzi găzduiește cafenele, ateliere de artiști și spații culturale.",
            "Este unul dintre puținele bastioane medievale păstrate în România.",
        ],
        "blurb": "Fostă componentă a zidurilor de apărare habsburgice, Bastionul Theresia a fost reconvertit într-un vibrant centru cultural și creator al Timișoarei.",
    },
]

_BUILDING_BY_ID = {b["id"]: b for b in BUILDINGS}

VISION_PROMPT = """Ești un sistem expert de recunoaștere a monumentelor istorice din Timișoara, România.
Analizează imaginea și identifică clădirea fotografiată.

Clădirile pe care le poți recunoaște (răspunzi DOAR cu slug-ul ID, exact ca mai jos):

catedrala-mitropolitana → Catedrala Mitropolitană (cupolă mare neo-bizantină cu cărămidă roșie și bandă galbenă, Piața Victoriei sud)
opera-nationala → Opera Națională (clădire baroc-vieneză alb-gălbuie, Piața Victoriei nord, fațada cu statui alegorice)
castelul-huniade → Castelul Huniade (zid masiv din piatră, turnuri medievale gotice, acum Muzeul Banatului)
catedrala-romano-catolica → Dom-ul Romano-Catolic (fațadă baroc imperial alb-galben, două turle înalte, Piața Unirii)
palatul-baroc → Palatul Baroc (fațadă baroc galbenă vegetală, Piața Unirii, acum Muzeul de Artă)
sinagoga-fabric → Sinagoga din Fabric (stil moorish, cupolă bulbiformă, arcade cu motive orientale)
palatul-lloyd → Palatul Lloyd (fațadă eclectică cu atic împodobit, Piața Victoriei latura vestică)
bastionul-theresia → Bastionul Theresia (zid gros de cărămidă habsburgic, curte interioară, cafenele)

Reguli stricte:
1. Răspunde DOAR cu slug-ul exact (ex: "castelul-huniade") dacă recunoști clădirea.
2. Dacă imaginea este neclară, nu conține niciun monument din listă, sau nu poți decide între două variante cu încredere, răspunde cu: unknown
3. NU adăuga text, explicații, punctuație, ghilimele sau salutări. Un singur cuvânt.
"""


async def recognize_from_image(image_b64: str) -> dict | None:
    """
    Identifică clădirea din imagine cu Gemini Vision.
    Returnează obiectul building sau None.
    """
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY lipsă — vision recognition dezactivat")
        return None

    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")

        image_bytes = base64.b64decode(image_b64)

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: model.generate_content(
                [
                    VISION_PROMPT,
                    {"mime_type": "image/jpeg", "data": image_bytes},
                ],
                # 200 tokeni — Gemini 2.5 folosește thinking intern care consumă
                # din buget. 20 era prea puțin și trunchia slug-ul la „bast".
                generation_config={"max_output_tokens": 200, "temperature": 0.1},
            ),
        )

        raw = (response.text or "").strip().lower()
        # păstrează doar litere, cifre și cratimă (formă de slug)
        result = "".join(c for c in raw if c.isalnum() or c == "-")
        logger.info(f"Gemini Vision raw result: '{result}' (full: '{raw}')")

        if result == "unknown" or not result:
            logger.info("Gemini: unknown / răspuns gol")
            return None

        # 1. potrivire exactă
        if result in _BUILDING_BY_ID:
            building = _BUILDING_BY_ID[result]
            logger.info(f"Clădire recunoscută (exact): {building['name']}")
            return building

        # 2. potrivire prefix — Gemini poate returna trunchiat (ex. „bast" → „bastionul-theresia")
        matches = [bid for bid in _BUILDING_BY_ID if bid.startswith(result) and len(result) >= 3]
        if len(matches) == 1:
            building = _BUILDING_BY_ID[matches[0]]
            logger.info(f"Clădire recunoscută (prefix '{result}' → {matches[0]}): {building['name']}")
            return building

        # 3. potrivire conținut — slug-ul să fie cuprins în răspuns
        for bid in _BUILDING_BY_ID:
            if bid in result or result in bid:
                if len(result) >= 4:
                    building = _BUILDING_BY_ID[bid]
                    logger.info(f"Clădire recunoscută (contains): {building['name']}")
                    return building

        logger.info(f"Clădire nerecunoscută (raw='{result}', prefix matches={matches})")
        return None

    except Exception as e:
        logger.error(f"Gemini Vision error: {e}")
        return None
