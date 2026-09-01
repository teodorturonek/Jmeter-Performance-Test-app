const express = require('express');
const pool = require('../db');
const { resetAndReseed } = require('../seed');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/api/slow', (req, res) => {
  const delay = Math.min(Math.max(0, parseInt(req.query.delay, 10) || 0), 10000);
  setTimeout(() => {
    res.json({ delayed: delay });
  }, delay);
});

const ERROR_STATUSES = [500, 503, 429];

router.get('/api/flaky', authMiddleware, (req, res) => {
  const parsed = parseInt(req.query.error_rate, 10);
  const errorRate = (isNaN(parsed) || parsed < 0 || parsed > 100) ? 100 : parsed;

  if (Math.random() * 100 < errorRate) {
    const status = ERROR_STATUSES[Math.floor(Math.random() * ERROR_STATUSES.length)];
    return res.status(status).json({ error: true, message: `Simulated error (status ${status})` });
  }

  res.json({ status: 'ok', error_rate: errorRate });
});

router.post('/api/reset-and-reseed', async (req, res) => {
  try {
    await resetAndReseed(pool);
    res.json({ message: 'Database reset and reseeded successfully' });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: true, message: 'Failed to reset database' });
  }
});

module.exports = router;
