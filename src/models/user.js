import mongoose from "mongoose";
import bcrypt from 'bcryptjs';


// Justificación: Se utiliza un subdocumento (embebido) porque
// la dirección es un dato que "pertenece" al usuario.
// No tiene sentido que una dirección exista por sí sola.
// Al embeberlas, cuando consultamos un Usuario, también
// obtenemos sus direcciones en la misma consulta.
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['client', 'admin'], default: 'client' },
    phone: { type: String, trim: true },
    addresses: [{ street: String, city: String, country: String }] // embebido
}, { timestamps: true });

// Hook para hashear password antes de guardar
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para comparar password
userSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);