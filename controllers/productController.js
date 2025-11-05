const Product = require('../models/Product');
const Review = require('../models/Review');

exports.create = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success:true, data: product });
  } catch (err) {
    res.status(400).json({ success:false, error: err.message });
  }
};

exports.getAll = async (req, res) => {
  const { min, max, marca } = req.query;
  const filtro = {};
  if (min) filtro.precio = { ...filtro.precio, $gte: Number(min) };
  if (max) filtro.precio = { ...filtro.precio, $lte: Number(max) };
  if (marca) filtro.marca = marca;
  const productos = await Product.find(filtro).populate('categoria');
  res.json({ success:true, data: productos });
};

exports.getOne = async (req, res) => {
  const p = await Product.findById(req.params.id).populate('categoria');
  if (!p) return res.status(404).json({ success:false, error:'No existe' });
  res.json({ success:true, data: p });
};

exports.update = async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!p) return res.status(404).json({ success:false, error:'No existe' });
  res.json({ success:true, data: p });
};

exports.remove = async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ success:false, error:'No existe' });
  res.json({ success:true, data: { deleted: true }});
};

exports.patchStock = async (req, res) => {
  const { delta } = req.body; // puede ser positivo o negativo
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ success:false, error:'No existe' });
  p.stock = Math.max(0, p.stock + Number(delta || 0));
  await p.save();
  res.json({ success:true, data: p });
};

exports.top = async (req, res) => {
  const top = await Review.aggregate([
    { $group: { _id: "$producto", count: { $sum: 1 }, avgRating: { $avg: "$calificacion" } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "producto" } },
    { $unwind: "$producto" },
    { $lookup: { from: "categories", localField: "producto.categoria", foreignField: "_id", as: "categoria" } },
    { $unwind: "$categoria" },
    { $project: { producto: 1, categoria: "$categoria.nombre", count:1, avgRating:1 } }
  ]);
  res.json({ success:true, data: top });
};
