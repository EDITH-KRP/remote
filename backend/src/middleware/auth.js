const jwt = require('jsonwebtoken');

const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, ...value] = cookie.split('=');
    acc[key.trim()] = decodeURIComponent(value.join('=').trim());
    return acc;
  }, {});
};

const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  
  if (!token && req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies.token;
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = decoded.sub; // we used sub in python
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const adminMiddleware = async (req, res, next) => {
  const { User } = require('../models');
  try {
    const user = await User.findByPk(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { authMiddleware, adminMiddleware };
