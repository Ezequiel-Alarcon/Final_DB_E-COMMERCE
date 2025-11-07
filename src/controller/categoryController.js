import Category from '../models/Category.js';
import Product from '../models/Product.js'; // Lo necesito para chequear antes de borrar

// --- CREAR UNA CATEGORIA (SOLO ADMIN) ---
// Esta función crea una categoría nueva
export const createCategory = async (req, res, next) => {
    // Saco el nombre y la descripcion de lo que me mandan
    const { nombre, descripcion } = req.body;

    try {
        // Me fijo si ya existe una con el mismo nombre
        const categoryExists = await Category.findOne({ nombre });
        
        // Si ya existe, le aviso al usuario y no hago nada más
        if (categoryExists) {
            return res.status(400).json({ success: false, message: 'La categoria ya está registrada' });
        }

        // Si no existe, creo la categoría nueva
        const newCategory = new Category({
            nombre,
            descripcion
        });

        // La guardo en la base de datos
        const createdCategory = await newCategory.save();
        
        // Respondo con 201 y los datos
        res.status(201).json({
            success: true,
            data: createdCategory
        });

    } catch (error) {
        // Si algo se rompe (ej: la BD se cae), se lo paso al manejador de errores
        next(error);
    }
}

// --- OBTENER TODAS LAS CATEGORIAS ---
// Esta función trae todas las categorías
export const getAllCategories = async (req, res, next) => {
    try {
        // Busco todas las categorías que haya en la colección
        const categories = await Category.find();
        
        // Respondo con 200 (OK) y le mando todas las categorías
        res.status(200).json({ success: true, data: categories });

    } catch (error) {
        next(error);
    }
}

// --- ACTUALIZAR CATEGORIA (SOLO ADMIN) ---
// Esta función actualiza una categoría que ya existe
export const updateCategory = async (req, res, next) => {
    try {
        // Busco la categoría por el ID de la URL y la actualizo con lo que venga en el body
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id, // El ID que viene en la URL (ej: /api/categorias/123)
            req.body,      // Los datos nuevos (ej: { "nombre": "Nuevo Nombre" })
            { new: true, runValidators: true } // Opciones: {new: true} es para que me devuelva el archivo actualizado
        );

        // Si no la encuentra (porque el ID no existe), aviso
        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
        
        // Si la encuentra y la actualiza, la devuelvo
        res.json({ success: true, data: updatedCategory });

    } catch (error) {
        next(error);
    }
}

// --- ELIMINAR CATEGORIA (SOLO ADMIN) ---
// Esta función borra una categoría
export const deleteCategory = async (req, res, next) => {
    try {
        // Primero, busco si la categoría que quieren borrar existe
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

        // Si pasa los chequeos (existe Y no tiene productos), la borro
        await category.deleteOne();

        // Respondo que salió todo bien
        res.json({ success: true, message: 'Categoría eliminada' });

    } catch (error) {
        next(error); 
    }
}

// --- OBTENER ESTADÍSTICAS (Ruta: /api/categorias/stats) ---
// Esta es la ruta que pide el parcial
export const getCategoryStats = async (req, res, next) => {
    try {
        // Uso 'aggregate' para hacer el cálculo
        const stats = await Category.aggregate([
            {
                // 1. $lookup: "Junto" la colección de categorías con la de productos
                $lookup: {
                    from: "products", // La colección se llama 'products' (el plural de 'Product')
                    localField: "_id", // El ID de esta categoría
                    foreignField: "categoria_id", // El campo que coincide en el producto
                    as: "lista_de_productos" // Un nombre temporal para el array de productos
                }
            },
            {
                // 2. $project: Elijo qué campos quiero mostrar al final
                $project: {
                    _id: 1,       // Dejo el ID de la categoría
                    nombre: 1,  // Dejo el nombre
                    
                    // 3. $size: Cuento cuántos elementos hay en el array 'lista_de_productos'
                    cantidadProductos: { $size: "$lista_de_productos" }
                }
            }
        ]);

        res.status(200).json({ success: true, data: stats });

    } catch (error) {
        next(error);
    }
};