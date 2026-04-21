require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const admin = require('firebase-admin');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Firebase init
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

const WIKIPEDIA_API = 'https://en.wikipedia.org/api/rest_v1';
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

async function enrichWithWikipedia(building) {
  const titleGuesses = [building.name, building.shortName].filter(Boolean);
  for (const title of titleGuesses) {
    try {
      const encoded = encodeURIComponent(title);
      const res = await axios.get(`${WIKIPEDIA_API}/page/summary/${encoded}`, { timeout: 5000 });
      if (res.data.extract) {
        return {
          wikipediaExtract: res.data.extract,
          imageUrl: building.imageUrl || res.data.thumbnail?.source || null,
          wikipediaUrl: res.data.content_urls?.desktop?.page || building.wikipediaUrl,
        };
      }
    } catch {
      // try next title
    }
  }
  return {};
}

async function enrichWithOverpass(building) {
  if (!building.coordinates) return {};
  const { lat, lng } = building.coordinates;
  const query = `[out:json];node(around:100,${lat},${lng})["name"];out;`;
  try {
    const res = await axios.post(OVERPASS_API, `data=${encodeURIComponent(query)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 8000,
    });
    const first = res.data?.elements?.[0];
    if (first?.tags) {
      return { osmTags: first.tags };
    }
  } catch {
    // ignore Overpass errors
  }
  return {};
}

async function seed() {
  const dataPath = path.resolve(__dirname, '../data/buildings.json');
  const buildings = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  console.log(`Seeding ${buildings.length} buildings...`);

  for (const building of buildings) {
    process.stdout.write(`  → ${building.name} ... `);

    const [wikiData, osmData] = await Promise.all([
      enrichWithWikipedia(building),
      enrichWithOverpass(building),
    ]);

    const enriched = { ...building, ...wikiData, ...osmData };

    await db.collection('buildings').doc(building.id).set(enriched, { merge: true });
    console.log('done');

    // Be kind to external APIs
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log('\nSeed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
