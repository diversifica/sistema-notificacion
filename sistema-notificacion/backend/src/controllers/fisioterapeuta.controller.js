const FisioterapeutaModel = require('../models/fisioterapeuta.model');
const ContratoModel = require('../models/contrato.model');
const NotificacionModel = require('../models/notificacion.model');
const path = require('path');
const fs = require('fs');

class FisioterapeutaController {
  // Obtener todos los fisioterapeutas activos
  static async getAllActivos(req, res) {
    try {
      const fisioterapeutas = await FisioterapeutaModel.getAllActivos();
      res.json(fisioterapeutas);
    } catch (error) {
      console.error('Error al obtener fisioterapeutas activos:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Obtener todos los fisioterapeutas inactivos
  static async getAllInactivos(req, res) {
    try {
      const fisioterapeutas = await FisioterapeutaModel.getAllInactivos();
      res.json(fisioterapeutas);
    } catch (error) {
      console.error('Error al obtener fisioterapeutas inactivos:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Obtener fisioterapeuta por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const fisioterapeuta = await FisioterapeutaModel.getById(id);
      
      if (!fisioterapeuta) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Fisioterapeuta no encontrado'
          }
        });
      }
      
      // Obtener contrato asociado
      const contrato = await ContratoModel.getByFisioterapeutaId(id);
      
      res.json({
        ...fisioterapeuta,
        contrato
      });
    } catch (error) {
      console.error('Error al obtener fisioterapeuta:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Crear nuevo fisioterapeuta
  static async create(req, res) {
    try {
      const { nombre, apellidos, email, finess, fecha_alta, ruta_contrato } = req.body;
      
      // Validar datos de entrada
      if (!nombre || !apellidos || !email || !finess || !fecha_alta) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATA',
            message: 'Todos los campos son requeridos'
          }
        });
      }
      
      // Crear fisioterapeuta
      const fisioterapeuta = await FisioterapeutaModel.create({
        nombre,
        apellidos,
        email,
        finess,
        fecha_alta,
        ruta_contrato
      });
      
      res.status(201).json(fisioterapeuta);
    } catch (error) {
      console.error('Error al crear fisioterapeuta:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Actualizar fisioterapeuta
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellidos, email, finess } = req.body;
      
      // Verificar si el fisioterapeuta existe
      const fisioterapeuta = await FisioterapeutaModel.getById(id);
      
      if (!fisioterapeuta) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Fisioterapeuta no encontrado'
          }
        });
      }
      
      // Actualizar fisioterapeuta
      const fisioterapeutaActualizado = await FisioterapeutaModel.update(id, {
        nombre,
        apellidos,
        email,
        finess
      });
      
      res.json(fisioterapeutaActualizado);
    } catch (error) {
      console.error('Error al actualizar fisioterapeuta:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Dar de baja fisioterapeuta
  static async darDeBaja(req, res) {
    try {
      const { id } = req.params;
      const { fecha_baja } = req.body;
      
      // Validar datos de entrada
      if (!fecha_baja) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATA',
            message: 'Fecha de baja es requerida'
          }
        });
      }
      
      // Verificar si el fisioterapeuta existe
      const fisioterapeuta = await FisioterapeutaModel.getById(id);
      
      if (!fisioterapeuta) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Fisioterapeuta no encontrado'
          }
        });
      }
      
      // Verificar que la fecha de baja sea posterior a la fecha de alta
      if (new Date(fecha_baja) <= new Date(fisioterapeuta.fecha_alta)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATE',
            message: 'La fecha de baja debe ser posterior a la fecha de alta'
          }
        });
      }
      
      // Dar de baja fisioterapeuta
      const resultado = await FisioterapeutaModel.darDeBaja(id, fecha_baja);
      
      res.json(resultado);
    } catch (error) {
      console.error('Error al dar de baja fisioterapeuta:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Registrar notificación de alta
  static async registrarNotificacionAlta(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar si el fisioterapeuta existe
      const fisioterapeuta = await FisioterapeutaModel.getById(id);
      
      if (!fisioterapeuta) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Fisioterapeuta no encontrado'
          }
        });
      }
      
      // Registrar notificación de alta
      const fecha_notificacion_alta = new Date().toISOString();
      const resultado = await FisioterapeutaModel.registrarNotificacionAlta(id, fecha_notificacion_alta);
      
      res.json(resultado);
    } catch (error) {
      console.error('Error al registrar notificación de alta:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Registrar notificación de baja
  static async registrarNotificacionBaja(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar si el fisioterapeuta existe
      const fisioterapeuta = await FisioterapeutaModel.getById(id);
      
      if (!fisioterapeuta) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Fisioterapeuta no encontrado'
          }
        });
      }
      
      // Verificar que tenga fecha de baja
      if (!fisioterapeuta.fecha_baja) {
        return res.status(400).json({
          error: {
            code: 'INVALID_STATE',
            message: 'El fisioterapeuta no tiene fecha de baja'
          }
        });
      }
      
      // Registrar notificación de baja y actualizar estado
      const fecha_notificacion_baja = new Date().toISOString();
      const resultado = await FisioterapeutaModel.actualizarEstadoInactivo(id, fecha_notificacion_baja);
      
      res.json(resultado);
    } catch (error) {
      console.error('Error al registrar notificación de baja:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Eliminar fisioterapeuta
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar si el fisioterapeuta existe
      const fisioterapeuta = await FisioterapeutaModel.getById(id);
      
      if (!fisioterapeuta) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Fisioterapeuta no encontrado'
          }
        });
      }
      
      // Eliminar fisioterapeuta
      await FisioterapeutaModel.delete(id);
      
      res.json({ message: 'Fisioterapeuta eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar fisioterapeuta:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Buscar fisioterapeutas
  static async search(req, res) {
    try {
      const { q, estado } = req.query;
      
      if (!q) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATA',
            message: 'Término de búsqueda requerido'
          }
        });
      }
      
      const fisioterapeutas = await FisioterapeutaModel.search(q, estado);
      
      res.json(fisioterapeutas);
    } catch (error) {
      console.error('Error al buscar fisioterapeutas:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Obtener fisioterapeutas pendientes de notificar alta
  static async getPendientesNotificarAlta(req, res) {
    try {
      const fisioterapeutas = await FisioterapeutaModel.getPendientesNotificarAlta();
      res.json(fisioterapeutas);
    } catch (error) {
      console.error('Error al obtener fisioterapeutas pendientes de notificar alta:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Obtener fisioterapeutas pendientes de notificar baja
  static async getPendientesNotificarBaja(req, res) {
    try {
      const fisioterapeutas = await FisioterapeutaModel.getPendientesNotificarBaja();
      res.json(fisioterapeutas);
    } catch (error) {
      console.error('Error al obtener fisioterapeutas pendientes de notificar baja:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
}

module.exports = FisioterapeutaController;
