import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importar rutas
import userRoutes from './routes/user.routes.js';
// import productRoutes from './routes/product.routes.js'; // Próximamente
// import categoryRoutes from './routes/category.routes.js'; // Próximamente
// import orderRoutes from './routes/order.routes.js'; // Próximamente
// import cartRoutes from './routes/cart.routes.js'; // Próximamente
// import reviewRoutes from './routes/review.routes.js'; // Próximamente

// Configuración
dotenv.config();
const app = express();
app.use(express.json()); // Middleware para JSON

// Conexión a BD
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/';
const DB_NAME = process.env.DB_NAME || 'IntegradorBDII';

mongoose.connect(`${MONGO_URL}${DB_NAME}`)
    .then(() => console.log("Conexión exitosa a la base de datos"))
    .catch((e) => console.log(`Error al conectarse: ${e}`));

// --- Montar Rutas (API v1) ---
// (Usamos /api/ como prefijo estándar, como sugiere el PDF)
app.use("/api/users", userRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/reviews", reviewRoutes);

// (Aquí iría el middleware de manejo de errores)

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto: ${PORT}`);
});