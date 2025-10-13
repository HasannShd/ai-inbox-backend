const dotenv = require('dotenv'); dotenv.config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('morgan');

/* ---------- DB ---------- */
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});
mongoose.connection.on('error', err => console.error('Mongo error:', err.message));

/* ---------- Core middleware ---------- */
app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',') }));
app.use(express.json({ limit: '1mb' }));
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(logger('dev'));

/* ---------- Health ---------- */
app.get('/health', (_req, res) => res.json({ ok: true, service: 'ai-inbox', version: '0.1.0' }));

/* ---------- Routes ---------- */
app.use('/api/ai', require('./controllers/ai'));
app.use('/api/tickets', require('./controllers/tickets'));

/* ---------- 404 + error ---------- */
app.use((req, res) => res.status(404).json({ err: 'Not found' }));
app.use((err, _req, res, _next) => res.status(err.status || 500).json({ err: err.message || 'Server error' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`The express app is ready on :${PORT}`));
