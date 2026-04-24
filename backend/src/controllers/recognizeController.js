const axios = require('axios');
const path = require('path');
const fs = require('fs');

const AIAR_URL = process.env.AIAR_URL || 'http://localhost:5002';
const AIAR_TIMEOUT = 20000;

const LOCAL_BUILDINGS_PATH = path.join(__dirname, '../../data/buildings.json');
function getLocalBuildings() {
  try { return JSON.parse(fs.readFileSync(LOCAL_BUILDINGS_PATH, 'utf8')); } catch { return []; }
}

// Firebase, Google Vision și Overpass sunt opționale — graceful degradation
let db = null;
let detectLandmark = null;
let haversineDistance = null;

try {
  const firebase = require('../config/firebase');
  db = firebase.db;
} catch (_) {}

try {
  const vs = require('../services/visionService');
  detectLandmark = vs.detectLandmark;
} catch (_) {}

try {
  const os = require('../services/overpassService');
  haversineDistance = os.haversineDistance;
} catch (_) {}

function normalizeText(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function nameMatchScore(dbName, visionName) {
  const a = normalizeText(dbName);
  const b = normalizeText(visionName);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const aWords = a.split(/\s+/);
  const bWords = b.split(/\s+/);
  const common = aWords.filter((w) => bWords.includes(w) && w.length > 2);
  return common.length / Math.max(aWords.length, bWords.length);
}

async function getAllBuildings() {
  if (db) {
    try {
      const snap = await db.collection('buildings').get();
      if (!snap.empty) return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (_) {}
  }
  return getLocalBuildings();
}

async function matchWithDatabase(visionLandmarks, buildings) {
  let bestMatch = null;
  let bestScore = 0;
  for (const landmark of visionLandmarks) {
    for (const building of buildings) {
      const nameScore = nameMatchScore(building.name, landmark.name);
      let coordScore = 0;
      if (haversineDistance && building.coordinates) {
        for (const loc of landmark.locations || []) {
          if (loc.lat && loc.lng) {
            const dist = haversineDistance(
              building.coordinates.lat,
              building.coordinates.lng,
              loc.lat,
              loc.lng
            );
            if (dist < 200) coordScore = 0.5;
            else if (dist < 500) coordScore = 0.25;
          }
        }
      }
      const total = nameScore * 0.7 + coordScore * 0.3 + (landmark.score || 0) * 0.1;
      if (total > bestScore) { bestScore = total; bestMatch = building; }
    }
  }
  return bestScore > 0.3 ? bestMatch : null;
}

async function recognize(req, res) {
  const { image, lat, lng } = req.body;
  if (!image) return res.status(400).json({ error: 'image (base64) is required' });

  const buildings = await getAllBuildings();
  let building = null;
  let method = null;

  // ─── 1. AIAR Gemini Vision — prioritară (folosește conținutul real al imaginii)
  try {
    const aiarRes = await axios.post(
      `${AIAR_URL}/vision/recognize`,
      { image_b64: image },
      { timeout: AIAR_TIMEOUT }
    );
    if (aiarRes.data?.building) {
      const vid = aiarRes.data.building.id;
      // Preferăm varianta din baza noastră (Firebase/JSON), altfel o folosim pe cea din AIAR
      building = buildings.find((b) => b.id === vid) || aiarRes.data.building;
      method = 'gemini-vision';
      console.log('[recognize] Gemini Vision →', building.name);
    }
  } catch (err) {
    console.warn('[recognize] Gemini Vision indisponibil:', err.message);
  }

  // ─── 2. Google Cloud Vision + DB (doar dacă e configurat)
  if (!building && detectLandmark && process.env.GOOGLE_VISION_API_KEY) {
    try {
      const landmarks = await detectLandmark(image);
      if (landmarks.length > 0) {
        building = await matchWithDatabase(landmarks, buildings);
        if (building) method = 'google-vision';
      }
    } catch (err) {
      console.warn('[recognize] Google Vision error:', err.message);
    }
  }

  // ─── 3. GPS fallback — doar ca ultimă soluție, când vision-ul nu a găsit nimic
  if (!building && lat !== undefined && lng !== undefined && haversineDistance) {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      let minDist = Infinity;
      for (const b of buildings) {
        if (!b.coordinates) continue;
        const dist = haversineDistance(parsedLat, parsedLng, b.coordinates.lat, b.coordinates.lng);
        if (dist < minDist) { minDist = dist; building = b; }
      }
      // Threshold strict: dacă utilizatorul e la >80m, NU presupunem că fotografiază
      // acea clădire. Preferăm 404, să încurajăm apropierea sau vision.
      if (minDist > 80) building = null;
      else { method = 'gps-fallback'; console.log(`[recognize] GPS fallback → ${building?.name} (${Math.round(minDist)}m)`); }
    }
  }

  if (!building) return res.status(404).json({ error: 'Building not recognized' });

  res.json({ building, method: method || 'recognized' });
}

module.exports = { recognize };
