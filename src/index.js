import express from 'express';
import mongoose from 'mongoose';

import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

// --- 2. Configuración inicial ---
const app = express();
app.use(express.json());

// --- 3. Conexión a Base de Datos ---
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/';
const DB_NAME = process.env.DB_NAME || 'IntegradorBDII';

mongoose.connect(`${MONGO_URL}${DB_NAME}`)
    .then(() => console.log("Conexión exitosa a la base de datos"))
    .catch((e) => console.log(`Error al conectarse: ${e}`));

// --- 4. Montar todas las Rutas ---
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

// --- 5. Middleware Global de Manejo de Errores ---
// Si cualquier 'next(error)' se llama en un controlador, "cae" acá.
app.use((err, req, res, next) => {
    // Muestro el error en la consola del servidor (para nosotros)
    console.error(err.stack);
    
    // Le mando una respuesta genérica al cliente (para él)
    res.status(500).json({
        success: false,
        message: 'Algo salió mal en el servidor.',
        error: err.message
    });
});

// --- 6. Iniciar el servidor ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto: ${PORT}`);
});