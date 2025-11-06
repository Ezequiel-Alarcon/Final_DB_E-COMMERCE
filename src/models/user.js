import mongoose from "mongoose";

// --- Subdocumento Embebido (Embedded) ---
// Se define un esquema para 'direcciones' que será usado
// dentro del documento principal 'Usuario'.
//
// Justificación: Se utiliza un subdocumento (embebido) porque
// la dirección es un dato que "pertenece" al usuario.
// No tiene sentido que una dirección exista por sí sola.
// Al embeberlas, cuando consultamos un Usuario, también
// obtenemos sus direcciones en la misma consulta.
const addressSchema = mongoose.Schema({
    street: String,
    city: String,
    zip: String,
    country: String
}, {
    // No es necesario un ID propio para el subdocumento
    _id: false 
});

const usuarioSchema = mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    
    // Aplicamos el esquema embebido como un array.
    direcciones: [addressSchema], 
    
    rol: { type: String, enum: ['user', 'admin'], default: 'user' },
    telefono: { type: Number },
    createdAt: { type: Date, default: Date.now }
}, {
    collection: 'usuarios'
});

export const Usuario = mongoose.model('Usuario', usuarioSchema);
