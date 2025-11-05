const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Category', CategorySchema);
