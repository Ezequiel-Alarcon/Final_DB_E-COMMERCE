const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.createFromCart = async (req, res) => {
  const cart = await Cart.findOne({ usuario: req.user._id }).populate('items.producto');
  if (!cart || cart.items.length === 0) return res.status(400).json({ success:false, error:'Carrito vacío' });

  // Verificar stock y calcular totales
  let total = 0;
  for (const i of cart.items) {
    if (i.producto.stock < i.cantidad) return res.status(400).json({ success:false, error:`Stock insuficiente para ${i.producto.nombre}` });
    total += i.cantidad * i.producto.precio;
  }

  // Descontar stock
  for (const i of cart.items) {
    const p = await Product.findById(i.producto._id);
    p.stock -= i.cantidad;
    await p.save();
  }

  const items = cart.items.map(i => ({
    producto: i.producto._id,
    nombre: i.producto.nombre,
    cantidad: i.cantidad,
    precioUnitario: i.producto.precio,
    subtotal: i.cantidad * i.producto.precio
  }));

  const order = await Order.create({
    usuario: req.user._id,
    items,
    total,
    estado: 'pending',
    metodoPago: req.body.metodoPago || 'efectivo'
  });

  // Vaciar carrito
  cart.items = [];
  await cart.save();

  res.status(201).json({ success:true, data: order });
};

exports.myOrders = async (req, res) => {
  const orders = await Order.find({ usuario: req.user._id }).sort({ fecha: -1 });
  res.json({ success:true, data: orders });
};

exports.allOrders = async (req, res) => {
  const orders = await Order.find().populate('usuario', 'nombre email').sort({ fecha: -1 });
  res.json({ success:true, data: orders });
};

exports.changeStatus = async (req, res) => {
  const { estado } = req.body;
  const allowed = ['pending','paid','shipped','delivered','cancelled'];
  if (!allowed.includes(estado)) return res.status(400).json({ success:false, error:'Estado inválido' });
  const order = await Order.findByIdAndUpdate(req.params.id, { estado }, { new: true });
  if (!order) return res.status(404).json({ success:false, error:'Orden no encontrada' });
  res.json({ success:true, data: order });
};

exports.stats = async (req, res) => {
  const stats = await Order.aggregate([
    { $group: { _id: "$estado", total: { $sum: 1 }, monto: { $sum: "$total" } } },
    { $sort: { monto: -1 } }
  ]);
  res.json({ success:true, data: stats });
};
