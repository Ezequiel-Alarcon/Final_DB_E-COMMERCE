const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getMyCart = async (req, res) => {
  let cart = await Cart.findOne({ usuario: req.user._id }).populate('items.producto');
  if (!cart) {
    cart = await Cart.create({ usuario: req.user._id, items: [] });
  }
  res.json({ success:true, data: cart });
};

exports.addItem = async (req, res) => {
  const { productId, cantidad } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success:false, error:'Producto no existe' });

  let cart = await Cart.findOne({ usuario: req.user._id });
  if (!cart) cart = await Cart.create({ usuario: req.user._id, items: [] });

  const idx = cart.items.findIndex(i => i.producto.toString() === productId);
  if (idx >= 0) {
    cart.items[idx].cantidad += Number(cantidad || 1);
  } else {
    cart.items.push({ producto: productId, cantidad: Number(cantidad || 1) });
  }
  cart.actualizadoEn = new Date();
  await cart.save();
  await cart.populate('items.producto');
  res.status(201).json({ success:true, data: cart });
};

exports.updateQty = async (req, res) => {
  const { productId, cantidad } = req.body;
  if (cantidad < 1) return res.status(400).json({ success:false, error:'Cantidad inválida' });
  const cart = await Cart.findOne({ usuario: req.user._id });
  if (!cart) return res.status(404).json({ success:false, error:'Carrito vacío' });
  const item = cart.items.find(i => i.producto.toString() === productId);
  if (!item) return res.status(404).json({ success:false, error:'Producto no está en el carrito' });
  item.cantidad = Number(cantidad);
  cart.actualizadoEn = new Date();
  await cart.save();
  await cart.populate('items.producto');
  res.json({ success:true, data: cart });
};

exports.removeItem = async (req, res) => {
  const { productId } = req.params;
  const cart = await Cart.findOne({ usuario: req.user._id });
  if (!cart) return res.status(404).json({ success:false, error:'Carrito vacío' });
  cart.items = cart.items.filter(i => i.producto.toString() !== productId);
  cart.actualizadoEn = new Date();
  await cart.save();
  await cart.populate('items.producto');
  res.json({ success:true, data: cart });
};

exports.clear = async (req, res) => {
  const cart = await Cart.findOne({ usuario: req.user._id });
  if (!cart) return res.status(404).json({ success:false, error:'Carrito vacío' });
  cart.items = [];
  cart.actualizadoEn = new Date();
  await cart.save();
  res.json({ success:true, data: cart });
};
