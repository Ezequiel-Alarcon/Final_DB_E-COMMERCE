import bcrypt from 'bcryptjs';

// --- Función para Encriptar Contraseñas ---
// (Esta la usaría en el 'register')
export const encriptPass = async (contrasena) => {
    // 1. Genero un 'salt' (una "semilla" aleatoria) de 10 vueltas.
    const salt = await bcrypt.genSalt(10);
    // 2. Hasheo la contraseña usando ese salt
    return bcrypt.hash(contrasena, salt);
}

// --- Función para Comparar Contraseñas ---
// (Esta la usaría en el 'login')
export const validatePass = async (contrasena, hash) => {
    // 1. 'contrasena' = la que escribe el usuario (ej: "123456")
    // 2. 'hash' = la que está guardada en la BD (ej: "$2a$10$...")
    // bcrypt compara si "123456" hasheada es igual al hash guardado.
    return bcrypt.compare(contrasena, hash);
}