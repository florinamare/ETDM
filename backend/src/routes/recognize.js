const router = require('express').Router();
const { recognize } = require('../controllers/recognizeController');

/**
 * @openapi
 * /recognize:
 *   post:
 *     summary: Identifică o clădire dintr-o imagine
 *     tags: [Recognition]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 description: Imagine în format base64
 *               lat:
 *                 type: number
 *                 description: Latitudine GPS (fallback)
 *               lng:
 *                 type: number
 *                 description: Longitudine GPS (fallback)
 *     responses:
 *       200:
 *         description: Clădire identificată
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 building:
 *                   $ref: '#/components/schemas/Building'
 *                 method:
 *                   type: string
 *                   enum: [vision, gps_fallback]
 *       400:
 *         description: Parametri lipsă
 *       404:
 *         description: Clădire nerecunoscută
 */
router.post('/', recognize);

module.exports = router;
