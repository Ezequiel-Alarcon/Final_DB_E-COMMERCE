import express from 'express';
import { createCategory, getAllCategories, updateCategory, deleteCategory, getCategoryStats } from '../controller/categoryController.js';
import { requireAdmin, validateToken } from '../service/authService.js';

// 3. Creo mi router
const router = express.Router();

// --- Rutas Públicas (Cualquiera las puede ver) ---

// GET /api/categories/  -> Trae todas las categorías
router.get('/', getAllCategories);


// --- Rutas de Admin (Necesitas token Y ser admin) ---

// POST /api/categories/  -> Crear una categoría nueva
router.post('/', validateToken, requireAdmin, createCategory);

// GET /api/categories/stats  -> La ruta de estadísticas que pide el PDF
// La pongo en admin porque es información "interna"
router.get('/stats', validateToken, requireAdmin, getCategoryStats);

// PUT /api/categories/:id  -> Actualizar una categoría
// Uso PUT y le paso el ID por la URL
router.put('/:id', validateToken, requireAdmin, updateCategory);

// DELETE /api/categories/:id  -> Borrar una categoría
// Uso DELETE y le paso el ID por la URL
router.delete('/:id', validateToken, requireAdmin, deleteCategory);

export default router;