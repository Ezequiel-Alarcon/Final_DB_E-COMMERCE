import mongoose from "mongoose";

const CategorySchema = mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    descripcion: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Category', CategorySchema);