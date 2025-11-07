import express from 'express';
import { registerUser, loginUser, getAllUsers, deleteUser, getUserById, updateUser } from '../controller/userController.js';
import { validateToken, requireAdmin } from '../service/authService.js';

const router = express.Router();

// --- Rutas Públicas (Cualquiera puede acceder) ---
router.post('/register', registerUser); // Registrarse
router.post('/login', loginUser);       // Iniciar sesión

// --- Rutas de Admin (Solo rol 'admin') ---
router.get('/', validateToken, requireAdmin, getAllUsers);     // Listar TODOS
router.delete('/:id', validateToken, requireAdmin, deleteUser); // Borrar CUALQUIERA

// --- Rutas de Usuario Logueado (Cualquier rol, PERO validado) ---
// El PDF pide GET /api/users/:id
router.get('/:id', validateToken, getUserById);   // Ver mi perfil (o el de otro si soy admin)
router.put('/:id', validateToken, updateUser);    // Actualizar mi perfil (o el de otro si soy admin)

export default router;