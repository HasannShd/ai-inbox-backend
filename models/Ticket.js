const mongoose = require('mongoose');
const Joi = require('joi');

/* ---------- Mongoose Schema ---------- */
const EntitySchema = new mongoose.Schema(
  { type: String, value: String },
  { _id: false }
);

const TicketSchema = new mongoose.Schema(
  {
    status:   { type: String, enum: ['open', 'closed'], default: 'open', index: true },
    contact:  { name: String, email: String, phone: String },
    channel:  { type: String, enum: ['email','whatsapp','sms','chat','unknown'], default: 'unknown' },
    language: { type: String, default: 'en', index: true },
    intent:   { type: String, default: '' },
    priority: { type: String, enum: ['low','medium','high'], default: 'low', index: true },
    entities: [EntitySchema],
    message_raw:      { type: String, required: true },
    reply_suggestion: { type: String, default: '' }
  },
  { timestamps: true }
);

// text search on intent + raw message
TicketSchema.index({ intent: 'text', message_raw: 'text' });

// Make `_id` -> `id` and hide internals (like your Evently models)
TicketSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Ticket = mongoose.model('Ticket', TicketSchema);

/* ---------- Joi Schema (same file) ---------- */
const entityJoi = Joi.object({
  type: Joi.string().required(),
  value: Joi.string().required()
});

const validateUpsert = Joi.object({
  status: Joi.string().valid('open','closed').default('open'),
  contact: Joi.object({
    name: Joi.string().allow(''),
    email: Joi.string().email().allow(''),
    phone: Joi.string().allow('')
  }).default({}),
  channel: Joi.string().valid('email','whatsapp','sms','chat','unknown').default('unknown'),
  language: Joi.string().default('en'),
  intent: Joi.string().allow('').default(''),
  priority: Joi.string().valid('low','medium','high').default('low'),
  entities: Joi.array().items(entityJoi).default([]),
  message_raw: Joi.string().required(),
  reply_suggestion: Joi.string().allow('').default('')
});

module.exports = { Ticket, validateUpsert };
