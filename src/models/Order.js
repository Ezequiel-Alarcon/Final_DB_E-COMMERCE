import mongoose from "mongoose";

// --- Subdocumento Embebido ---
// Justificación: Un pedido es una "instantánea" (snapshot)
// de una compra en un momento específico. No podemos
// solo referenciar el producto, porque su precio puede
// cambiar.
//
// Embebemos esta información (precio, cantidad) para
// "congelar" los datos de la compra.
const OrderItemSchema = mongoose.Schema({
    producto_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    cantidad: { type: Number, required: true, min: 1 },

    // Almacena el precio del producto AL MOMENTO DE LA COMPRA.
    precioUnitario: { type: Number, required: true, min: 0 },    // Almacenamos el subtotal (precioUnitario * cantidad)

    // para facilitar los cálculos del total.
    subtotal: { type: Number, required: true, min: 0 }
}, { _id: false });

// --- MODELO DE REFERENCIA ---
// Justificación: 'Pedido' es una entidad independiente y central
// del e-commerce. Se conecta con 'Usuario' y 'Producto'.
const OrderSchema = mongoose.Schema({

    // --- Referencia a 'Usuario' ---
    // Justificación: (Relación 1-a-N). Un usuario puede
    // tener MÚLTIPLES pedidos.
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Array de subdocumentos con los items de la compra.
    items: {type: [OrderItemSchema], default: []},

    total: { type: Number, required: true, min: 0 },
    estado: { type: String, enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'], default: 'pendiente' },
    metodo_pago: { type: String, default: 'No seleccionado'}

}, {timestamps: true });

export default mongoose.model("Order", OrderSchema);