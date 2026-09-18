const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db');

const router = express.Router();

// In-memory CSRF token store (expires after 5 minutes)
const csrfTokens = new Map();
const CSRF_EXPIRY_MS = 5 * 60 * 1000;

// Cleanup expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of csrfTokens) {
    if (now > expiry) csrfTokens.delete(token);
  }
}, 60000);

// Generate CSRF token - must be called before login
router.get('/csrf', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.set(token, Date.now() + CSRF_EXPIRY_MS);
  res.json({ csrfToken: token });
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: true, message: 'Username and password are required' });
  }

  if (username.length > 100) {
    return res.status(400).json({ error: true, message: 'Username must be 100 characters or less' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: true, message: 'Username already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, hash]);

    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password, csrfToken } = req.body;

  // Validate CSRF token
  if (!csrfToken || !csrfTokens.has(csrfToken)) {
    return res.status(403).json({ error: true, message: 'Invalid or missing CSRF token' });
  }
  
  // Check if token expired
  if (Date.now() > csrfTokens.get(csrfToken)) {
    csrfTokens.delete(csrfToken);
    return res.status(403).json({ error: true, message: 'CSRF token expired' });
  }
  
  // Delete token after use (one-time use)
  csrfTokens.delete(csrfToken);

  if (!username || !password) {
    return res.status(400).json({ error: true, message: 'Username and password are required' });
  }

  try {
    const result = await pool.query('SELECT id, username, password_hash FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: true, message: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: true, message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'tasks-jwt-secret-key');

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: true, message: 'Internal server error' });
  }
});

module.exports = router;
