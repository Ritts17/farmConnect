// import jwt from 'jsonwebtoken';
const jwt  = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || '221122';

function generateToken(userId, role) {
  return jwt.sign({ userId, role }, SECRET, { expiresIn: '24h' });
}

function validateToken(req, res, next) {
  try {
    let token = null;
    
    // Check cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // Check Authorization header as fallback
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid token' });
  }
}


function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
}

module.exports ={
  generateToken,
  validateToken,
  authorizeRoles
}