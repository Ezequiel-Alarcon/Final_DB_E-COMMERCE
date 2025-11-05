const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  cantidad: { type: Number, default: 1, min: 1 },
  subtotal: { type: Number }
}, { _id: false });

const CartSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema],
  activo: { type: Boolean, default: true },
  actualizadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', CartSchema);
