import bcrypt from 'bcryptjs';

// --- Función para Encriptar Contraseñas ---
export const encriptPass = async (contrasena) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(contrasena, salt);
}

// --- Función para Comparar Contraseñas ---
export const validatePass = async (contrasena, hash) => {
    return bcrypt.compare(contrasena, hash);
}