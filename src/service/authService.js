import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || "default-secret";

// --- Función para CREAR un token ---
export const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: "1h" });
};

// --- Middleware "Guardia": Validador de Token ---
export const validateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ success: false, message: "Token requerido" });

    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(403).json({ success: false, message: "Token inválido" });
        req.user = decoded;
        next();
    });
};

// --- Middleware "Guardia VIP": Solo para Admins ---
export const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin")
        return res.status(403).json({ success: false, message: "Se requiere rol de administrador" });
    next();
};