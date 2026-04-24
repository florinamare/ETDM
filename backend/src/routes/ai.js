const router = require('express').Router();
const axios = require('axios');
const { askAI, voiceAI } = require('../controllers/aiController');

const AIAR_URL = process.env.AIAR_URL || 'http://localhost:5002';

/**
 * @openapi
 * /ai/ask:
 *   post:
 *     summary: Răspuns text AI despre o clădire
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question, building]
 *             properties:
 *               question: { type: string }
 *               building: { type: object }
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role: { type: string, enum: [user, assistant] }
 *                     content: { type: string }
 *     responses:
 *       200:
 *         description: Răspuns AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer: { type: string }
 *                 suggestions: { type: array, items: { type: string } }
 */
router.post('/ask', askAI);

/**
 * @openapi
 * /ai/voice:
 *   post:
 *     summary: Răspuns AI + audio TTS (base64 mp3)
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question, building]
 *             properties:
 *               question: { type: string }
 *               building: { type: object }
 *               history: { type: array }
 *     responses:
 *       200:
 *         description: Răspuns AI + audio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer: { type: string }
 *                 audio_b64: { type: string, description: 'MP3 base64, absent dacă TTS nu e disponibil' }
 *                 suggestions: { type: array, items: { type: string } }
 */
router.post('/voice', voiceAI);

// Proxy STT spre AIAR (Gemini transcriere audio)
router.post('/stt', async (req, res) => {
  const { audio_b64, mime_type } = req.body;
  if (!audio_b64) return res.status(400).json({ error: 'audio_b64 lipsește' });
  try {
    const response = await axios.post(
      `${AIAR_URL}/stt/transcribe`,
      { audio_b64, mime_type: mime_type || 'audio/mp4' },
      { timeout: 20000 }
    );
    return res.json(response.data);
  } catch (_err) {
    return res.json({ text: '' });
  }
});

module.exports = router;
