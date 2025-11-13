import express from 'express';
import { registerUser, loginUser, getAllUsers, deleteUser, getUserById, updateUser } from '../controller/userController.js';
import { validateToken, requireAdmin } from '../service/authService.js';

const router = express.Router();

// --- Rutas Públicas ---
router.post('/register', registerUser); 
router.post('/login', loginUser);       

// --- Rutas de Admin ---
router.get('/', validateToken, requireAdmin, getAllUsers);   
router.delete('/:id', validateToken, requireAdmin, deleteUser); 

// --- Rutas de Usuario Logueado (Cualquier rol, PERO validado) ---
// El PDF pide GET /api/users/:id
router.get('/:id', validateToken, getUserById);   // Ver mi perfil (o el de otro si soy admin)
router.put('/:id', validateToken, updateUser);    // Actualizar mi perfil (o el de otro si soy admin)

export default router;