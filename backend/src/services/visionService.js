const axios = require('axios');
const crypto = require('crypto');
const cache = require('./cacheService');
const { GOOGLE_VISION_API_URL, VISION_CACHE_TTL_SECONDS } = require('../config/constants');

function imageHash(base64) {
  return crypto.createHash('sha256').update(base64.slice(0, 1000)).digest('hex');
}

async function detectLandmark(base64Image) {
  const hash = imageHash(base64Image);
  const cacheKey = `vision:${hash}`;

  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  const response = await axios.post(
    `${GOOGLE_VISION_API_URL}?key=${process.env.GOOGLE_VISION_API_KEY}`,
    {
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: 'LANDMARK_DETECTION', maxResults: 5 }],
        },
      ],
    }
  );

  const annotations = response.data?.responses?.[0]?.landmarkAnnotations || [];
  const result = annotations.map((a) => ({
    name: a.description,
    score: a.score,
    locations: a.locations?.map((l) => ({
      lat: l.latLng?.latitude,
      lng: l.latLng?.longitude,
    })) || [],
  }));

  cache.set(cacheKey, result, VISION_CACHE_TTL_SECONDS);
  return result;
}

module.exports = { detectLandmark };
