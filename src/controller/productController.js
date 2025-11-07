// Importo los modelos que voy a usar
import Product from '../models/Product.js';
import Category from '../models/Category.js'; // Lo uso para chequear que la categoría exista al crear
import Review from '../models/Review.js';   // Lo uso para la ruta 'top'

// --- CREAR UN PRODUCTO (SOLO ADMIN) ---
// (Ruta: POST /api/products)
export const createProduct = async (req, res, next) => {
    // Saco todos los datos del body
    const { nombre, descripcion, categoria_id, precio, stock } = req.body;

    try {
        // Chequeo de seguridad: me fijo si la categoría que me pasaron existe
        const category = await Category.findById(categoria_id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Esa categoría no existe' });
        }

        // Si la categoría existe, creo el producto
        const product = new Product({
            nombre,
            descripcion,
            categoria_id,
            precio,
            stock
            // (Los campos de reseñas se ponen solos en 0)
        });

        // Lo guardo en la BD
        const createdProduct = await product.save();

        // Respondo con 201 (Creado)
        res.status(201).json({ success: true, data: createdProduct });

    } catch (error) {
        // Si algo falla, al manejador de errores
        next(error);
    }
};

// --- OBTENER TODOS LOS PRODUCTOS (RUTA PÚBLICA) ---
// (Ruta: GET /api/products)
export const getAllProducts = async (req, res, next) => {
    try {
        // El PDF pide "listar productos con su categoría"
        // Uso .populate() para que "rellene" los datos de la categoría
        // Le pido que solo traiga el 'nombre' de la categoría, no necesito más
        const products = await Product.find().populate('categoria_id', 'nombre');

        res.status(200).json({ success: true, data: products });

    } catch (error) {
        next(error);
    }
};

// --- OBTENER UN SOLO PRODUCTO (RUTA PÚBLICA) ---
// (Ruta: GET /api/products/:id)
export const getProductById = async (req, res, next) => {
    try {
        // Busco el producto por el ID de la URL
        const product = await Product.findById(req.params.id).populate('categoria_id', 'nombre');

        // Si no lo encuentro, aviso con un 404
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        // Si lo encuentro, lo mando
        res.status(200).json({ success: true, data: product });

    } catch (error) {
        next(error);
    }
};

// --- ACTUALIZAR UN PRODUCTO (SOLO ADMIN) ---
// (Ruta: PUT /api/products/:id)
export const updateProduct = async (req, res, next) => {
    try {
        // Busco por ID y actualizo con los datos que me manden en el body
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Opciones para que me devuelva el nuevo
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        // Mando el producto actualizado
        res.json({ success: true, data: updatedProduct });

    } catch (error) {
        next(error);
    }
};

// --- ELIMINAR UN PRODUCTO (SOLO ADMIN) ---
// (Ruta: DELETE /api/products/:id)
export const deleteProduct = async (req, res, next) => {
    try {
        // Busco por ID y lo borro
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
// (Ruta: PATCH /api/products/:id/stock)
export const updateStock = async (req, res, next) => {
    // Saco solo el stock del body
    const { stock } = req.body;

    // Chequeo que sea un número válido
    if (typeof stock !== 'number' || stock < 0) {
        return res.status(400).json({ success: false, message: 'El stock tiene que ser un número >= 0' });
    }

    try {
        // Busco el producto y actualizo *solo* el stock
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { stock: stock } }, // Actualizo solo este campo
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
// (Ruta: GET /api/products/filtro?min=10&max=100&marca=iPhone)
export const filterProducts = async (req, res, next) => {
    try {
        // Saco los filtros del 'query' (lo que viene después del ? en la URL)
        const { min, max, marca } = req.query;

        // 1. Armo el objeto de filtro vacío
        const filtro = {};

        // 2. Si me pasaron precio, lo agrego al filtro
        // (Uso $gte y $lte como pide el PDF)
        if (min || max) {
            filtro.precio = {};
            if (min) filtro.precio.$gte = Number(min); // $gte = mayor o igual
            if (max) filtro.precio.$lte = Number(max); // $lte = menor o igual
        }

        // 3. Si me pasaron "marca", la busco en el nombre
        if (marca) {
            // 'new RegExp' es para buscar texto que *contenga* la palabra
            // 'i' es para que no le importen las mayúsculas/minúsculas
            filtro.nombre = new RegExp(marca, 'i');
        }

        // 4. Busco en la BD con el filtro que armé
        const products = await Product.find(filtro).populate('categoria_id', 'nombre');

        res.status(200).json({ success: true, data: products });

    } catch (error) {
        next(error);
    }
};

// --- OBTENER TOP PRODUCTOS MÁS RESEÑADOS (RUTA PÚBLICA) ---
// (Ruta: GET /api/products/top)
export const getTopReviewedProducts = async (req, res, next) => {
    try {
        // Esta es una AGREGACIÓN (como pide el PDF)
        // Lo hago desde 'Review' porque es más fácil contar
        const topProducts = await Review.aggregate([
            {
                // 1. $group: Agrupo por ID de producto y cuento
                $group: {
                    _id: "$producto_id", // El ID del producto
                    totalResenas: { $sum: 1 } // Sumo 1 por cada reseña
                }
            },
            {
                // 2. $sort: Ordeno de mayor a menor
                $sort: { totalResenas: -1 }
            },
            {
                // 3. $limit: Me quedo solo con los 5 primeros
                $limit: 5 
            },
            {
                // 4. $lookup: Busco los datos de esos 5 productos
                $lookup: {
                    from: "products", // La colección de productos
                    localField: "_id", // El ID del grupo (producto_id)
                    foreignField: "_id", // El ID del producto en su colección
                    as: "productoData" // Lo guardo acá
                }
            },
            {
                // 5. $unwind: "Desarmo" el array 'productoData'
                $unwind: "$productoData"
            },
            {
                // 6. $project: Limpio la salida para que se vea bien
                $project: {
                    _id: 0, // No quiero el ID de la reseña
                    producto: "$productoData.nombre",
                    productoId: "$productoData._id",
                    totalResenas: 1 // Dejo el conteo
                }
            }
        ]);
        
        res.status(200).json({ success: true, data: topProducts });

    } catch (error) {
        next(error);
    }
};