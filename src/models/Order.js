import mongoose from "mongoose";

const OrderItemSchema = mongoose.Schema({
    producto_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    cantidad: { type: Number, required: true, min: 1 },

    // Almacena el precio del producto AL MOMENTO DE LA COMPRA.
    precioUnitario: { type: Number, required: true, min: 0 },    // Almacenamos el subtotal (precioUnitario * cantidad)

    // para facilitar los cálculos del total.
    subtotal: { type: Number, required: true, min: 0 }
}, { _id: false });

// --- MODELO DE REFERENCIA ---
const OrderSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: {type: [OrderItemSchema], default: []},

    total: { type: Number, required: true, min: 0 },
    estado: { type: String, enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'], default: 'pendiente' },
    metodo_pago: { type: String, default: 'No seleccionado'}

}, {timestamps: true });

export default mongoose.model("Order", OrderSchema);