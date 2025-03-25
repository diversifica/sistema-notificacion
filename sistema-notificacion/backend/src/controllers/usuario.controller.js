const UsuarioModel = require('../models/usuario.model');
const bcrypt = require('bcrypt');

class UsuarioController {
  // Obtener todos los usuarios
  static async getAll(req, res) {
    try {
      const { includeInactive } = req.query;
      const usuarios = await UsuarioModel.getAll(includeInactive === 'true');
      res.json(usuarios);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Obtener usuario por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioModel.getById(id);
      
      if (!usuario) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Usuario no encontrado'
          }
        });
      }
      
      res.json(usuario);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Crear nuevo usuario
  static async create(req, res) {
    try {
      const { nombre, apellidos, email, password, rol, activo } = req.body;
      
      // Validar datos de entrada
      if (!nombre || !apellidos || !email || !password) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATA',
            message: 'Nombre, apellidos, email y contraseña son requeridos'
          }
        });
      }
      
      // Verificar si ya existe un usuario con ese email
      const existingUsuario = await UsuarioModel.getByEmail(email);
      
      if (existingUsuario) {
        return res.status(400).json({
          error: {
            code: 'DUPLICATE',
            message: 'Ya existe un usuario con ese email'
          }
        });
      }
      
      // Validar longitud de la contraseña
      if (password.length < 6) {
        return res.status(400).json({
          error: {
            code: 'INVALID_PASSWORD',
            message: 'La contraseña debe tener al menos 6 caracteres'
          }
        });
      }
      
      // Crear usuario
      const usuario = await UsuarioModel.create({
        nombre,
        apellidos,
        email,
        password,
        rol: rol || 'USUARIO',
        activo: activo !== undefined ? activo : 1
      });
      
      res.status(201).json(usuario);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Actualizar usuario
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellidos, email, password, rol, activo } = req.body;
      
      // Verificar si el usuario existe
      const usuario = await UsuarioModel.getById(id);
      
      if (!usuario) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Usuario no encontrado'
          }
        });
      }
      
      // Si se cambia el email, verificar que no exista otro usuario con ese email
      if (email && email !== usuario.email) {
        const existingUsuario = await UsuarioModel.getByEmail(email);
        
        if (existingUsuario && existingUsuario.id !== parseInt(id)) {
          return res.status(400).json({
            error: {
              code: 'DUPLICATE',
              message: 'Ya existe un usuario con ese email'
            }
          });
        }
      }
      
      // Validar longitud de la contraseña si se proporciona
      if (password && password.length < 6) {
        return res.status(400).json({
          error: {
            code: 'INVALID_PASSWORD',
            message: 'La contraseña debe tener al menos 6 caracteres'
          }
        });
      }
      
      // Actualizar usuario
      const usuarioActualizado = await UsuarioModel.update(id, {
        nombre,
        apellidos,
        email,
        password,
        rol,
        activo
      });
      
      res.json(usuarioActualizado);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Eliminar usuario
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar si el usuario existe
      const usuario = await UsuarioModel.getById(id);
      
      if (!usuario) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Usuario no encontrado'
          }
        });
      }
      
      // No permitir eliminar el propio usuario
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          error: {
            code: 'INVALID_OPERATION',
            message: 'No puede eliminar su propio usuario'
          }
        });
      }
      
      // Eliminar usuario
      await UsuarioModel.delete(id);
      
      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Activar/Desactivar usuario
  static async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const { activo } = req.body;
      
      // Validar datos de entrada
      if (activo === undefined) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATA',
            message: 'El campo activo es requerido'
          }
        });
      }
      
      // Verificar si el usuario existe
      const usuario = await UsuarioModel.getById(id);
      
      if (!usuario) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Usuario no encontrado'
          }
        });
      }
      
      // No permitir desactivar el propio usuario
      if (parseInt(id) === req.user.id && !activo) {
        return res.status(400).json({
          error: {
            code: 'INVALID_OPERATION',
            message: 'No puede desactivar su propio usuario'
          }
        });
      }
      
      // Activar/Desactivar usuario
      const resultado = await UsuarioModel.toggleActive(id, activo);
      
      res.json(resultado);
    } catch (error) {
      console.error('Error al activar/desactivar usuario:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
}

module.exports = UsuarioController;
