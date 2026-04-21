const { db } = require('../config/firebase');
const { detectLandmark } = require('../services/visionService');
const { fetchNearbyBuildings, haversineDistance } = require('../services/overpassService');
const cache = require('../services/cacheService');

function normalizeText(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function nameMatchScore(dbName, visionName) {
  const a = normalizeText(dbName);
  const b = normalizeText(visionName);
  if (a === b) return 1;
  const aWords = a.split(/\s+/);
  const bWords = b.split(/\s+/);
  const common = aWords.filter((w) => bWords.includes(w) && w.length > 2);
  return common.length / Math.max(aWords.length, bWords.length);
}

async function matchWithDatabase(visionLandmarks) {
  const snapshot = await db.collection('buildings').get();
  const allBuildings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  let bestMatch = null;
  let bestScore = 0;

  for (const landmark of visionLandmarks) {
    for (const building of allBuildings) {
      // Name similarity
      const nameScore = nameMatchScore(building.name, landmark.name);

      // Coordinate proximity bonus
      let coordScore = 0;
      for (const loc of landmark.locations) {
        if (building.coordinates && loc.lat && loc.lng) {
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

      const total = nameScore * 0.7 + coordScore * 0.3 + landmark.score * 0.1;
      if (total > bestScore) {
        bestScore = total;
        bestMatch = building;
      }
    }
  }

  return bestScore > 0.3 ? bestMatch : null;
}

async function recognize(req, res) {
  const { image, lat, lng } = req.body;

  if (!image) return res.status(400).json({ error: 'image (base64) is required' });

  // Try Vision API
  let building = null;
  try {
    const landmarks = await detectLandmark(image);
    if (landmarks.length > 0) {
      building = await matchWithDatabase(landmarks);
    }
  } catch (err) {
    // Vision call failed — fall through to GPS fallback
    console.error('Vision API error:', err.message);
  }

  // GPS fallback: find closest building in DB
  if (!building && lat !== undefined && lng !== undefined) {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      const snapshot = await db.collection('buildings').get();
      const allBuildings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      let minDist = Infinity;
      for (const b of allBuildings) {
        if (!b.coordinates) continue;
        const dist = haversineDistance(parsedLat, parsedLng, b.coordinates.lat, b.coordinates.lng);
        if (dist < minDist) {
          minDist = dist;
          building = b;
        }
      }
      if (minDist > 300) building = null; // too far away to be reliable
    }
  }

  if (!building) {
    return res.status(404).json({ error: 'Building not recognized' });
  }

  res.json({ building, method: building ? 'vision' : 'gps_fallback' });
}

module.exports = { recognize };
