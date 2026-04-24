const axios = require('axios');

const AIAR_URL = process.env.AIAR_URL || 'http://localhost:5002';
const AIAR_TIMEOUT = 15000;

// ─── Rule-based fallback (Node.js) ────────────────────────────────────────────

const INTENT_KEYWORDS = {
  year:      ['când', 'an', 'construit', 'ridic', 'vechi', 'perioad', 'epoc'],
  architect: ['arhitect', 'proiectat', 'creat', 'autor', 'cine'],
  style:     ['stil', 'arhitectur', 'design', 'materiale', 'aspect'],
  history:   ['poveste', 'istori', 'eveniment', 'semnific', 'trecut'],
  facts:     ['fapt', 'curiozitate', 'știai', 'interesant', 'special'],
};

function detectIntent(question) {
  const q = question.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(k => q.includes(k))) return intent;
  }
  return 'general';
}

function getFact(building, idx = 0) {
  const facts = building.facts || [];
  return facts.length > 0 ? facts[idx % facts.length] : '';
}

function blurbShort(building) {
  const b = building.blurb || '';
  return b.split('.')[0].trim() + (b.includes('.') ? '.' : '');
}

const TEMPLATES = {
  year:      b => `${b.name} a fost construit în ${b.year}. ${getFact(b, 0)}`,
  architect: b => `Arhitectul ${b.architect} a proiectat ${b.name} în stil ${b.style}. ${getFact(b, 1)}`,
  style:     b => `${b.name} este un exemplu de arhitectură ${b.style}. ${getFact(b, 0)}`,
  history:   b => `${blurbShort(b)} ${getFact(b, 0)}`,
  facts:     b => `Iată un fapt fascinant despre ${b.name}: ${getFact(b, 0)}`,
  general:   b => `${blurbShort(b)} ${getFact(b, 1)}`,
};

function ruleBasedAnswer(question, building) {
  const intent = detectIntent(question);
  const fn = TEMPLATES[intent] || TEMPLATES.general;
  return fn(building).replace(/\s{2,}/g, ' ').trim();
}

const DEFAULT_SUGGESTIONS = [
  'Când a fost construit?',
  'Cine l-a proiectat?',
  'Ce stil arhitectural are?',
];

const SUGGESTIONS_BY_TAG = {
  'Monument Istoric':       ['Cum a supraviețuit timpului?', 'Ce evenimente istorice s-au petrecut aici?', 'De ce a fost ales acest stil?'],
  'Patrimoniu UNESCO':      ['De ce a primit statutul UNESCO?', 'Ce îl face unic?', 'Cum este protejat?'],
  'Clădire Administrativă': ['Ce funcții îndeplinește astăzi?', 'Cât a durat construcția?', 'Care e povestea din spatele ei?'],
};

function getSuggestions(building) {
  return SUGGESTIONS_BY_TAG[building.tag] || DEFAULT_SUGGESTIONS;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

async function askAI(req, res) {
  const { question, building, history = [] } = req.body;
  if (!question || !building) {
    return res.status(400).json({ error: 'question și building sunt obligatorii' });
  }

  try {
    const response = await axios.post(
      `${AIAR_URL}/ai/ask`,
      { question, building, history },
      { timeout: AIAR_TIMEOUT },
    );
    return res.json(response.data);
  } catch (_err) {
    // AIAR indisponibil — fallback local
    const answer = ruleBasedAnswer(question, building);
    return res.json({ answer, suggestions: getSuggestions(building), source: 'node-fallback' });
  }
}

async function voiceAI(req, res) {
  const { question, building, history = [], voice } = req.body;
  if (!question || !building) {
    return res.status(400).json({ error: 'question și building sunt obligatorii' });
  }

  try {
    const response = await axios.post(
      `${AIAR_URL}/ai/voice`,
      { question, building, history, voice },
      { timeout: AIAR_TIMEOUT },
    );
    return res.json(response.data);
  } catch (_err) {
    // AIAR indisponibil — răspuns text fără audio
    const answer = ruleBasedAnswer(question, building);
    return res.json({ answer, audio_b64: null, suggestions: getSuggestions(building), source: 'node-fallback' });
  }
}

module.exports = { askAI, voiceAI };
