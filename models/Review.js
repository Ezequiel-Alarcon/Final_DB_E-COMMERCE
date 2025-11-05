const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  calificacion: { type: Number, required: true, min: 1, max: 5 },
  comentario: String,
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);
