const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ContratoModel = require('../models/contrato.model');
const FisioterapeutaModel = require('../models/fisioterapeuta.model');

class ContratoController {
  // Configuración de almacenamiento para multer
  static getStorage() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const contratosDir = process.env.CONTRATOS_DIR || path.join(__dirname, '../../storage/contratos');
        
        // Asegurarse de que el directorio existe
        if (!fs.existsSync(contratosDir)) {
          fs.mkdirSync(contratosDir, { recursive: true });
        }
        
        cb(null, contratosDir);
      },
      filename: (req, file, cb) => {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'contrato-' + uniqueSuffix + ext);
      }
    });
    
    return storage;
  }
  
  // Configuración de filtro para multer
  static getFileFilter() {
    return (req, file, cb) => {
      // Aceptar solo archivos PDF
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos PDF'), false);
      }
    };
  }
  
  // Obtener todos los contratos
  static async getAll(req, res) {
    try {
      const { fisioterapeuta_id } = req.query;
      const contratos = await ContratoModel.getAll(fisioterapeuta_id);
      res.json(contratos);
    } catch (error) {
      console.error('Error al obtener contratos:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
  
  // Obtener contrato por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const contrato = await ContratoModel.getById(id);
      
      if (!contrato) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Contrato no encontrado'
          }
        });
      }
      
      res.json(contrato);
    } catch (error) {
      console.error('Error al obtener contrato:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
  
  // Subir contrato
  static async upload(req, res) {
    try {
      // El archivo ya ha sido subido por multer
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({
          error: {
            code: 'NO_FILE',
            message: 'No se ha subido ningún archivo'
          }
        });
      }
      
      // Parsear el nombre del archivo para extraer información del fisioterapeuta
      const fisioterapeutaInfo = ContratoModel.parseFileName(file.originalname);
      
      if (!fisioterapeutaInfo) {
        return res.status(400).json({
          error: {
            code: 'INVALID_FILENAME',
            message: 'El nombre del archivo no sigue el formato requerido (DD-MM-AAAA NOMBRE APELLIDO(S))'
          }
        });
      }
      
      // Verificar si ya existe un fisioterapeuta con ese nombre
      let fisioterapeuta = await FisioterapeutaModel.search(fisioterapeutaInfo.nombre_completo);
      
      // Si no existe, crear un nuevo fisioterapeuta
      if (fisioterapeuta.length === 0) {
        fisioterapeuta = await FisioterapeutaModel.create({
          nombre: fisioterapeutaInfo.nombre,
          apellidos: fisioterapeutaInfo.apellidos,
          email: '',
          finess: '',
          fecha_alta: fisioterapeutaInfo.fecha_alta,
          ruta_contrato: file.path
        });
      } else {
        fisioterapeuta = fisioterapeuta[0];
      }
      
      // Crear el contrato
      const contrato = await ContratoModel.create({
        fisioterapeuta_id: fisioterapeuta.id,
        nombre_archivo: file.originalname,
        ruta_archivo: file.path
      });
      
      // Actualizar la ruta del contrato en el fisioterapeuta si no tiene
      if (!fisioterapeuta.ruta_contrato) {
        await FisioterapeutaModel.update(fisioterapeuta.id, {
          ruta_contrato: file.path
        });
      }
      
      res.status(201).json({
        contrato,
        fisioterapeuta
      });
    } catch (error) {
      console.error('Error al subir contrato:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
  
  // Eliminar contrato
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar si el contrato existe
      const contrato = await ContratoModel.getById(id);
      
      if (!contrato) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Contrato no encontrado'
          }
        });
      }
      
      // Eliminar el contrato
      const resultado = await ContratoModel.delete(id);
      
      // Eliminar el archivo físico
      if (resultado.ruta_archivo && fs.existsSync(resultado.ruta_archivo)) {
        fs.unlinkSync(resultado.ruta_archivo);
      }
      
      res.json({ message: 'Contrato eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar contrato:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
}

module.exports = ContratoController;
