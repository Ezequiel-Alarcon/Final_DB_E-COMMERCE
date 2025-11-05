const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ctrl = require('../controllers/reviewController');

router.post('/', auth, ctrl.create);
router.get('/product/:productId', ctrl.byProduct);
router.get('/top', ctrl.top);

module.exports = router;
