import mongoose from "mongoose";

// --- Subdocumento Embebido (Embedded) ---
// Justificación: Un pedido es una "instantánea" (snapshot)
// de una compra en un momento específico. No podemos
// solo referenciar el producto, porque su precio puede
// cambiar.
//
// Embebemos esta información (precio, cantidad) para
// "congelar" los datos de la compra.
const itemSchema = mongoose.Schema({
    producto_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto",
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1
    },
    // Este campo es crucial. Almacena el precio del producto
    // AL MOMENTO DE LA COMPRA.
    precioUnitario: {
        type: Number,
        required: true
    },
    // Almacenamos el subtotal (precioUnitario * cantidad)
    // para facilitar los cálculos del total.
    subtotal: {
        type: Number,
        required: true
    }
}, { _id: false });


// --- MODELO DE REFERENCIA (Referenced) ---
// Justificación: 'Pedido' es una entidad independiente y central
// del e-commerce. Se conecta con 'Usuario' y 'Producto'.
const pedidoSchema = mongoose.Schema({

    // --- Referencia a 'Usuario' ---
    // Justificación: (Relación 1-a-N). Un usuario puede
    // tener MÚLTIPLES pedidos.
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },

    // Array de subdocumentos con los items de la compra.
    items: [itemSchema],

    estado: {
        type: String,
        enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'],
        default: 'pendiente'
    },
    total: {
        type: Number,
        required: true
    },
    metodo_pago: {
        type: String,
        required: true
    }

}, {
    collection: "pedidos",
    timestamps: true
});

export const Pedido = mongoose.model("Pedido", pedidoSchema);