const express = require('express');
const router = express.Router();

const { Ticket, validateUpsert } = require('../models/Ticket');
const validate = require('../middleware/validate');

// GET /api/tickets?q=&status=&priority=&language=
router.get('/', async (req, res) => {
  try {
    const { q = '', status = '', priority = '', language = '' } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (language) filter.language = language;
    if (q) filter.$text = { $search: q };

    const items = await Ticket.find(filter).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({ items, count: items.length });
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
});

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  try {
    const t = await Ticket.findById(req.params.id);
    if (!t) return res.status(404).json({ err: 'Ticket not found' });
    return res.status(200).json(t);
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
});

// POST /api/tickets
router.post('/', async (req, res) => {
  try {
    const { error, value } = validateUpsert.validate(req.body, { abortEarly:false, stripUnknown:true });
    if (error) return res.status(400).json({ err: error.details.map(d => d.message).join(', ') });

    const created = await Ticket.create(value);
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
});

// PATCH /api/tickets/:id
router.patch('/:id', async (req, res) => {
  try {
    const { error, value } = validateUpsert.validate(req.body, { abortEarly:false, stripUnknown:true });
    if (error) return res.status(400).json({ err: error.details.map(d => d.message).join(', ') });

    const updated = await Ticket.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!updated) return res.status(404).json({ err: 'Ticket not found' });
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
});

// DELETE /api/tickets/:id
router.delete('/:id', async (req, res) => {
  try {
    const found = await Ticket.findById(req.params.id);
    if (!found) return res.status(404).json({ err: 'Ticket not found' });

    await Ticket.findByIdAndDelete(req.params.id);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
});

module.exports = router;
