// API client — fetches buildings from backend and maps to frontend shape

const API_BASE = 'http://78.96.86.216:5001';

const ACCENTS = ['#FFB26B', '#8BD3FF', '#B8F0C2', '#E1B9FF', '#FF8FB3', '#5EFCCF', '#FFD97D', '#A8D8EA'];

function mapBuilding(b, index) {
  return {
    id: b.id,
    name: b.name,
    shortName: b.shortName || b.name.split(' ').slice(0, 2).join(' '),
    year: String(b.year || ''),
    architect: b.architect || 'Necunoscut',
    style: b.style || '',
    tag: b.tag || '',
    distance: b.distanceMeters != null ? `${b.distanceMeters} m` : '— m',
    bearing: 'N',
    rating: b.rating || 0,
    accent: ACCENTS[index % ACCENTS.length],
    facts: b.facts || [],
    blurb: b.blurb || '',
    coordinates: b.coordinates || null,
    imageUrl: b.imageUrl || null,
    wikipediaUrl: b.wikipediaUrl || null,
  };
}

async function fetchBuildings() {
  const res = await fetch(`${API_BASE}/buildings`);
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const data = await res.json();
  return data.map(mapBuilding);
}

// ─── AI & Voice ──────────────────────────────────────────────────────────────

async function askAI({ question, building, history = [] }) {
  const res = await fetch(`${API_BASE}/ai/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, building, history }),
  });
  if (!res.ok) throw new Error(`AI error: ${res.status}`);
  return res.json(); // { answer, suggestions, source }
}

async function askAIVoice({ question, building, history = [] }) {
  const res = await fetch(`${API_BASE}/ai/voice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, building, history }),
  });
  if (!res.ok) throw new Error(`AI voice error: ${res.status}`);
  return res.json(); // { answer, audio_b64, suggestions, source }
}

Object.assign(window, { fetchBuildings, askAI, askAIVoice });
