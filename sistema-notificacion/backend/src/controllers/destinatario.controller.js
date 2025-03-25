const DestinatarioModel = require('../models/destinatario.model');

class DestinatarioController {
  // Obtener todos los destinatarios
  static async getAll(req, res) {
    try {
      const { includeInactive } = req.query;
      const destinatarios = await DestinatarioModel.getAll(includeInactive === 'true');
      res.json(destinatarios);
    } catch (error) {
      console.error('Error al obtener destinatarios:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Obtener destinatario por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const destinatario = await DestinatarioModel.getById(id);
      
      if (!destinatario) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Destinatario no encontrado'
          }
        });
      }
      
      res.json(destinatario);
    } catch (error) {
      console.error('Error al obtener destinatario:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Crear nuevo destinatario
  static async create(req, res) {
    try {
      const { nombre, email, activo } = req.body;
      
      // Validar datos de entrada
      if (!nombre || !email) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATA',
            message: 'Nombre y email son requeridos'
          }
        });
      }
      
      // Verificar si ya existe un destinatario con ese nombre
      const existingDestinatario = await DestinatarioModel.findByNombre(nombre);
      
      if (existingDestinatario) {
        return res.status(400).json({
          error: {
            code: 'DUPLICATE',
            message: 'Ya existe un destinatario con ese nombre'
          }
        });
      }
      
      // Crear destinatario
      const destinatario = await DestinatarioModel.create({
        nombre,
        email,
        activo: activo !== undefined ? activo : 1
      });
      
      res.status(201).json(destinatario);
    } catch (error) {
      console.error('Error al crear destinatario:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Actualizar destinatario
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, email, activo } = req.body;
      
      // Verificar si el destinatario existe
      const destinatario = await DestinatarioModel.getById(id);
      
      if (!destinatario) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Destinatario no encontrado'
          }
        });
      }
      
      // Si se cambia el nombre, verificar que no exista otro destinatario con ese nombre
      if (nombre && nombre !== destinatario.nombre) {
        const existingDestinatario = await DestinatarioModel.findByNombre(nombre);
        
        if (existingDestinatario && existingDestinatario.id !== parseInt(id)) {
          return res.status(400).json({
            error: {
              code: 'DUPLICATE',
              message: 'Ya existe un destinatario con ese nombre'
            }
          });
        }
      }
      
      // Actualizar destinatario
      const destinatarioActualizado = await DestinatarioModel.update(id, {
        nombre,
        email,
        activo
      });
      
      res.json(destinatarioActualizado);
    } catch (error) {
      console.error('Error al actualizar destinatario:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Eliminar destinatario
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar si el destinatario existe
      const destinatario = await DestinatarioModel.getById(id);
      
      if (!destinatario) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Destinatario no encontrado'
          }
        });
      }
      
      // Eliminar destinatario
      await DestinatarioModel.delete(id);
      
      res.json({ message: 'Destinatario eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar destinatario:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Activar/Desactivar destinatario
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
      
      // Verificar si el destinatario existe
      const destinatario = await DestinatarioModel.getById(id);
      
      if (!destinatario) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Destinatario no encontrado'
          }
        });
      }
      
      // Activar/Desactivar destinatario
      const resultado = await DestinatarioModel.toggleActive(id, activo);
      
      res.json(resultado);
    } catch (error) {
      console.error('Error al activar/desactivar destinatario:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
}

module.exports = DestinatarioController;
