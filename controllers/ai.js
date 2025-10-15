const express = require('express');
const router = express.Router();

const OpenAI = require('openai');
const { inferPriority } = require('../utils/priority');

// ⬇️ NEW: read the prompt file once (cached)
const fs = require('fs/promises');
const path = require('path');
let SYSTEM_PROMPT = null;
async function getSystemPrompt() {
  if (SYSTEM_PROMPT) return SYSTEM_PROMPT;
  try {
    const p = path.join(__dirname, '..', 'prompts', 'extract.md');
    SYSTEM_PROMPT = await fs.readFile(p, 'utf8');
  } catch (e) {
    // fallback if file missing
    SYSTEM_PROMPT =
      'Return STRICT JSON only with keys: contact{name?,email?,phone?}, ' +
      'channel(email|whatsapp|sms|chat|unknown), language, intent, ' +
      'priority(low|medium|high), entities[{type,value}], reply_suggestion. No commentary.';
  }
  return SYSTEM_PROMPT;
}

const ai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

// POST /api/ai/extract
router.post('/extract', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) return res.status(400).json({ err: 'message is required' });

    const rulePriority = inferPriority(message);

    let data = null;
    try {
      // ⬇️ use prompt file as system message
      const system = await getSystemPrompt();

      const r = await ai.chat.completions.create({
        model: process.env.AI_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `Message:\n${message}\n\nSTRICT JSON only.` }
        ],
      });
      data = JSON.parse(r.choices?.[0]?.message?.content || '{}');
    } catch (e) { /* fall back below */ }   // ⬅️ keep your flow, just bind the error

    if (!data || typeof data !== 'object') {
      data = {
        contact: {}, channel: 'unknown', language: 'en',
        intent: '', priority: rulePriority, entities: [],
        reply_suggestion: 'Thanks for reaching out — we’ll help you shortly.'
      };
    } else if (!data.priority) {
      data.priority = rulePriority;
    }

    data.message_raw = message;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
});

module.exports = router;
