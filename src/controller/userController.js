import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { generateToken } from '../service/authService.js';

// --- REGISTRAR UN NUEVO USUARIO ---
// (Ruta: POST /api/users/register)
export const registerUser = async (req, res, next) => {
    // 1. Obtenemos los datos del body
    const { name, email, password, phone } = req.body;

    try {
        // 2. Verificamos si el email ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'El email ya está registrado' });
        }

        // 3. Creamos el usuario en memoria
        const user = new User({
            name,
            email,
            password,
            phone
        });
        
        // 4. Guardamos el usuario en la BD
        // El modelo User.js encripta la contraseña automáticamente antes de guardarla
        const createdUser = await user.save();

        // 5. Creamos su carrito vacío
        await Cart.create({ user_id: createdUser._id, items: [] });

        // 6. Creamos su "ticket" de acceso (Token)
        const token = generateToken({ _id: createdUser._id, role: createdUser.role });

        // 7. Respondemos con éxito
        res.status(201).json({
            success: true,
            data: {
                _id: createdUser._id,
                name: createdUser.name,
                email: createdUser.email,
                role: createdUser.role,
                token
            }
        });

    } catch (error) {
        next(error); // Enviamos cualquier error al manejador
    }
};

// --- LOGIN DE USUARIO ---
// (Ruta: POST /api/users/login)
export const loginUser = async (req, res, next) => {
    // 1. Obtenemos email y password
    const { email, password } = req.body;

    try {
        // 2. Buscamos al usuario.
        // Usamos .select('+password') porque en el modelo User.js esta marcada como oculta
        const user = await User.findOne({ email }).select('+password');

        // 3. Si no existe, mandamos error
        if (!user) {
            return res.status(401).json({ success: false, message: 'Email o contraseña inválidos' });
        }

        // 4. Comparamos la contraseña
        // Usamos el método .comparePassword() que creamos en el modelo User.js
        const isMatch = await user.comparePassword(password);

        // 5. Si no coinciden, mandamos error
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Email o contraseña inválidos' });
        }

        // 6. Si todo está OK, creamos su "ticket" (Token)
        const token = generateToken({ _id: user._id, role: user.role });

        // 7. Respondemos con éxito
        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            }
        });

    } catch (error) {
        next(error);
    }
};

// --- OBTENER TODOS LOS USUARIOS (SOLO ADMIN) ---
// (Ruta: GET /api/users)
export const getAllUsers = async (req, res, next) => {
    try {
        // 1. Busca todos los usuarios (esta ruta la protege el middleware 'requireAdmin')
        const users = await User.find({});
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

// --- ELIMINAR UN USUARIO (SOLO ADMIN) ---
// (Ruta: DELETE /api/users/:id)
export const deleteUser = async (req, res, next) => {
    try {
        // 1. Buscamos al usuario por su ID (viene en la URL)
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // 2. Borramos el usuario
        await user.deleteOne();
        
        // 3. Borramos también su carrito (Requisito del PDF)
        await Cart.deleteOne({ user_id: req.params.id });

        res.json({ success: true, message: 'Usuario y su carrito eliminados' });

    } catch (error) {
        next(error);
    }
};

// --- OBTENER UN USUARIO POR ID ---
// (Ruta: GET /api/users/:id)
export const getUserById = async (req, res, next) => {
    try {
        // 1. Buscamos el usuario por el ID de la URL
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // 2. Verificación de permisos:
        // Esta ruta la protege solo 'validateToken' (no 'requireAdmin')
        // Tenemos que asegurar que un 'client' solo pueda ver SU PROPIO perfil.
        // req.user.id viene del token (quién SOY YO)
        // req.params.id viene de la URL (a quién QUIERO VER)
        if (req.user.role !== 'admin' && req.user.id !== user._id.toString()) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para ver este perfil' });
        }

        // 3. Si es admin o es el mismo usuario, lo mostramos
        res.json({ success: true, data: user });

    } catch (error) {
        next(error);
    }
};

// --- ACTUALIZAR UN USUARIO ---
// (Ruta: PUT /api/users/:id)
export const updateUser = async (req, res, next) => {
    try {
        // 1. Verificamos permisos (igual que arriba)
        if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para modificar este usuario' });
        }
        
        // 2. Buscamos y actualizamos
        // req.body puede traer: { name, phone, addresses }
        // No dejamos que actualice email, password o role por aquí.
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // {new: true} devuelve el documento actualizado
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // 3. Respondemos con el usuario actualizado
        res.json({ success: true, data: updatedUser });

    } catch (error) {
        next(error);
    }
};