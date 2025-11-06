import mongoose from "mongoose";

// --- MODELO DE REFERENCIA (Association Collection) ---
// Se define el esquema 'Resena' en su propia colección.
//
// Justificación:
// 1. Entidad Independiente y Asociación: 'Resena' es una entidad
//    que "conecta" a 'Usuario' y 'Producto'. Tiene su propio
//    CRUD, como pide la consigna.
// 2. Relación N-a-M (Implementación): Este modelo funciona
//    como la "tabla intermedia" (join table) que implementa
//    la relación Muchos-a-Muchos (N-M):
//    - Un Usuario puede escribir N Reseñas.
//    - Un Producto puede recibir N Reseñas.
const resenaSchema = mongoose.Schema({
    calificacion: { type: Number, required: true, min: 1, max: 5 }, // Calificación (ej. 1-5 estrellas)
    comentario: { type: String }, // Comentario (opcional)

    // --- Referencia a 'Usuario' (Corregido) ---
    // Justificación: (Relación 1-a-N) Una reseña pertenece
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },

    // --- Referencia a 'Producto' (Corregido) ---
    // Justificación: (Relación 1-a-N) Una reseña es sobre
    producto_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto",
        required: true
    }
    
}, {
    collection: "resenas",
    timestamps: true 
});

export const Resena = mongoose.model("Resena", resenaSchema);