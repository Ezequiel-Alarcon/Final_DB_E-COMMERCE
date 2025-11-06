import mongoose from "mongoose";

// --- Subdocumento Embebido (Embedded) ---
// Justificación: La consigna pide "productos seleccionados y cantidades".

// Se crea un subdocumento 'Item' que almacena la referencia al producto
// y la cantidad de ese producto. Estos items "pertenecen" al carrito
// y no tienen sentido por sí solos.
const itemSchema = mongoose.Schema({
    producto_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto",
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1 // Un item en el carrito debe tener al menos 1 de cantidad
    }
}, { 
    // No necesita su propio _id
    _id: false 
});

const carritoSchema = mongoose.Schema({
    // --- Referencia a 'Usuario' ---
    // Justificación: (Relación 1-a-1). La consigna
    // indica que "Cada usuario puede tener un carrito activo".
    // Esta referencia conecta el carrito a su dueño.
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true,
        unique: true // Asegura que un usuario solo tenga UN carrito
    },
    
    // --- Array de Subdocumentos Embebidos ---
    // Aplicamos el 'itemSchema' definido arriba.
    items: [itemSchema] 

}, {
    collection: "carritos",
    timestamps: true // Útil para saber cuándo se actualizó el carrito
});

export const Carrito = mongoose.model("Carrito", carritoSchema);
