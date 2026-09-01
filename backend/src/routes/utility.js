const express = require('express');
const pool = require('../db');
const { resetAndReseed } = require('../seed');

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
