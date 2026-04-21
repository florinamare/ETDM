# CLAUDE.md — Backend & Data Developer
## Architecture Discovery App — Backend Only

The frontend (React/TypeScript) already exists in this repo. Your job is to build the **complete backend** from scratch alongside it. The frontend mockup is your contract — match every API call it makes.

---

## Tech Stack

- **Framework**: Node.js + Express (sau FastAPI dacă preferi Python)
- **Database**: Firebase Firestore (sau Supabase)
- **Auth**: Firebase Authentication
- **Image Recognition**: Google Cloud Vision API — Landmark Detection
- **External Data**: Wikipedia API + Overpass API (OpenStreetMap)
- **Deploy target**: Railway sau Render (free tier)
- **Docs**: Swagger auto-generated (sau Postman collection)

---

## Database Schema

### Collection: `buildings`
```json
{
  "id": "string",
  "name": "string",
  "year": "number",
  "architect": "string",
  "style": "string",
  "facts": ["string"],
  "coordinates": {
    "lat": "number",
    "lng": "number"
  },
  "wikipediaUrl": "string",
  "imageUrl": "string"
}
```

### Collection: `users/{userId}/discovered`
```json
{
  "buildingId": "string",
  "discoveredAt": "timestamp"
}
```

---

## API Endpoints to Implement

### Buildings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/buildings` | Returneaza toate cladirile |
| GET | `/buildings/:id` | Returneaza o cladire dupa ID |
| GET | `/buildings/nearby?lat=&lng=&radius=` | Cladiri in raza X metri (Overpass API fallback) |

### Recognition

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/recognize` | Primeste imagine (base64), returneaza cladirea identificata |

**Logica POST `/recognize`:**
1. Trimite imaginea base64 la Google Cloud Vision — Landmark Detection
2. Incearca sa faci match cu cladirile din propria baza de date (dupa nume/coordonate)
3. Daca Vision nu recunoaste → fallback dupa coordonate GPS din request
4. Cacheaza rezultatul pentru a evita apeluri repetate pentru aceeasi imagine/cladire

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/user/discovered/:buildingId` | Salveaza o cladire ca descoperita pentru utilizatorul curent |
| GET | `/user/discovered` | Returneaza lista cladirilor descoperite de utilizatorul curent |

**Autentificare**: Firebase Auth — suporta login anonim si Google. Toate rutele `/user/*` necesita JWT valid in header: `Authorization: Bearer <token>`.

---

## External Integrations

### Google Cloud Vision
- Foloseste **Landmark Detection**
- Limita gratuita: 1000 req/luna — implementeaza cache obligatoriu
- Input: base64 encoded image
- Output: landmark name + coordonate → match cu BD

### Wikipedia API
- Fetch automat date istorice: `wikipedia.extracts` + `wikipedia.pageimages`
- Ruleaza la import/seed, nu la fiecare request
- Endpoint de referinta: `https://en.wikipedia.org/api/rest_v1/`

### Overpass API (OpenStreetMap)
- Fetch coordonate + metadata cladiri
- Folosit pentru endpoint-ul `/buildings/nearby`
- Folosit ca fallback in recunoastere cand Vision esueaza

---

## Data Seeding

- Populeaza baza de date cu **10-20 cladiri din oras**
- Scrie un script de import (`scripts/seed.js` sau `scripts/seed.py`) care:
  1. Citeste un fisier `data/buildings.json`
  2. Imbogateste datele cu Wikipedia API + Overpass API
  3. Scrie totul in Firebase/Supabase
- Datele initiale pot fi culese manual + completate automat via script

---

## Project Structure (suggested)

```
backend/
├── src/
│   ├── config/         # Firebase init, env vars, constants
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth JWT verification
│   ├── models/         # TypeScript types / Firestore helpers
│   ├── routes/         # Express routers
│   └── services/       # Vision API, Wikipedia, Overpass, cache
├── scripts/
│   └── seed.js         # Bulk import script
├── data/
│   └── buildings.json  # Initial dataset
├── .env.example
└── server.js
```

---

## Environment Variables Required

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
GOOGLE_VISION_API_KEY=
PORT=5001
```

---

## Important Notes

- **Nu atinge folderul frontend** — exista deja si nu face parte din task-ul tau
- Toate cheile API se pun in `.env`, niciodata hardcodate
- Deploy-ul se face cu variabile de mediu setate in Railway/Render
- Swagger (`/docs`) trebuie sa fie functional la final
- Testeaza fiecare endpoint cu Postman sau curl inainte de a-l marca ca gata
- Cache-ul pentru Vision API este **obligatoriu** — nu optional
