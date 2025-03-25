const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UsuarioModel = require('../models/usuario.model');

class AuthController {
  // Login
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validar datos de entrada
      if (!email || !password) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATA',
            message: 'Email y contraseña son requeridos'
          }
        });
      }
      
      // Verificar credenciales
      const usuario = await UsuarioModel.verifyCredentials(email, password);
      
      if (!usuario) {
        return res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Credenciales inválidas'
          }
        });
      }
      
      // Generar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email,
          rol: usuario.rol
        },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '8h' }
      );
      
      // Responder con el token y datos del usuario
      res.json({
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          email: usuario.email,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
  
  // Obtener perfil del usuario actual
  static async getProfile(req, res) {
    try {
      const usuario = await UsuarioModel.getById(req.user.id);
      
      if (!usuario) {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuario no encontrado'
          }
        });
      }
      
      // No devolver la contraseña
      const { password, ...usuarioSinPassword } = usuario;
      
      res.json(usuarioSinPassword);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
  
  // Cambiar contraseña
  static async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      
      // Validar datos de entrada
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATA',
            message: 'Contraseña actual y nueva contraseña son requeridas'
          }
        });
      }
      
      // Validar longitud de la nueva contraseña
      if (newPassword.length < 6) {
        return res.status(400).json({
          error: {
            code: 'INVALID_PASSWORD',
            message: 'La nueva contraseña debe tener al menos 6 caracteres'
          }
        });
      }
      
      // Cambiar contraseña
      await UsuarioModel.changePassword(req.user.id, oldPassword, newPassword);
      
      res.json({
        message: 'Contraseña actualizada correctamente'
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      
      if (error.message === 'Contraseña actual incorrecta') {
        return res.status(400).json({
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Contraseña actual incorrecta'
          }
        });
      }
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
  
  // Verificar token
  static async verifyToken(req, res) {
    try {
      // El middleware verifyToken ya ha verificado el token
      // y ha añadido el usuario decodificado a req.user
      
      const usuario = await UsuarioModel.getById(req.user.id);
      
      if (!usuario || !usuario.activo) {
        return res.status(401).json({
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token inválido o usuario inactivo'
          }
        });
      }
      
      // No devolver la contraseña
      const { password, ...usuarioSinPassword } = usuario;
      
      res.json({
        valid: true,
        usuario: usuarioSinPassword
      });
    } catch (error) {
      console.error('Error al verificar token:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
}

module.exports = AuthController;
