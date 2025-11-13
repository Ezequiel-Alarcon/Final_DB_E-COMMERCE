import Category from '../models/Category.js';
import Product from '../models/Product.js';

// --- CREAR UNA CATEGORIA (SOLO ADMIN) ---
export const createCategory = async (req, res, next) => {
    const { nombre, descripcion } = req.body;

    try {
        const categoryExists = await Category.findOne({ nombre });
        
        if (categoryExists) {
            return res.status(400).json({ success: false, message: 'La categoria ya está registrada' });
        }

        const newCategory = new Category({
            nombre,
            descripcion
        });

        const createdCategory = await newCategory.save();
        
        res.status(201).json({
            success: true,
            data: createdCategory
        });

    } catch (error) {
        next(error);
    }
}

// --- OBTENER TODAS LAS CATEGORIAS ---
export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, data: categories });

    } catch (error) {
        next(error);
    }
}

// --- ACTUALIZAR CATEGORIA (SOLO ADMIN) ---
export const updateCategory = async (req, res, next) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id, 
            req.body,    
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
        
        res.json({ success: true, data: updatedCategory });

    } catch (error) {
        next(error);
    }
}

// --- ELIMINAR CATEGORIA (SOLO ADMIN) ---
export const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }

        // (Esto es un chequeo de seguridad)
        // Me fijo si hay productos que todavía usen esta categoría
        const productCount = await Product.countDocuments({ categoria_id: req.params.id });

        // Si hay productos, no me deja borrarla (porque quedarían "huérfanos")
        if (productCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar, esta categoría tiene productos asociados.' 
            });
        }

        await category.deleteOne();
        res.json({ success: true, message: 'Categoría eliminada' });

    } catch (error) {
        next(error); 
    }
}

// --- OBTENER ESTADÍSTICAS ---
export const getCategoryStats = async (req, res, next) => {
    try {
        const stats = await Category.aggregate([
            {
                $lookup: {
                    from: "products", 
                    localField: "_id", 
                    foreignField: "categoria_id", 
                    as: "lista_de_productos"
                }
            },
            {
                $project: {
                    _id: 1,       
                    nombre: 1,  
                    cantidadProductos: { $size: "$lista_de_productos" }
                }
            }
        ]);

        res.status(200).json({ success: true, data: stats });

    } catch (error) {
        next(error);
    }
};