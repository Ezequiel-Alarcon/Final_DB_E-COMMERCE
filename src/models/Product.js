import mongoose from "mongoose";

// --- MODELO DE REFERENCIA (Referenced) ---
const ProductSchema = mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    categoria_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    precio: { type: Number, required: true, min: 0.1 },
    stock: { type: Number, required: true, min: 0 },
    numResenas: { type: Number, default: 0 },
    calificacionPromedio: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);