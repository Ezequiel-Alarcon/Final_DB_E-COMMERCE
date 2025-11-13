import express from 'express';
import { getMyCart, addItemToCart, removeItemFromCart, getCartTotal } from '../controller/cartController.js';
import { validateToken } from '../service/authService.js';

const router = express.Router();

// --- Rutas Protegidas ---
// Pongo el guardia 'validateToken' una sola vez acá arriba
router.use(validateToken);

// GET /api/cart/  -> Trae mi carrito
router.get('/', getMyCart);

// GET /api/cart/total  -> Calcula el total
router.get('/total', getCartTotal);

// POST /api/cart/items  -> Agrega/actualiza un item
router.post('/items', addItemToCart);

// DELETE /api/cart/items/:productId  -> Saca un item
router.delete('/items/:productId', removeItemFromCart);

export default router;