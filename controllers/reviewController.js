const Review = require('../models/Review');
const Order = require('../models/Order');

exports.create = async (req, res) => {
  const { producto, calificacion, comentario } = req.body;
  // validar compra previa
  const order = await Order.findOne({ usuario: req.user._id, "items.producto": producto });
  if (!order) return res.status(403).json({ success:false, error:'Solo puedes reseñar productos que compraste' });
  const r = await Review.create({ usuario: req.user._id, producto, calificacion, comentario });
  res.status(201).json({ success:true, data: r });
};

exports.byProduct = async (req, res) => {
  const revs = await Review.find({ producto: req.params.productId }).populate('usuario', 'nombre email');
  res.json({ success:true, data: revs });
};

exports.top = async (req, res) => {
  const agg = await Review.aggregate([
    { $group: { _id: "$producto", avgRating: { $avg: "$calificacion" }, count: { $sum: 1 } } },
    { $match: { count: { $gte: 2 } } },
    { $sort: { avgRating: -1, count: -1 } },
    { $limit: 10 }
  ]);
  res.json({ success:true, data: agg });
};
