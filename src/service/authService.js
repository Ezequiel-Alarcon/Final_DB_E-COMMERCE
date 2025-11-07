import jwt from 'jsonwebtoken';

// Esta es mi "llave secreta". La saco del archivo .env para que no esté visible en el código.
// La uso para "firmar" los tokens y para saber que son míos y no falsos.
const secret = process.env.JWT_SECRET || "default-secret";

// --- Función para CREAR un token ---
// Le paso el usuario (que acabo de registrar o loguear)
export const generateToken = (user) => {
    // Uso jwt.sign para crear el "ticket"
    // Adentro guardo el ID y el ROL del usuario (así sé quién es y qué puede hacer)
    // Lo firmo con mi 'secret' y le digo que dure 1 hora.
    return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: "1h" });
};

// --- Middleware "Guardia": Validador de Token ---
// Esta función es un "middleware", se ejecuta ANTES que el controlador de la ruta.
export const validateToken = (req, res, next) => {
    // 1. Busco el token, que tiene que venir en los 'headers' (encabezados)
    const authHeader = req.headers["authorization"];

    // 2. El token viene así: "Bearer TOKEN_MUY_LARGO".
    // Con .split(" ")[1] me quedo solo con la parte del token.
    const token = authHeader && authHeader.split(" ")[1];

    // 3. Si no me mandó token, lo rechazo (401 = No autorizado)
    if (!token) return res.status(401).json({ success: false, message: "Token requerido" });

    // 4. Si hay token, intento verificarlo con mi 'secret'
    jwt.verify(token, secret, (err, decoded) => {
        // 5. Si da error (es falso, está mal escrito o ya expiró), lo rechazo (403 = Prohibido)
        if (err) return res.status(403).json({ success: false, message: "Token inválido" });

        // 6. ¡ÉXITO! El token es bueno.
        // "Pego" los datos del usuario (el 'decoded' que tiene el ID y el ROL) en el 'req'.
        req.user = decoded;

        // 7. Le digo que siga adelante (que pase al siguiente middleware o al controlador)
        next();
    });
};

// --- Middleware "Guardia VIP": Solo para Admins ---
// Este middleware se usa SIEMPRE DESPUÉS de 'validateToken'
export const requireAdmin = (req, res, next) => {
    // Como 'validateToken' ya se ejecutó, yo ya tengo 'req.user'
    // Solo me fijo si el rol de ese usuario es "admin"
    if (req.user.role !== "admin")
        // Si NO es admin, lo rechazo (403 = Prohibido)
        return res.status(403).json({ success: false, message: "Se requiere rol de administrador" });

    // Si es admin, lo dejo pasar
    next();
};