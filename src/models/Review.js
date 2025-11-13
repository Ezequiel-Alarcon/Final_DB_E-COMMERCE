import mongoose from "mongoose";

// --- MODELO DE REFERENCIA ---
const ReviewSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    producto_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    calificacion: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model("Review", ReviewSchema);