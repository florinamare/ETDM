const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { getDiscovered, markDiscovered } = require('../controllers/userController');

/**
 * @openapi
 * /user/discovered:
 *   get:
 *     summary: Lista clădirilor descoperite de utilizatorul curent
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista descoperirilor
 *       401:
 *         description: Neautorizat
 */
router.get('/discovered', requireAuth, getDiscovered);

/**
 * @openapi
 * /user/discovered/{buildingId}:
 *   post:
 *     summary: Marchează o clădire ca descoperită
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: buildingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Clădire marcată ca descoperită
 *       401:
 *         description: Neautorizat
 *       404:
 *         description: Clădire negăsită
 */
router.post('/discovered/:buildingId', requireAuth, markDiscovered);

module.exports = router;
