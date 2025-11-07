import Review from '../models/Review.js';
import Order from '../models/Order.js'; // Para chequear si compró el producto
import Product from '../models/Product.js'; // Para actualizar la calificación

// --- (FUNCIÓN HELPER INTERNA) ---
// Esta función la vamos a re-usar cada vez que creemos o borremos una reseña
// Su trabajo es recalcular el promedio de un producto y guardarlo
const updateProductRating = async (productoId) => {
    try {
        // 1. Usamos aggregate para calcular el promedio y el total de reseñas
        const stats = await Review.aggregate([
            {
                // Filtramos solo las reseñas de ESTE producto
                $match: { producto_id: new mongoose.Types.ObjectId(productoId) } 
            },
            {
                // Agrupamos
                $group: {
                    _id: '$producto_id',
                    numResenas: { $sum: 1 }, // Contamos
                    calificacionPromedio: { $avg: '$calificacion' } // Calculamos promedio
                }
            }
        ]);

        // 2. Actualizamos el producto
        if (stats.length > 0) {
            // Si hay reseñas, actualizamos el producto con los nuevos datos
            await Product.findByIdAndUpdate(productoId, {
                numResenas: stats[0].numResenas,
                // Redondeamos el promedio a 1 decimal (ej: 4.5)
                calificacionPromedio: Math.round(stats[0].calificacionPromedio * 10) / 10,
            });
        } else {
            // Si no quedan reseñas (ej: se borró la última), reseteamos el producto
            await Product.findByIdAndUpdate(productoId, {
                numResenas: 0,
                calificacionPromedio: 0
            });
        }
    } catch (error) {
        console.error("Error al actualizar rating del producto:", error);
    }
};


// --- CREAR UNA RESEÑA (RUTA DE CLIENTE) ---
// (Ruta: POST /api/reviews)
export const createReview = async (req, res, next) => {
    // Saco el ID del usuario del token
    const userId = req.user.id;
    // Saco los datos de la reseña del body
    const { producto_id, calificacion, comentario } = req.body;

    try {
        // --- Chequeo 1: ¿El usuario compró este producto? --- 
        // Busco un pedido del usuario que en sus 'items' tenga este 'producto_id'
        const order = await Order.findOne({ 
            user_id: userId, 
            "items.producto_id": producto_id 
        });

        if (!order) {
            return res.status(403).json({ success: false, message: 'No puedes reseñar un producto que no has comprado' });
        }

        // --- Chequeo 2: ¿El usuario ya reseñó este producto? ---
        const existingReview = await Review.findOne({ user_id: userId, producto_id: producto_id });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'Ya has reseñado este producto' });
        }

        // --- Si pasó los chequeos, la creo ---
        const newReview = await Review.create({
            user_id: userId,
            producto_id: producto_id,
            calificacion,
            comentario
        });

        // --- (Denormalización)  ---
        // Actualizo el 'calificacionPromedio' y 'numResenas' en el Producto
        await updateProductRating(producto_id);

        res.status(201).json({ success: true, data: newReview });

    } catch (error) {
        next(error);
    }
};

// --- OBTENER RESEÑAS DE UN PRODUCTO (RUTA PÚBLICA) ---
// (Ruta: GET /api/reviews/product/:productId)
export const getReviewsForProduct = async (req, res, next) => {
    try {
        // Busco todas las reseñas que coincidan con el ID del producto
        const reviews = await Review.find({ producto_id: req.params.productId })
            .populate('user_id', 'name'); // "Relleno" el nombre del usuario

        res.status(200).json({ success: true, data: reviews });

    } catch (error) {
        next(error);
    }
};

// --- OBTENER PROMEDIO DE CALIFICACIONES (RUTA PÚBLICA) ---
// (Ruta: GET /api/reviews/top)
export const getAverageRatings = async (req, res, next) => {
    // El PDF pide "promedio de calificaciones por producto"
    try {
        const stats = await Review.aggregate([
            {
                // 1. Agrupo por producto
                $group: {
                    _id: "$producto_id",
                    promedioCalificacion: { $avg: "$calificacion" }, // Saco el promedio
                    totalResenas: { $sum: 1 } // Cuento
                }
            },
            {
                // 2. Busco los datos del producto
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productoData"
                }
            },
            {
                // 3. "Desarmo" el array
                $unwind: "$productoData"
            },
            {
                // 4. Limpio la salida
                $project: {
                    _id: 0,
                    producto: "$productoData.nombre",
                    promedioCalificacion: { $round: ["$promedioCalificacion", 1] }, // Redondeo
                    totalResenas: 1
                }
            },
            {
                // 5. Ordeno
                $sort: { promedioCalificacion: -1 } 
            }
        ]);

        res.status(200).json({ success: true, data: stats });

    } catch (error) {
        next(error);
    }
};

// --- ELIMINAR UNA RESEÑA (CLIENTE O ADMIN) --- si no me gusta chau -<-
// (Ruta: DELETE /api/reviews/:id)
export const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Reseña no encontrada' });
        }

        // --- Chequeo de permisos ---
        // Dejo borrarla si:
        // 1. Soy el dueño de la reseña
        // 2. Soy admin
        if (review.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'No tienes permiso para borrar esta reseña' });
        }

        // Guardo el ID del producto ANTES de borrarla
        const productoId = review.producto_id;

        // La borro
        await review.deleteOne();

        // --- (Denormalización) ---
        // Actualizo el promedio en el Producto OTRA VEZ
        await updateProductRating(productoId);

        res.json({ success: true, message: 'Reseña eliminada' });

    } catch (error) {
        next(error);
    }
};