const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ctrl = require('../controllers/cartController');

router.get('/', auth, ctrl.getMyCart);
router.post('/items', auth, ctrl.addItem);
router.patch('/items', auth, ctrl.updateQty);
router.delete('/items/:productId', auth, ctrl.removeItem);
router.delete('/clear', auth, ctrl.clear);

module.exports = router;
