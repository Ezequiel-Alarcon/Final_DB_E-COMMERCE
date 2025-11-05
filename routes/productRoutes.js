const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/productController');

router.get('/', ctrl.getAll);
router.get('/top', ctrl.top);
router.get('/:id', ctrl.getOne);

router.post('/', auth, requireRole('admin'), ctrl.create);
router.patch('/:id', auth, requireRole('admin'), ctrl.update);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);
router.patch('/:id/stock', auth, requireRole('admin'), ctrl.patchStock);

module.exports = router;
