// backend/middleware/auth.js

// Simple auth middleware for your existing structure
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // For now, allow requests without token (you can modify this based on your needs)
      req.user = null;
      return next();
    }
    
    // Since you're using a simple login system without JWT, we'll skip token verification
    // You can implement proper JWT verification here if needed
    req.user = null;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    req.user = null;
    next();
  }
};

// Admin auth middleware
const adminAuth = (req, res, next) => {
  // For now, allow all requests (you can modify based on your user role)
  // In your actual implementation, you would check if req.user.role === 'admin'
  next();
};

module.exports = { auth, adminAuth };