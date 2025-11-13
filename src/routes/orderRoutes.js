import express from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getOrderStats } from '../controller/orderController.js';
import { validateToken, requireAdmin } from '../service/authService.js';

const router = express.Router();

// --- Todas las rutas de pedidos requieren estar logueado ---
router.use(validateToken);

// --- Rutas de Cliente ---

// POST /api/orders/  -> Crear un pedido nuevo (usa el carrito)
router.post('/', createOrder);

// GET /api/orders/myorders  -> Ver mis pedidos
router.get('/myorders', getMyOrders);


// --- Rutas de Admin ---

// GET /api/orders/  -> Ver TODOS los pedidos de TODOS los usuarios
router.get('/', requireAdmin, getAllOrders);

// GET /api/orders/stats  -> Ver estadísticas de pedidos
router.get('/stats', requireAdmin, getOrderStats);

// PATCH /api/orders/:id/status  -> Actualizar estado (ej: "enviado")
router.patch('/:id/status', requireAdmin, updateOrderStatus);

export default router;