const router = require('express').Router();
const { getAllBuildings, getBuildingById, getNearbyBuildings } = require('../controllers/buildingsController');

/**
 * @openapi
 * /buildings:
 *   get:
 *     summary: Returnează toate clădirile
 *     tags: [Buildings]
 *     responses:
 *       200:
 *         description: Lista tuturor clădirilor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Building'
 */
router.get('/', getAllBuildings);

/**
 * @openapi
 * /buildings/nearby:
 *   get:
 *     summary: Clădiri în raza X metri față de coordonate
 *     tags: [Buildings]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: lng
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: radius
 *         schema: { type: number, default: 500 }
 *     responses:
 *       200:
 *         description: Lista clădirilor apropiate
 */
router.get('/nearby', getNearbyBuildings);

/**
 * @openapi
 * /buildings/{id}:
 *   get:
 *     summary: Returnează o clădire după ID
 *     tags: [Buildings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detalii clădire
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Building'
 *       404:
 *         description: Clădire negăsită
 */
router.get('/:id', getBuildingById);

module.exports = router;
