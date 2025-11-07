import express from 'express';
import { createReview, getReviewsForProduct, getAverageRatings, deleteReview } from '../controller/reviewController.js';
import { validateToken, requireAdmin } from '../service/authService.js';

const router = express.Router();

// --- Rutas Públicas (Cualquiera puede verlas ) ---

// GET /api/reviews/top  -> Promedio de calificaciones por producto 
router.get('/top', getAverageRatings);

// GET /api/reviews/product/:productId  -> Reseñas de un producto
router.get('/product/:productId', getReviewsForProduct);


// --- Rutas de Cliente (Requieren token) ---

// POST /api/reviews/  -> Crear una reseña 
router.post('/', validateToken, createReview);

// DELETE /api/reviews/:id  -> Borrar mi reseña (o si soy admin)
router.delete('/:id', validateToken, deleteReview);

export default router;