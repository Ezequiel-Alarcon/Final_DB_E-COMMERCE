# E-commerce API (MongoDB + Express + JWT)

API completa para el parcial de **Bases de Datos 2**. Incluye usuarios, productos, categorías, carritos, órdenes y reseñas, con autenticación JWT y endpoints de agregación.

## 🚀 Requisitos
- Node.js 18+
- MongoDB en localhost (o Atlas)
- Crear archivo `.env` a partir de `.env.example`

```env
MONGO_URI=mongodb://localhost:27017/parcial_bd2
PORT=4000
JWT_SECRET=un-secreto-seguro
JWT_EXPIRES_IN=1d
```

## ▶️ Instalación
```bash
npm install
npm run dev  # o npm start
```

## 🧭 Rutas principales

### Usuarios `/api/usuarios`
- `POST /` **Registro** `{ nombre, email, password, rol? }`
- `POST /login` **Login** → `{ token }`
- `GET /me` **Perfil** (auth)
- `GET /` **Listar usuarios** (admin)

### Productos `/api/productos`
- `GET /` lista (query: `min`, `max`, `marca`)
- `GET /:id` detalle
- `GET /top` top por cantidad de reseñas + promedio
- `POST /` (admin) crear
- `PATCH /:id` (admin) actualizar
- `DELETE /:id` (admin) borrar
- `PATCH /:id/stock` (admin) cambiar stock `{ delta }`

### Categorías `/api/categorias`
- `GET /` lista
- `GET /stats` agregación productos por categoría
- `POST /` (admin) crear
- `PATCH /:id` (admin) actualizar
- `DELETE /:id` (admin) borrar

### Carrito `/api/carrito`
- `GET /` obtener mi carrito
- `POST /items` agregar item `{ productId, cantidad }`
- `PATCH /items` modificar cantidad `{ productId, cantidad }`
- `DELETE /items/:productId` quitar item
- `DELETE /clear` vaciar carrito

### Órdenes `/api/ordenes`
- `POST /` crear **desde carrito** (descarga stock)
- `GET /mine` mis órdenes
- `GET /` (admin) todas
- `PATCH /:id/status` (admin) cambiar estado
- `GET /stats/estado` (admin) agregación por estado

### Reseñas `/api/resenas`
- `POST /` crear (solo si compró) `{ producto, calificacion, comentario? }`
- `GET /product/:productId` reseñas por producto
- `GET /top` top por promedio (mín. 2 reseñas)

## 🔐 Autenticación
Enviar `Authorization: Bearer <token>` en rutas protegidas.

## 🧪 Postman quickstart
Importá `postman_collection.json`. Variables sugeridas:
- `baseUrl`: `http://localhost:4000`
- `token`: se setea después de login

## 📦 Datos de prueba
- Crear una categoría, luego un producto con `categoria` = _id de esa categoría.
- Registrar usuario admin: `{ "rol": "admin" }` o actualizar en DB.
