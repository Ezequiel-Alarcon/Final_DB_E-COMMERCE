// Importo los modelos que voy a usar
import Product from '../models/Product.js';
import Category from '../models/Category.js'; 
import Review from '../models/Review.js';

// --- CREAR UN PRODUCTO (SOLO ADMIN) ---
export const createProduct = async (req, res, next) => {
    const { nombre, descripcion, categoria_id, precio, stock } = req.body;

    try {
        const category = await Category.findById(categoria_id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Esa categoría no existe' });
        }

        const product = new Product({
            nombre,
            descripcion,
            categoria_id,
            precio,
            stock
            // (Los campos de reseñas se ponen solos en 0)
        });

        const createdProduct = await product.save();

        res.status(201).json({ success: true, data: createdProduct });

    } catch (error) {
        next(error);
    }
};

// --- OBTENER TODOS LOS PRODUCTOS (RUTA PÚBLICA) ---
export const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find().populate('categoria_id', 'nombre');

        res.status(200).json({ success: true, data: products });

    } catch (error) {
        next(error);
    }
};

// --- OBTENER UN SOLO PRODUCTO (RUTA PÚBLICA) ---
export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('categoria_id', 'nombre');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        res.status(200).json({ success: true, data: product });

    } catch (error) {
        next(error);
    }
};

// --- ACTUALIZAR UN PRODUCTO (SOLO ADMIN) ---
export const updateProduct = async (req, res, next) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Opciones para que me devuelva el nuevo
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        res.json({ success: true, data: updatedProduct });

    } catch (error) {
        next(error);
    }
};

// --- ELIMINAR UN PRODUCTO (SOLO ADMIN) ---
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        // (Acá faltaría borrar las reseñas de este producto, pero es más lío)
        
        res.json({ success: true, message: 'Producto eliminado' });

    } catch (error) {
        next(error);
    }
};

// --- ACTUALIZAR SOLO EL STOCK (SOLO ADMIN) ---
export const updateStock = async (req, res, next) => {
    const { stock } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
        return res.status(400).json({ success: false, message: 'El stock tiene que ser un número >= 0' });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { stock: stock } },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        res.json({ success: true, data: updatedProduct });

    } catch (error) {
        next(error);
    }
};

// --- FILTRAR PRODUCTOS (RUTA PÚBLICA) ---
export const filterProducts = async (req, res, next) => {
    try {
        const { min, max, marca } = req.query;
        const filtro = {};

        if (min || max) {
            filtro.precio = {};
            if (min) filtro.precio.$gte = Number(min);
            if (max) filtro.precio.$lte = Number(max);
        }

        if (marca) {
            filtro.nombre = new RegExp(marca, 'i');
        }

        const products = await Product.find(filtro).populate('categoria_id', 'nombre');

        res.status(200).json({ success: true, data: products });

    } catch (error) {
        next(error);
    }
};

// --- OBTENER TOP PRODUCTOS MÁS RESEÑADOS (RUTA PÚBLICA) ---
export const getTopReviewedProducts = async (req, res, next) => {
    try {
        const topProducts = await Review.aggregate([
            {
                $group: {
                    _id: "$producto_id", 
                    totalResenas: { $sum: 1 } 
                }
            },
            {
                $sort: { totalResenas: -1 }
            },
            {
                $limit: 5 
            },
            {
                $lookup: {
                    from: "products", 
                    localField: "_id", 
                    foreignField: "_id",
                    as: "productoData"
                }
            },
            {
                $unwind: "$productoData"
            },
            {
                $project: {
                    _id: 0, 
                    producto: "$productoData.nombre",
                    productoId: "$productoData._id",
                    totalResenas: 1 
                }
            }
        ]);
        
        res.status(200).json({ success: true, data: topProducts });

    } catch (error) {
        next(error);
    }
};