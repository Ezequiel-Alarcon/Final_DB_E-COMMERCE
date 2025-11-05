const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// DB
connectDB();

// Rutas
app.use('/api/usuarios', require('./routes/authRoutes'));
app.use('/api/productos', require('./routes/productRoutes'));
app.use('/api/categorias', require('./routes/categoryRoutes'));
app.use('/api/carrito', require('./routes/cartRoutes'));
app.use('/api/ordenes', require('./routes/orderRoutes'));
app.use('/api/resenas', require('./routes/reviewRoutes'));

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Manejo de error 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

// Middleware global de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ success: false, error: err.message || 'Error del servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
