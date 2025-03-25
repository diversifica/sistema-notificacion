const PlantillaModel = require('../models/plantilla.model');

class PlantillaController {
  // Obtener todas las plantillas
  static async getAll(req, res) {
    try {
      const { includeInactive } = req.query;
      const plantillas = await PlantillaModel.getAll(includeInactive === 'true');
      res.json(plantillas);
    } catch (error) {
      console.error('Error al obtener plantillas:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Obtener plantilla por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const plantilla = await PlantillaModel.getById(id);
      
      if (!plantilla) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Plantilla no encontrada'
          }
        });
      }
      
      res.json(plantilla);
    } catch (error) {
      console.error('Error al obtener plantilla:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Obtener plantilla por nombre
  static async getByNombre(req, res) {
    try {
      const { nombre } = req.params;
      const plantilla = await PlantillaModel.getByNombre(nombre);
      
      if (!plantilla) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Plantilla no encontrada'
          }
        });
      }
      
      res.json(plantilla);
    } catch (error) {
      console.error('Error al obtener plantilla por nombre:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Crear nueva plantilla
  static async create(req, res) {
    try {
      const { nombre, asunto, cuerpo, activo } = req.body;
      
      // Validar datos de entrada
      if (!nombre || !asunto || !cuerpo) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATA',
            message: 'Nombre, asunto y cuerpo son requeridos'
          }
        });
      }
      
      // Verificar si ya existe una plantilla con ese nombre
      const existingPlantilla = await PlantillaModel.getByNombre(nombre);
      
      if (existingPlantilla) {
        return res.status(400).json({
          error: {
            code: 'DUPLICATE',
            message: 'Ya existe una plantilla con ese nombre'
          }
        });
      }
      
      // Crear plantilla
      const plantilla = await PlantillaModel.create({
        nombre,
        asunto,
        cuerpo,
        activo: activo !== undefined ? activo : 1
      });
      
      res.status(201).json(plantilla);
    } catch (error) {
      console.error('Error al crear plantilla:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Actualizar plantilla
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, asunto, cuerpo, activo } = req.body;
      
      // Verificar si la plantilla existe
      const plantilla = await PlantillaModel.getById(id);
      
      if (!plantilla) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Plantilla no encontrada'
          }
        });
      }
      
      // Si se cambia el nombre, verificar que no exista otra plantilla con ese nombre
      if (nombre && nombre !== plantilla.nombre) {
        const existingPlantilla = await PlantillaModel.getByNombre(nombre);
        
        if (existingPlantilla && existingPlantilla.id !== parseInt(id)) {
          return res.status(400).json({
            error: {
              code: 'DUPLICATE',
              message: 'Ya existe una plantilla con ese nombre'
            }
          });
        }
      }
      
      // Actualizar plantilla
      const plantillaActualizada = await PlantillaModel.update(id, {
        nombre,
        asunto,
        cuerpo,
        activo
      });
      
      res.json(plantillaActualizada);
    } catch (error) {
      console.error('Error al actualizar plantilla:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Eliminar plantilla
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar si la plantilla existe
      const plantilla = await PlantillaModel.getById(id);
      
      if (!plantilla) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Plantilla no encontrada'
          }
        });
      }
      
      // Eliminar plantilla
      await PlantillaModel.delete(id);
      
      res.json({ message: 'Plantilla eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar plantilla:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }

  // Activar/Desactivar plantilla
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
      
      // Verificar si la plantilla existe
      const plantilla = await PlantillaModel.getById(id);
      
      if (!plantilla) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Plantilla no encontrada'
          }
        });
      }
      
      // Activar/Desactivar plantilla
      const resultado = await PlantillaModel.toggleActive(id, activo);
      
      res.json(resultado);
    } catch (error) {
      console.error('Error al activar/desactivar plantilla:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
}

module.exports = PlantillaController;
