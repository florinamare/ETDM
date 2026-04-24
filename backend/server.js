require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

const buildingsRouter = require('./src/routes/buildings');
const recognizeRouter = require('./src/routes/recognize');
const userRouter = require('./src/routes/user');
const aiRouter = require('./src/routes/ai');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Debug: compară coordonatele Firebase vs JSON local ─────────────────────
app.get('/debug/coordinates', async (_req, res) => {
  const path = require('path');
  const fs = require('fs');
  const localPath = path.join(__dirname, 'data/buildings.json');
  const local = JSON.parse(fs.readFileSync(localPath, 'utf8'));

  let firebase = [];
  let firebaseError = null;
  try {
    const { db } = require('./src/config/firebase');
    const snap = await db.collection('buildings').get();
    firebase = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    firebaseError = e.message;
  }

  const report = local.map(lb => {
    const fb = firebase.find(f => f.id === lb.id || f.name === lb.name);
    const match = fb ? {
      id: fb.id,
      coordinates: fb.coordinates,
      latDiff: fb.coordinates ? Math.abs(fb.coordinates.lat - lb.coordinates.lat).toFixed(6) : 'N/A',
      lngDiff: fb.coordinates ? Math.abs(fb.coordinates.lng - lb.coordinates.lng).toFixed(6) : 'N/A',
    } : null;
    return {
      name: lb.name,
      local_coords: lb.coordinates,
      firebase_match: match,
      status: !fb ? 'MISSING_IN_FIREBASE' : match.latDiff > 0.001 || match.lngDiff > 0.001 ? 'COORDS_DIFFER' : 'OK',
    };
  });

  res.json({ firebaseError, buildingCount: { local: local.length, firebase: firebase.length }, report });
});

app.use('/buildings', buildingsRouter);
app.use('/recognize', recognizeRouter);
app.use('/user', userRouter);
app.use('/ai', aiRouter);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/docs`);
});

module.exports = app;
