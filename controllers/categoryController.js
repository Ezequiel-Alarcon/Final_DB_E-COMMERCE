const Category = require('../models/Category');
const Product = require('../models/Product');

exports.create = async (req, res) => {
  try {
    const c = await Category.create(req.body);
    res.status(201).json({ success:true, data: c });
  } catch (err) {
    res.status(400).json({ success:false, error: err.message });
  }
};

exports.getAll = async (req, res) => {
  const cats = await Category.find();
  res.json({ success:true, data: cats });
};

exports.update = async (req, res) => {
  const c = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!c) return res.status(404).json({ success:false, error:'No existe' });
  res.json({ success:true, data: c });
};

exports.remove = async (req, res) => {
  const c = await Category.findByIdAndDelete(req.params.id);
  if (!c) return res.status(404).json({ success:false, error:'No existe' });
  res.json({ success:true, data: { deleted: true }});
};

exports.stats = async (req, res) => {
  const stats = await Product.aggregate([
    { $group: { _id: "$categoria", total: { $sum: 1 } } },
    { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "categoria" } },
    { $unwind: "$categoria" },
    { $project: { categoria: "$categoria.nombre", total:1 } }
  ]);
  res.json({ success:true, data: stats });
};
