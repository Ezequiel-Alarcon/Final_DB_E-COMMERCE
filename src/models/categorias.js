import mongoose from "mongoose";

// --- MODELO DE REFERENCIA (Referenced) ---
// Se define el esquema 'Categoria' en su propia colección.
//
// Justificación:
// 1. Entidad Independiente: 'Categoría' es una entidad principal
//    del e-commerce. Necesita su propio CRUD (Crear, Leer, Actualizar, Borrar)
// 2. Relación 1-a-N (Uno-a-Muchos): Una categoría (ej: "Laptops")
//    agrupará a muchos productos.
// 3. Reusabilidad: Al ser una colección separada, el modelo 'Producto'
//    podrá "referenciar" a 'Categoria' usando su ObjectId.
const categoriaSchema = mongoose.Schema({
    nombre: { type: String, required: true, unique: true }, // Añadí 'unique' (buena práctica)
    descripcion: { type: String, required: true }
}, {
    collection: "categorias"
});

// Corregido: Usamos 'Categoria' (singular) por convención
export const Categoria = mongoose.model("Categoria", categoriaSchema);