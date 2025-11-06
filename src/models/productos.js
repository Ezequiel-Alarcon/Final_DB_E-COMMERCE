import mongoose from "mongoose";

// --- MODELO DE REFERENCIA (Referenced) ---
// Se define el esquema 'Producto' en su propia colección.
//
// Justificación:
// 1. Entidad Principal: 'Producto' es una entidad central
//    del e-commerce con su propio CRUD.
// 2. Relación N-a-1 (Muchos-a-Uno): Muchos productos
//    pertenecerán a UNA categoría.
const productoSchema = mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },

    // --- Referencia a 'Categoria' (Corregido) ---
    // Justificación: Se usa una referencia (ObjectId) en lugar
    // de embeber el documento completo de la categoría.
    //
    // Razón: Eficiencia de Almacenamiento. Si embebiéramos
    // el nombre de la categoría (ej: "Laptops"), ese dato
    // se duplicaría en miles de productos. Con la referencia,
    // solo almacenamos el ID, y usamos $lookup o .populate()
    // (como pide la consigna) para obtener los detalles.
    categoria_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categoria", // El string "Categoria" apunta al modelo Categoria.
        required: true
    },

    precio: { type: Number, required: true, min: 0.1 },
    stock: { type: Number, required: true, min: 0 },

    // --- Denormalización de Reseñas ---
    // Justificación: La consigna pide un modelo 'Resenas' separado,
    // pero también "un campo de reseñas o calificaciones" en el producto.
    //
    // Estos campos (numResenas, calificacionPromedio) son "denormalizados".
    // Se calculan y actualizan cada vez que se añade/elimina una reseña
    // para mejorar el rendimiento (performance) al listar productos,
    // evitando $lookups o $groups costosos solo para mostrar la calificación.
    numResenas: { type: Number, default: 0 },
    calificacionPromedio: { type: Number, default: 0 }
}, {
    collection: "productos"
});

export const Producto = mongoose.model("Producto", productoSchema);
