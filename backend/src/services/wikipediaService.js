const axios = require('axios');
const { WIKIPEDIA_API_URL } = require('../config/constants');

async function fetchSummary(title) {
  try {
    const encoded = encodeURIComponent(title);
    const response = await axios.get(`${WIKIPEDIA_API_URL}/page/summary/${encoded}`, {
      timeout: 5000,
    });
    return {
      extract: response.data.extract,
      thumbnail: response.data.thumbnail?.source || null,
      url: response.data.content_urls?.desktop?.page || null,
    };
  } catch {
    return null;
  }
}

module.exports = { fetchSummary };
