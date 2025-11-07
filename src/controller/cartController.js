import Cart from '../models/Cart.js';
import Product from '../models/Product.js'; // Para chequear stock y precios

// --- OBTENER EL CARRITO DEL USUARIO ---
// (Ruta: GET /api/cart/)
export const getMyCart = async (req, res, next) => {
    try {
        // 1. Saco el ID del usuario (que viene del token)
        const userId = req.user.id;

        // 2. Busco el carrito de ese usuario
        // Uso .populate() para "rellenar" los datos de los productos
        const cart = await Cart.findOne({ user_id: userId }).populate('items.producto_id', 'nombre precio stock');

        // 3. (Caso borde) Si por alguna razón no tiene carrito (ej: usuario viejo), le creo uno
        if (!cart) {
            const newCart = await Cart.create({ user_id: userId, items: [] });
            return res.status(200).json({ success: true, data: newCart });
        }

        // 4. Mando el carrito encontrado
        res.status(200).json({ success: true, data: cart });

    } catch (error) {
        next(error);
    }
};

// --- AGREGAR UN ITEM AL CARRITO ---
// (Ruta: POST /api/cart/items)
export const addItemToCart = async (req, res, next) => {
    const userId = req.user.id; // Saco el ID del usuario del token
    const { producto_id, cantidad } = req.body;    // Saco el ID del producto y la cantidad del body

    try {
        // 1. Busco el producto para saber su precio y stock
        const product = await Product.findById(producto_id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Ese producto no existe' });
        }

        // 2. Chequeo el stock
        if (product.stock < cantidad) {
            return res.status(400).json({ success: false, message: 'No hay stock suficiente' });
        }

        // 3. Busco el carrito del usuario
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            // (Esto no debería pasar si el registro funciona bien, pero por si acaso)
            return res.status(404).json({ success: false, message: 'Carrito de usuario no encontrado' });
        }

        // 4. Lógica de agregar:
        // Busco si el producto YA ESTÁ en el carrito
        const itemExistente = cart.items.find(item => item.producto_id.toString() === producto_id);

        if (itemExistente) {
            // Si ya está, solo actualizo la cantidad
            itemExistente.cantidad = cantidad;
        } else {
            // Si es nuevo, lo agrego al array (usando $push como pide el PDF)
            cart.items.push({
                producto_id: producto_id,
                cantidad: cantidad,
                agregarPrecio: product.precio // Guardamos el precio del producto
            });
        }

        // 5. Guardo los cambios en el carrito
        const updatedCart = await cart.save();
        res.status(200).json({ success: true, data: updatedCart });

    } catch (error) {
        next(error);
    }
};

// --- QUITAR UN ITEM DEL CARRITO ---
// (Ruta: DELETE /api/cart/items/:productId)
export const removeItemFromCart = async (req, res, next) => {
    const userId = req.user.id; // Saco el ID del usuario del token
    const { productId } = req.params;    // Saco el ID del producto de la URL


    try {
        // 1. Busco el carrito
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
        }

        // 2. Uso $pull (como pide el PDF) para sacar el item del array
        // $pull saca CUALQUIER objeto del array 'items' que coincida con el filtro
        const updatedCart = await Cart.findByIdAndUpdate(
            cart._id,
            { $pull: { items: { producto_id: productId } } },
            { new: true } // Para que me devuelva el carrito actualizado
        );

        res.status(200).json({ success: true, data: updatedCart });

    } catch (error) {
        next(error);
    }
};

// --- CALCULAR TOTAL Y SUBTOTALES DEL CARRITO ---
// (Ruta: GET /api/cart/total)
export const getCartTotal = async (req, res, next) => {
    // Saco el ID del usuario del token
    const userId = req.user.id; 

    try {
        // 1. Busco el carrito
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
        }

        // 2. Chequeo si hay items
        if (cart.items.length === 0) {
            return res.status(200).json({ 
                success: true, 
                data: { 
                    items: [], 
                    total: 0 
                } 
            });
        }

        // 3. Calculo el total
        let totalGeneral = 0;

        // Uso .map() para calcular el subtotal de CADA item
        const itemsConSubtotal = cart.items.map(item => {
            // Uso el precio que guardamos cuando se agregó al carrito
            const subtotal = item.agregarPrecio * item.cantidad; 
            
            // Voy sumando al total general
            totalGeneral += subtotal;

            return {
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precioUnitario: item.agregarPrecio,
                subtotal: subtotal
            };
        });

        // 4. Respondo con los subtotales y el total
        res.status(200).json({
            success: true,
            data: {
                items: itemsConSubtotal,
                total: totalGeneral
            }
        });

    } catch (error) {
        next(error);
    }
};