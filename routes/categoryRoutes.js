const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/categoryController');

router.get('/', ctrl.getAll);
router.get('/stats', ctrl.stats);

router.post('/', auth, requireRole('admin'), ctrl.create);
router.patch('/:id', auth, requireRole('admin'), ctrl.update);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);

module.exports = router;
