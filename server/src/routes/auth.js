const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const { authMiddleware, validateEmail } = require('../middleware');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    // Validation
    if (!email || !password || !name) {
      const err = new Error('Missing required fields: email, password, name');
      err.status = 400;
      throw err;
    }
    
    if (!validateEmail(email)) {
      const err = new Error('Invalid email format');
      err.status = 400;
      throw err;
    }
    
    if (password.length < 6) {
      const err = new Error('Password must be at least 6 characters');
      err.status = 400;
      throw err;
    }
    
    // Check if user exists
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      const err = new Error('User already exists');
      err.status = 409;
      throw err;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await db.createUser({
      email,
      password: hashedPassword,
      name,
      role: 'user'
    });
    
    // Remove password from response
    const { password: _, ...userResponse } = user;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Login user and return session token
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      const err = new Error('Missing required fields: email, password');
      err.status = 400;
      throw err;
    }
    
    // Find user
    const user = db.getUserByEmail(email);
    if (!user) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }
    
    // Create session token (simple base64 encoding for demo)
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    
    // Remove password from response
    const { password: _, ...userResponse } = user;
    
    res.json({
      message: 'Login successful',
      sessionToken,
      user: userResponse
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 * Logout user (invalidate session)
 */
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    // In a real app, you'd invalidate the session token here
    res.json({
      message: 'Logged out successfully'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authMiddleware, (req, res) => {
  const { password: _, ...userResponse } = req.user;
  res.json({
    user: userResponse
  });
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      const err = new Error('Name is required');
      err.status = 400;
      throw err;
    }
    
    const updatedUser = await db.updateUser(req.user.id, { name });
    const { password: _, ...userResponse } = updatedUser;
    
    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
