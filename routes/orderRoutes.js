const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/orderController');

router.post('/', auth, ctrl.createFromCart);          // crear orden desde carrito
router.get('/mine', auth, ctrl.myOrders);             // mis órdenes
router.get('/', auth, requireRole('admin'), ctrl.allOrders); // todas (admin)
router.patch('/:id/status', auth, requireRole('admin'), ctrl.changeStatus);
router.get('/stats/estado', auth, requireRole('admin'), ctrl.stats);

module.exports = router;
