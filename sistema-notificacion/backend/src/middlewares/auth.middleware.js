const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/usuario.model');

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
  // Obtener el token del encabezado de autorización
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Se requiere autenticación'
      }
    });
  }
  
  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    
    // Añadir el usuario decodificado a la solicitud
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido o expirado'
      }
    });
  }
};

// Middleware para verificar roles
const verifyRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Se requiere autenticación'
        }
      });
    }
    
    if (roles.includes(req.user.rol)) {
      next();
    } else {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'No tiene permisos para acceder a este recurso'
        }
      });
    }
  };
};

// Middleware para verificar que el usuario existe y está activo
const verifyUser = async (req, res, next) => {
  try {
    const usuario = await UsuarioModel.getById(req.user.id);
    
    if (!usuario) {
      return res.status(401).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado'
        }
      });
    }
    
    if (!usuario.activo) {
      return res.status(403).json({
        error: {
          code: 'USER_INACTIVE',
          message: 'Usuario inactivo'
        }
      });
    }
    
    // Actualizar la información del usuario en la solicitud
    req.user = {
      ...req.user,
      ...usuario
    };
    
    next();
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
};

module.exports = {
  verifyToken,
  verifyRoles,
  verifyUser
};
