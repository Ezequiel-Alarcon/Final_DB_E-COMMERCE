import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// --- OBTENER EL CARRITO DEL USUARIO ---
export const getMyCart = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ user_id: userId }).populate('items.producto_id', 'nombre precio stock');

        // Si por alguna razón no tiene carrito (ej: usuario viejo), le creo uno
        if (!cart) {
            const newCart = await Cart.create({ user_id: userId, items: [] });
            return res.status(200).json({ success: true, data: newCart });
        }

        res.status(200).json({ success: true, data: cart });

    } catch (error) {
        next(error);
    }
};

// --- AGREGAR UN ITEM AL CARRITO ---
export const addItemToCart = async (req, res, next) => {
    const userId = req.user.id; 
    const { producto_id, cantidad } = req.body;    

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
            itemExistente.cantidad = cantidad;
        } else {
            cart.items.push({
                producto_id: producto_id,
                cantidad: cantidad,
                agregarPrecio: product.precio 
            });
        }

        const updatedCart = await cart.save();
        res.status(200).json({ success: true, data: updatedCart });

    } catch (error) {
        next(error);
    }
};

// --- QUITAR UN ITEM DEL CARRITO ---
export const removeItemFromCart = async (req, res, next) => {
    const userId = req.user.id; 
    const { productId } = req.params;   


    try {
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
        }

        const updatedCart = await Cart.findByIdAndUpdate(
            cart._id,
            { $pull: { items: { producto_id: productId } } },
            { new: true }
        );

        res.status(200).json({ success: true, data: updatedCart });

    } catch (error) {
        next(error);
    }
};

// --- CALCULAR TOTAL Y SUBTOTALES DEL CARRITO ---
// (Ruta: GET /api/cart/total)
export const getCartTotal = async (req, res, next) => {
    const userId = req.user.id; 

    try {
        const cart = await Cart.findOne({ user_id: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
        }

        if (cart.items.length === 0) {
            return res.status(200).json({ 
                success: true, 
                data: { 
                    items: [], 
                    total: 0 
                } 
            });
        }

        let totalGeneral = 0;

        const itemsConSubtotal = cart.items.map(item => {
            const subtotal = item.agregarPrecio * item.cantidad; 
            
            totalGeneral += subtotal;

            return {
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precioUnitario: item.agregarPrecio,
                subtotal: subtotal
            };
        });

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