const axios = require('axios');
const { OVERPASS_API_URL } = require('../config/constants');

async function fetchNearbyBuildings(lat, lng, radiusMeters) {
  const query = `
    [out:json][timeout:10];
    (
      node["historic"](around:${radiusMeters},${lat},${lng});
      way["historic"](around:${radiusMeters},${lat},${lng});
      node["tourism"="attraction"](around:${radiusMeters},${lat},${lng});
      way["tourism"="attraction"](around:${radiusMeters},${lat},${lng});
      node["amenity"="place_of_worship"](around:${radiusMeters},${lat},${lng});
      way["building"]["name"](around:${radiusMeters},${lat},${lng});
    );
    out center tags;
  `;

  const response = await axios.post(OVERPASS_API_URL, `data=${encodeURIComponent(query)}`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 12000,
  });

  return (response.data?.elements || [])
    .filter((el) => el.tags?.name)
    .map((el) => ({
      osmId: el.id,
      name: el.tags.name,
      lat: el.lat ?? el.center?.lat,
      lng: el.lon ?? el.center?.lon,
      tags: el.tags,
    }));
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = { fetchNearbyBuildings, haversineDistance };
