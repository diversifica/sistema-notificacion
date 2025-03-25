const ConfiguracionModel = require('../models/configuracion.model');

class ConfiguracionController {
  // Obtener todas las configuraciones
  static async getAll(req, res) {
    try {
      const configuraciones = await ConfiguracionModel.getAll();
      res.json(configuraciones);
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Obtener configuración por clave
  static async getByKey(req, res) {
    try {
      const { clave } = req.params;
      const configuracion = await ConfiguracionModel.getByKey(clave);
      
      if (!configuracion) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Configuración no encontrada'
          }
        });
      }
      
      res.json(configuracion);
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Obtener configuraciones por prefijo
  static async getByPrefix(req, res) {
    try {
      const { prefix } = req.params;
      const configuraciones = await ConfiguracionModel.getByPrefix(prefix);
      res.json(configuraciones);
    } catch (error) {
      console.error('Error al obtener configuraciones por prefijo:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Obtener configuración de correo
  static async getEmailConfig(req, res) {
    try {
      const emailConfig = await ConfiguracionModel.getEmailConfig();
      res.json(emailConfig);
    } catch (error) {
      console.error('Error al obtener configuración de correo:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Establecer configuración
  static async set(req, res) {
    try {
      const { clave, valor, descripcion } = req.body;
      
      // Validar datos de entrada
      if (!clave || valor === undefined) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATA',
            message: 'Clave y valor son requeridos'
          }
        });
      }
      
      // Establecer configuración
      const configuracion = await ConfiguracionModel.set(clave, valor, descripcion);
      
      res.json(configuracion);
    } catch (error) {
      console.error('Error al establecer configuración:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Eliminar configuración
  static async delete(req, res) {
    try {
      const { clave } = req.params;
      
      // Verificar si la configuración existe
      const configuracion = await ConfiguracionModel.getByKey(clave);
      
      if (!configuracion) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Configuración no encontrada'
          }
        });
      }
      
      // Eliminar configuración
      await ConfiguracionModel.delete(clave);
      
      res.json({ message: 'Configuración eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar configuración:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
}

module.exports = ConfiguracionController;
