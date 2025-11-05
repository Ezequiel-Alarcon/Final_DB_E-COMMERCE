const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (user) => {
  return jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
};

exports.register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success:false, error: 'El email ya está registrado' });
    const user = new User({ nombre, email, password, rol });
    await user.save();
    res.status(201).json({ success:true, data: { id: user._id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch(err) {
    res.status(400).json({ success:false, error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if(!user) return res.status(401).json({ success:false, error:'Credenciales inválidas' });
    const ok = await user.comparePassword(password);
    if(!ok) return res.status(401).json({ success:false, error:'Credenciales inválidas' });
    const token = signToken(user);
    res.json({ success:true, data: { token } });
  } catch(err) {
    res.status(500).json({ success:false, error: err.message });
  }
};

exports.me = async (req, res) => {
  res.json({ success:true, data: { id: req.user._id, nombre: req.user.nombre, email: req.user.email, rol: req.user.rol } });
};

exports.listUsers = async (req, res) => {
  const users = await User.find().select('nombre email rol createdAt');
  res.json({ success:true, data: users });
};
