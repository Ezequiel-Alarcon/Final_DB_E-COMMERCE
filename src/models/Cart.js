import mongoose from "mongoose";

// --- Subdocumento Embebido ---
// Justificación: La consigna pide "productos seleccionados y cantidades".

// Se crea un subdocumento 'Item' que almacena la referencia al producto
// y la cantidad de ese producto. Estos items "pertenecen" al carrito
// y no tienen sentido por sí solos.
const CartItemSchema = mongoose.Schema({
    producto_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1 // Un item en el carrito debe tener al menos 1 de cantidad
    },
    // Importante: Guarda el precio al momento de agregarlo
    agregarPrecio: { type: Number, required: true, min: 0 }
}, { _id: false });

const CartSchema = mongoose.Schema({
    // --- Referencia a 'Usuario' ---
    // Justificación: (Relación 1-a-1). La consigna
    // indica que "Cada usuario puede tener un carrito activo".
    // Esta referencia conecta el carrito a su dueño.
    user_id: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,
        unique: true // Asegura que un usuario solo tenga UN carrito
    },

    // --- Array de Subdocumentos Embebidos ---
    // Aplicamos el 'CartItemSchema' definido arriba.
    items: { type: [CartItemSchema], default: [] },

}, { timestamps: true }); // Útil para saber cuándo se actualizó el carrito

export default mongoose.model('Cart', CartSchema);