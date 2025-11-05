const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  marca: String,
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  imagenes: [String],
  reseñasCount: { type: Number, default: 0 },
  promedioCalificacion: { type: Number, default: 0 },
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
