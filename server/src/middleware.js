const db = require('./database');

/**
 * Authentication middleware
 * Extracts and validates session token from Authorization header
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err = new Error('Missing or invalid authorization header');
      err.status = 401;
      throw err;
    }
    
    const token = authHeader.substring(7);
    
    // Decode token (format: userId:timestamp in base64)
    let decoded;
    try {
      decoded = Buffer.from(token, 'base64').toString('utf8');
    } catch (err) {
      const authErr = new Error('Invalid token format');
      authErr.status = 401;
      throw authErr;
    }
    
    const [userId] = decoded.split(':');
    
    // Get user from database
    const user = db.getUserById(userId);
    
    if (!user) {
      const err = new Error('User not found');
      err.status = 401;
      throw err;
    }
    
    // Attach user to request
    req.user = user;
    req.sessionToken = token;
    
    next();
  } catch (err) {
    if (!err.status) err.status = 401;
    next(err);
  }
}

/**
 * Validate email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  authMiddleware,
  validateEmail
};
