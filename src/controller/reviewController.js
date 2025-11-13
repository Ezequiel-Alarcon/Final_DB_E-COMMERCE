import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// --- (FUNCIÓN HELPER INTERNA) ---
// Esta función la vamos a re-usar cada vez que creemos o borremos una reseña
// Su trabajo es recalcular el promedio de un producto y guardarlo
const updateProductRating = async (productoId) => {
    try {
        const stats = await Review.aggregate([
            {
                $match: { producto_id: new mongoose.Types.ObjectId(productoId) } 
            },
            {
                $group: {
                    _id: '$producto_id',
                    numResenas: { $sum: 1 },
                    calificacionPromedio: { $avg: '$calificacion' }
                }
            }
        ]);

        if (stats.length > 0) {
            await Product.findByIdAndUpdate(productoId, {
                numResenas: stats[0].numResenas,
                calificacionPromedio: Math.round(stats[0].calificacionPromedio * 10) / 10,
            });
        } else {
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
export const createReview = async (req, res, next) => {
    const userId = req.user.id;
    const { producto_id, calificacion, comentario } = req.body;

    try {
        const order = await Order.findOne({
            user_id: userId,
            "items.producto_id": producto_id,
            estado: "entregado"
        });

        if (!order) {
            // Si no encuentra el pedido, es o porque no lo compró, o porque no se ha entregado
            return res.status(403).json({ success: false, message: 'No puedes reseñar un producto que no has comprado o que aún no ha sido entregado' });
        }

        const existingReview = await Review.findOne({ user_id: userId, producto_id: producto_id });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'Ya has reseñado este producto' });
        }

        const newReview = await Review.create({
            user_id: userId,
            producto_id: producto_id,
            calificacion,
            comentario
        });

        await updateProductRating(producto_id);

        res.status(201).json({ success: true, data: newReview });

    } catch (error) {
        next(error);
    }
};

// --- OBTENER RESEÑAS DE UN PRODUCTO (RUTA PÚBLICA) ---
export const getReviewsForProduct = async (req, res, next) => {
    try {
        const reviews = await Review.find({ producto_id: req.params.productId })
            .populate('user_id', 'name');

        res.status(200).json({ success: true, data: reviews });

    } catch (error) {
        next(error);
    }
};

// --- OBTENER PROMEDIO DE CALIFICACIONES (RUTA PÚBLICA) ---
export const getAverageRatings = async (req, res, next) => {
    try {
        const stats = await Review.aggregate([
            {
                $group: {
                    _id: "$producto_id",
                    promedioCalificacion: { $avg: "$calificacion" },
                    totalResenas: { $sum: 1 }
                }
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
                    promedioCalificacion: { $round: ["$promedioCalificacion", 1] },
                    totalResenas: 1
                }
            },
            {
                $sort: { promedioCalificacion: -1 } 
            }
        ]);

        res.status(200).json({ success: true, data: stats });

    } catch (error) {
        next(error);
    }
};

// --- ELIMINAR UNA RESEÑA (CLIENTE O ADMIN) --- si no me gusta chau -<-
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

        await review.deleteOne();

        await updateProductRating(productoId);

        res.json({ success: true, message: 'Reseña eliminada' });

    } catch (error) {
        next(error);
    }
};