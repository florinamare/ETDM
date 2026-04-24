const { db } = require('../config/firebase');
const cache = require('../services/cacheService');
const { fetchNearbyBuildings, haversineDistance } = require('../services/overpassService');
const { DEFAULT_NEARBY_RADIUS_METERS } = require('../config/constants');
const path = require('path');
const fs = require('fs');

const LOCAL_BUILDINGS_PATH = path.join(__dirname, '../../data/buildings.json');

function getLocalBuildings() {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_BUILDINGS_PATH, 'utf8'));
  } catch {
    return [];
  }
}

async function getAllBuildings(req, res) {
  const cached = cache.get('buildings:all');
  if (cached) return res.json(cached);

  let buildings;
  try {
    const snapshot = await db.collection('buildings').get();
    buildings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (buildings.length === 0) buildings = getLocalBuildings();
  } catch (err) {
    console.warn('Firebase unavailable, using local data:', err.message);
    buildings = getLocalBuildings();
  }
  cache.set('buildings:all', buildings);
  res.json(buildings);
}

async function getBuildingById(req, res) {
  const { id } = req.params;
  const cacheKey = `buildings:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  let building;
  try {
    const doc = await db.collection('buildings').doc(id).get();
    if (doc.exists) {
      building = { id: doc.id, ...doc.data() };
    }
  } catch (err) {
    console.warn('Firebase unavailable for getBuildingById:', err.message);
  }

  if (!building) {
    const local = getLocalBuildings();
    building = local.find((b) => b.id === id);
  }

  if (!building) return res.status(404).json({ error: 'Building not found' });
  cache.set(cacheKey, building);
  res.json(building);
}

async function getNearbyBuildings(req, res) {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = parseFloat(req.query.radius) || DEFAULT_NEARBY_RADIUS_METERS;

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'lat and lng query params are required' });
  }

  const cacheKey = `buildings:nearby:${lat.toFixed(4)},${lng.toFixed(4)},${radius}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  // First: filter our own DB by distance
  let allDocs;
  try {
    const snapshot = await db.collection('buildings').get();
    allDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (allDocs.length === 0) allDocs = getLocalBuildings();
  } catch (err) {
    console.warn('Firebase unavailable for getNearbyBuildings:', err.message);
    allDocs = getLocalBuildings();
  }
  const ownBuildings = allDocs
    .filter((b) => {
      if (!b.coordinates) return false;
      const dist = haversineDistance(lat, lng, b.coordinates.lat, b.coordinates.lng);
      return dist <= radius;
    })
    .map((b) => ({
      ...b,
      distanceMeters: Math.round(haversineDistance(lat, lng, b.coordinates.lat, b.coordinates.lng)),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  // Fallback: enrich with Overpass if own DB returns nothing
  let result = ownBuildings;
  if (ownBuildings.length === 0) {
    const osmBuildings = await fetchNearbyBuildings(lat, lng, radius);
    result = osmBuildings.map((b) => ({
      id: `osm:${b.osmId}`,
      name: b.name,
      coordinates: { lat: b.lat, lng: b.lng },
      source: 'openstreetmap',
      distanceMeters: Math.round(haversineDistance(lat, lng, b.lat, b.lng)),
    }));
  }

  cache.set(cacheKey, result);
  res.json(result);
}

module.exports = { getAllBuildings, getBuildingById, getNearbyBuildings };
