const express = require('express');
const router = express.Router();

const OpenAI = require('openai');
const { inferPriority } = require('../utils/priority');

const ai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL, // e.g. https://api.groq.com/openai
});

// POST /api/ai/extract
router.post('/extract', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) return res.status(400).json({ err: 'message is required' });

    const rulePriority = inferPriority(message);

    let data = null;
    try {
      const system =
        'Return STRICT JSON only with keys: contact{name?,email?,phone?}, ' +
        'channel(email|whatsapp|sms|chat|unknown), language, intent, ' +
        'priority(low|medium|high), entities[{type,value}], reply_suggestion. No commentary.';
      const r = await ai.chat.completions.create({
        model: process.env.AI_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `Message:\n${message}\n\nJSON only.` }
        ],
      });
      data = JSON.parse(r.choices?.[0]?.message?.content || '{}');
    } catch { /* fall back below */ }

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
