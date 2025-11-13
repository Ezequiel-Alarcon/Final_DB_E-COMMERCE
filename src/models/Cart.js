import mongoose from "mongoose";

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
    user_id: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,
        unique: true 
    },
    items: { type: [CartItemSchema], default: [] },

}, { timestamps: true }); // Útil para saber cuándo se actualizó el carrito

export default mongoose.model('Cart', CartSchema);