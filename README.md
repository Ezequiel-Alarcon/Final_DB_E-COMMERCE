# API E-Commerce - Parcial BDD2

Este es el proyecto final para el parcial de Bases de Datos 2, una API REST completa para un E-Commerce construida con Node.js, Express y MongoDB.

El proyecto incluye gestión de:
* Usuarios (Clientes y Admins) con autenticación JWT
* Productos y Categorías
* Un Carrito de compras persistente por usuario
* Pedidos (con descuento de stock)
* Reseñas (con denormalización de ratings en el producto)

## 1. Requisitos Previos

* [Node.js](https://nodejs.org/) (v18 o superior)
* [MongoDB](https://www.mongodb.com/try/download/community) (tenerlo corriendo localmente)
* [Postman](https://www.postman.com/downloads/) (o Insomnia)
* Un cliente de Base de Datos como [MongoDB Compass](https://www.mongodb.com/try/download/compass) (muy recomendado)

## 2. Instalación

1.  Clona o descarga el repositorio.
2.  Abre una terminal en la carpeta raíz del proyecto.
3.  Instala todas las dependencias:
    ```bash
    npm install
    ```

## 3. Configuración del Entorno

1.  En la carpeta raíz, crea un archivo llamado `.env`.
2.  Copia y pega el siguiente contenido, asegurándote de que `MONGO_URI` apunte a tu base de datos:

    ```env
    # --- Configuración del Servidor ---
    PORT=3000
    
    # --- Base de Datos ---
    MONGO_URI=mongodb://localhost:27017/IntegradorBDII
    
    # --- Autenticación JWT ---
    JWT_SECRET=un_secreto_muy_seguro_para_el_parcial
    JWT_EXPIRES_IN=1h
    ```

## 4. Ejecución

1.  Asegúrate de que tu servicio de MongoDB esté corriendo.
2.  Corre el servidor en modo desarrollo (con Nodemon):
    ```bash
    npm run dev
    ```
3.  Deberías ver en tu terminal:
    ```
    Conexión exitosa a la base de datos
    Servidor corriendo en puerto: 3000
    ```
4.  ¡Deja esta terminal abierta! Si la cierras, el servidor se apaga.

---

## 5. Tutorial de Pruebas con Postman (Paso a Paso)

Esta es la guía para probar **todas** las rutas usando el archivo `posman_collection.json` incluido.

### Paso 0: Configurar Postman

1.  Abre Postman e importa la colección `posman_collection.json` (Archivo > Importar).
2.  Haz clic en el nombre de la colección: **"Parcial BDD2 - Proyecto SRC (Poblado)"**.
3.  Ve a la pestaña **"Variables"**.
4.  En la fila `baseUrl`, asegúrate de que la columna **"CURRENT VALUE" (Valor Actual)** diga: `http://localhost:3000`.
5.  Presiona "Save" (Guardar).

### Paso 1: Crear el Administrador (La Llave Maestra 🔑)

Para crear categorías y productos, necesitas ser Admin.

1.  **Crea tu Admin:** Ve a la carpeta **"Usuarios (Auth)"** > `POST Registrar Usuario (Público)`.
    * Usa el *body* que ya está (`prueba@correo.com`). Presiona **"Send"**.
2.  **Hazlo Admin (Paso Manual):**
    * Ve a MongoDB Compass (o el que uses).
    * Busca en la colección `users` al usuario `prueba@correo.com`.
    * Edítalo y cambia el campo `role` de `"client"` a `"admin"`. Guarda.
3.  **Loguéate como Admin:**
    * Vuelve a Postman.
    * Ejecuta `POST Login Usuario (Público)` (con los datos de `prueba@correo.com`).
    * ¡Listo! El script de "Tests" **guardó tu token de Admin** en la variable `{{token}}`.

### Paso 2: Poblar la Base de Datos (La Carga Rápida 🚀)

Ahora, vamos a llenar la BD con datos variados usando la carpeta automatizada.

1.  Abre la carpeta: **"--- 🚀 (Poblar BD) Carga Rápida ---"**.
2.  **Carpeta "Crear Usuarios (Clientes)":** (Asegúrate de estar logueado como Admin).
    * Ejecuta `POST Crear Cliente Ana`.
    * Ejecuta `POST Crear Cliente Bruno`.
    * Ejecuta `POST Crear Cliente Carla`.
3.  **Carpeta "Crear Categorías (Como Admin)":**
    * Ejecuta `POST Crear Cat. Smartphones`.
    * Ejecuta `POST Crear Cat. Laptops`.
    * Ejecuta `POST Crear Cat. Audio`.
    * Ejecuta `POST Crear Cat. Gaming`.
    * *(¡No necesitas copiar IDs! Los scripts los guardaron en variables como `{{cat_smartphones_id}}`)*.
4.  **Carpeta "Crear Productos (Como Admin)":**
    * Ejecuta `POST Prod. iPhone 15`.
    * Ejecuta `POST Prod. Samsung S24`.
    * Ejecuta `POST Prod. MacBook Air`.
    * Ejecuta `POST Prod. Sony WH-1000XM5`.
    * Ejecuta `POST Prod. PlayStation 5`.
    * *(Los scripts también guardaron estos IDs en variables como `{{prod_iphone_id}}`)*.
5.  **Carpeta "Poblar Carrito (Cliente Ana)":**
    * **¡IMPORTANTE! Ejecuta esta primero:** `POST Login (Cliente Ana)`.
    * *(Esto cambiará tu `{{token}}` al de "Ana" automáticamente)*.
    * Ahora, ejecuta las 3 peticiones: `POST Agregar iPhone (Ana)`, `POST Agregar Auris Sony (Ana)` y `POST Agregar PS5 (Ana)`.

¡Felicidades! Ahora tienes una base de datos poblada con 4 usuarios, 4 categorías, 5 productos y 1 carrito de cliente lleno.

### Paso 3: Probar el Flujo de Compra y Reseña

Ahora probaremos la lógica de negocio más compleja.

1.  **Sigue logueado como "Ana"** (lo hiciste en el último paso).
2.  **Crear Pedido:** Ve a la carpeta **"Pedidos"** > `POST Crear Pedido (Auth)` > **"Send"**.
    * El carrito de Ana se vaciará y se creará un pedido.
    * **Acción Manual:** Copia el `_id` del pedido de la respuesta y pégalo en la variable `{{orderId}}` (en la pestaña "Variables" de la colección).
3.  **Probar Reseña (Falla ❌):** Ve a la carpeta **"Reseñas"** > `POST Crear Reseña (Auth)`.
    * En el *body*, cambia el `{{productId}}` por `{{prod_iphone_id}}` (uno de los que Ana compró).
    * Presiona **"Send"**. **¡Fallará!** (Status 403). Te dirá que el pedido no está "entregado". ¡Esto es correcto!.
4.  **Entregar el Pedido (Admin):**
    * Loguéate como **Admin** (`POST Login Usuario (Público)` con `prueba@correo.com`).
    * Ve a **"Pedidos"** > `PATCH Actualizar Estado Pedido (Admin)`.
    * En el *body*, asegúrate que diga `"estado": "entregado"`.
    * Presiona **"Send"**. El pedido de Ana ya está entregado.
5.  **Probar Reseña (Éxito ✅):**
    * Loguéate como **Ana** (`POST Login (Cliente Ana)`).
    * Vuelve a **"Reseñas"** > `POST Crear Reseña (Auth)` (con el `{{prod_iphone_id}}`).
    * Presiona **"Send"**. ¡**Éxito!** (Status 201). Ahora sí te dejó.

### Paso 4: Probar las "Otras Ops" (Checklist)

Ahora que tienes datos, puedes probar el resto de las rutas (las `GET`, `PUT`, `DELETE`, etc.) que están en las carpetas normales.

* `GET Todos los Productos` (para ver tus 5 productos).
* `GET Filtrar Productos` (ej: `?marca=Apple&max=1500`).
* `GET Top Productos Reseñados` (debería salir el iPhone).
* `GET Total del Carrito` (loguéate como Bruno y agrégale algo).
* `DELETE Quitar Item (Auth)`.
* `GET Stats de Categorías (Admin)` (logueado como Admin).
* `DELETE Categoría (Admin)` (Intenta borrar "Smartphones", debería fallar porque tiene productos).
* `GET Stats de Pedidos (Admin)`.
* `DELETE Mi Reseña (Auth)` (loguéate como Ana, copia el ID de su reseña y bórrala).

### Paso 5: Probar la Expiración del Token (Requisito del PDF)

Esta es la última prueba obligatoria.

1.  **Modifica el Código:** Ve a `src/service/authService.js`.
2.  Busca la línea 11. Cambia `expiresIn: "1h"` por `expiresIn: "1s"` (1 segundo).
3.  **REINICIA EL SERVIDOR** (Ctrl+C y `npm run dev`).
4.  **Prueba en Postman:**
    * Ejecuta `POST Login (Cliente Ana)`.
    * **Espera 3 segundos**.
    * Intenta ejecutar `GET Mi Carrito (Auth)`.
5.  **Resultado:** ¡**Fallará!** (Status 403 Forbidden, "Token inválido").

¡Prueba completada!

**¡¡¡MUY IMPORTANTE!!!** No te olvides de volver a poner `expiresIn: "1h"` en `authService.js` y reiniciar tu servidor una última vez.