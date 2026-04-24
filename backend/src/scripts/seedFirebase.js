/**
 * Seed script — curăță colecția "buildings" și o populează de la zero cu
 * datele din backend/data/buildings.json (single source of truth).
 *
 * Rulare: node src/scripts/seedFirebase.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { db } = require('../config/firebase');
const buildings = require('../../data/buildings.json');

async function wipeCollection() {
  const snap = await db.collection('buildings').get();
  if (snap.empty) return 0;
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snap.docs.length;
}

async function seed() {
  console.log('→ curăț colecția "buildings"...');
  const deleted = await wipeCollection();
  console.log(`  ${deleted} documente vechi șterse`);

  console.log(`→ încarc ${buildings.length} clădiri...`);
  const batch = db.batch();
  for (const building of buildings) {
    const { id, ...data } = building;
    const ref = db.collection('buildings').doc(id);
    batch.set(ref, data);
  }
  await batch.commit();

  console.log('✓ Seed finalizat cu succes.');
  const check = await db.collection('buildings').get();
  console.log(`  Firestore conține acum ${check.docs.length} clădiri:`);
  check.docs.forEach((d) => console.log(`   - ${d.id}`));
  process.exit(0);
}

seed().catch((err) => {
  console.error('✗ Seed eșuat:', err);
  process.exit(1);
});
