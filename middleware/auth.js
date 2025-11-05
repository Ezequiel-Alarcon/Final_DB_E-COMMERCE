const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if(!header || !header.startsWith('Bearer ')) return res.status(401).json({ success:false, error:'No token' });
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if(!user) return res.status(401).json({ success:false, error:'Usuario no encontrado' });
    req.user = user;
    next();
  } catch(err) {
    return res.status(401).json({ success:false, error: err.message });
  }
};

const requireRole = (roles = []) => (req, res, next) => {
  if(typeof roles === 'string') roles = [roles];
  if(!req.user) return res.status(401).json({ success:false, error:'No autorizado' });
  if(!roles.includes(req.user.rol)) return res.status(403).json({ success:false, error:'Permisos insuficientes' });
  next();
};

module.exports = { auth, requireRole };
