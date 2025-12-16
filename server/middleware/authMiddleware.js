const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Basic authentication middleware
exports.protect = async (req, res, next) => {
  let token = req.headers.authorization;
  
  // Check if token exists and starts with 'Bearer'
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7); // Remove 'Bearer ' prefix
  }
  
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT Decoded:', decoded); // Debug log
    
    // Get user from database to ensure they still exist
    const user = await User.findById(decoded.id || decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: "Token is valid but user no longer exists." });
    }
    
    console.log('User found:', user._id); // Debug log
    
    req.user = {
      id: user._id.toString(), // Ensure it's a string
      name: user.name,
      email: user.email,
      role: user.role,
      isProfileComplete: user.isProfileComplete || false
    };
    
    console.log('req.user set to:', req.user); // Debug log
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token has expired." });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token." });
    } else {
      return res.status(500).json({ message: "Token verification failed." });
    }
  }
};

// Admin-only middleware
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: "Access denied. Admin privileges required." 
    });
  }
};

// User-only middleware
exports.userOnly = (req, res, next) => {
  if (req.user && req.user.role === 'user') {
    next();
  } else {
    res.status(403).json({ 
      message: "Access denied. User access only." 
    });
  }
};

// Profile completion check middleware
exports.requireCompleteProfile = (req, res, next) => {
  if (req.user && req.user.isProfileComplete) {
    next();
  } else {
    res.status(400).json({ 
      message: "Profile incomplete. Please complete your profile first.",
      redirectTo: "/profile/setup"
    });
  }
};