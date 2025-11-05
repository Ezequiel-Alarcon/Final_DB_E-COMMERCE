const express = require('express');
const router = express.Router();
const { register, login, me, listUsers } = require('../controllers/authController');
const { auth, requireRole } = require('../middleware/auth');

router.post('/', register);         // registro
router.post('/login', login);       // login
router.get('/me', auth, me);        // perfil
router.get('/', auth, requireRole('admin'), listUsers); // listar usuarios (admin)

module.exports = router;
