import express from 'express';
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, updateStock, filterProducts, getTopReviewedProducts } from '../controllers/product.controller.js';
import { validateToken, requireAdmin } from '../services/auth.service.js';

const router = express.Router();


// --- Rutas Públicas (Cualquiera puede ver) ---

// GET /api/products/  -> Trae todos los productos
router.get('/', getAllProducts);

// GET /api/products/filtro  -> Ruta de filtros (ej: /api/products/filtro?min=100)
router.get('/filtro', filterProducts);

// GET /api/products/top  -> Ruta de top reseñados
router.get('/top', getTopReviewedProducts); 

// GET /api/products/:id  -> Trae un producto por su ID
router.get('/:id', getProductById);


// --- Rutas de Admin (Solo admin) ---

// POST /api/products/  -> Crear un producto nuevo
router.post('/', validateToken, requireAdmin, createProduct);

// PUT /api/products/:id  -> Actualizar un producto (completo)
router.put('/:id', validateToken, requireAdmin, updateProduct);

// PATCH /api/products/:id/stock  -> Actualizar SOLO el stock
// (Uso PATCH porque es una actualización parcial)
router.patch('/:id/stock', validateToken, requireAdmin, updateStock);

// DELETE /api/products/:id  -> Borrar un producto
router.delete('/:id', validateToken, requireAdmin, deleteProduct);

export default router;