import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js'; // Para chequear stock y precios actuales

// --- CREAR UN PEDIDO (RUTA DE CLIENTE) ---
// (Ruta: POST /api/orders)
export const createOrder = async (req, res, next) => {
    const userId = req.user.id; // Saco el ID del usuario del token
    const { metodo_pago } = req.body; // Saco el método de pago del body (ej: { "metodo_pago": "tarjeta" })

    if (!metodo_pago) {
        return res.status(400).json({ success: false, message: 'Falta el método de pago' });
    }

    try {
        // 1. Busco el carrito del usuario
        const cart = await Cart.findOne({ user_id: userId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Tu carrito está vacío' });
        }

        let totalPedido = 0;
        const itemsDelPedido = []; // El array de items para el modelo Order

        // 2. Verifico stock y armo los items del pedido
        // (Uso un 'for...of' loop para poder usar 'await' adentro)
        for (const item of cart.items) {
            const productoDB = await Product.findById(item.producto_id);

            // Chequeo si el producto sigue existiendo
            if (!productoDB) {
                return res.status(404).json({ success: false, message: `El producto con ID ${item.producto_id} ya no existe` });
            }

            // Chequeo stock
            if (productoDB.stock < item.cantidad) {
                return res.status(400).json({ success: false, message: `No hay stock suficiente para ${productoDB.nombre}` });
            }

            // ¡IMPORTANTE! Creamos el "snapshot" del precio
            // No confiamos en el 'agregarPrecio' del carrito (puede estar desactualizado), usamos el precio actual
            const precioActual = productoDB.precio;
            const subtotal = precioActual * item.cantidad;
            totalPedido += subtotal;

            // Armo el subdocumento para el pedido
            itemsDelPedido.push({
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precioUnitario: precioActual, // El precio "congelado"
                subtotal: subtotal
            });

            // 3. (Lógica de negocio) Descontamos el stock
            productoDB.stock -= item.cantidad;
            await productoDB.save();
        }

        // 4. Creamos el pedido
        const newOrder = await Order.create({
            user_id: userId,
            items: itemsDelPedido,
            total: totalPedido,
            metodo_pago: metodo_pago,
            estado: 'pendiente' // El estado default
        });

        // 5. ¡Vaciamos el carrito!
        cart.items = [];
        await cart.save();

        // 6. Respondemos con éxito
        res.status(201).json({ success: true, data: newOrder });

    } catch (error) {
        next(error);
    }
};

// --- OBTENER MIS PEDIDOS (RUTA DE CLIENTE) ---
// (Ruta: GET /api/orders/myorders)
export const getMyOrders = async (req, res, next) => {
    const userId = req.user.id; // Saco el ID del usuario del token

    try {
        // Busco todos los pedidos de este usuario
        const orders = await Order.find({ user_id: userId }).sort({ createdAt: -1 }); // -1 = más nuevos primero
        res.status(200).json({ success: true, data: orders });

    } catch (error) {
        next(error);
    }
};

// --- OBTENER TODOS LOS PEDIDOS (SOLO ADMIN) ---
// (Ruta: GET /api/orders)
export const getAllOrders = async (req, res, next) => {
    try {
        // El PDF pide "listar pedidos con datos de usuario"
        const orders = await Order.find()
            .populate('user_id', 'name email') // "Relleno" los datos del usuario
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: orders });

    } catch (error) {
        next(error);
    }
};

// --- ACTUALIZAR ESTADO DE PEDIDO (SOLO ADMIN) ---
// (Ruta: PATCH /api/orders/:id/status)
export const updateOrderStatus = async (req, res, next) => {
    // Saco el nuevo estado del body (ej: { "estado": "enviado" })
    const { estado } = req.body;

    try {
        // Busco el pedido y actualizo solo el estado
        // (Uso $set como pide el PDF)
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { estado: estado } },
            { new: true, runValidators: true } // runValidators para que chequee el 'enum' del modelo
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }

        res.json({ success: true, data: updatedOrder });

    } catch (error) {
        next(error);
    }
};

// --- ESTADÍSTICAS DE PEDIDOS (SOLO ADMIN) ---
// (Ruta: GET /api/orders/stats)
export const getOrderStats = async (req, res, next) => {
    // El PDF pide "total de pedidos por estado"
    try {
        // Usamos Agregación (como pide el PDF)
        const stats = await Order.aggregate([
            {
                // 1. $group: Agrupo por el campo 'estado'
                $group: {
                    _id: "$estado",
                    // 2. $sum: Cuento 1 por cada pedido en ese grupo
                    cantidad: { $sum: 1 }
                }
            },
            {
                // (Opcional) Renombro '_id' para que sea más lindo
                $project: {
                    _id: 0,
                    estado: "$_id",
                    cantidad: 1
                }
            }
        ]);

        res.status(200).json({ success: true, data: stats });

    } catch (error) {
        next(error);
    }
};