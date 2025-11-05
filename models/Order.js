const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  nombre: String,
  cantidad: { type: Number, default: 1 },
  precioUnitario: { type: Number, required: true },
  subtotal: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  total: { type: Number, required: true },
  estado: { type: String, enum: ['pending','paid','shipped','delivered','cancelled'], default: 'pending' },
  metodoPago: String,
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
