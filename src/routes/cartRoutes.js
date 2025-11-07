import express from 'express';
import { getMyCart, addItemToCart, removeItemFromCart, getCartTotal } from '../controllers/cart.controller.js';
import { validateToken } from '../services/auth.service.js';

const router = express.Router();

// --- Rutas Protegidas (Todas requieren estar logueado) ---
// Pongo el guardia 'validateToken' una sola vez acá arriba
router.use(validateToken);

// GET /api/cart/  -> Trae mi carrito
router.get('/', getMyCart);

// GET /api/cart/total  -> Calcula el total (como pide el PDF)
router.get('/total', getCartTotal);

// POST /api/cart/items  -> Agrega/actualiza un item
router.post('/items', addItemToCart);

// DELETE /api/cart/items/:productId  -> Saca un item
router.delete('/items/:productId', removeItemFromCart);

export default router;