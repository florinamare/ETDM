const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

async function getDiscovered(req, res) {
  const userId = req.user.uid;
  const snapshot = await db
    .collection('users')
    .doc(userId)
    .collection('discovered')
    .orderBy('discoveredAt', 'desc')
    .get();

  const discovered = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.json(discovered);
}

async function markDiscovered(req, res) {
  const userId = req.user.uid;
  const { buildingId } = req.params;

  const buildingRef = db.collection('buildings').doc(buildingId);
  const buildingDoc = await buildingRef.get();
  if (!buildingDoc.exists) {
    return res.status(404).json({ error: 'Building not found' });
  }

  await db
    .collection('users')
    .doc(userId)
    .collection('discovered')
    .doc(buildingId)
    .set({ buildingId, discoveredAt: FieldValue.serverTimestamp() }, { merge: true });

  res.status(201).json({ buildingId, status: 'discovered' });
}

module.exports = { getDiscovered, markDiscovered };
