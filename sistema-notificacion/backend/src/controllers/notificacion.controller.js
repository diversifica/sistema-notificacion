const NotificacionModel = require('../models/notificacion.model');
const FisioterapeutaModel = require('../models/fisioterapeuta.model');
const DestinatarioModel = require('../models/destinatario.model');
const PlantillaModel = require('../models/plantilla.model');
const ConfiguracionModel = require('../models/configuracion.model');
const ContratoModel = require('../models/contrato.model');
const nodemailer = require('nodemailer');
const Handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');

class NotificacionController {
  // Obtener todas las notificaciones
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, tipo, fisioterapeuta_id } = req.query;
      const notificaciones = await NotificacionModel.getAll(
        parseInt(page),
        parseInt(limit),
        tipo,
        fisioterapeuta_id
      );
      
      res.json(notificaciones);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
  
  // Obtener notificación por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const notificacion = await NotificacionModel.getById(id);
      
      if (!notificacion) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Notificación no encontrada'
          }
        });
      }
      
      res.json(notificacion);
    } catch (error) {
      console.error('Error al obtener notificación:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
  
  // Enviar notificaciones de alta
  static async enviarNotificacionesAlta(req, res) {
    try {
      const { fisioterapeutas_ids } = req.body;
      
      if (!fisioterapeutas_ids || !Array.isArray(fisioterapeutas_ids) || fisioterapeutas_ids.length === 0) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATA',
            message: 'Se requiere un array de IDs de fisioterapeutas'
          }
        });
      }
      
      // Obtener configuración de correo
      const emailConfig = await ConfiguracionModel.getEmailConfig();
      
      if (!emailConfig.host || !emailConfig.user || !emailConfig.password) {
        return res.status(400).json({
          error: {
            code: 'INVALID_CONFIG',
            message: 'Configuración de correo incompleta'
          }
        });
      }
      
      // Crear transporter de nodemailer
      const transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port || 587,
        secure: emailConfig.secure === 'true',
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password
        }
      });
      
      // Obtener destinatarios activos
      const destinatarios = await DestinatarioModel.getAll();
      
      // Obtener plantillas
      const plantillaColegioPromise = PlantillaModel.getByNombre('ALTA_COLEGIO');
      const plantillaSeguridadPromise = PlantillaModel.getByNombre('ALTA_SEGURIDAD_SOCIAL');
      const plantillaProfesionalPromise = PlantillaModel.getByNombre('ALTA_PROFESIONAL');
      
      const [plantillaColegio, plantillaSeguridad, plantillaProfesional] = await Promise.all([
        plantillaColegioPromise,
        plantillaSeguridadPromise,
        plantillaProfesionalPromise
      ]);
      
      // Verificar que existen todas las plantillas
      if (!plantillaColegio || !plantillaSeguridad || !plantillaProfesional) {
        return res.status(400).json({
          error: {
            code: 'MISSING_TEMPLATE',
            message: 'Faltan plantillas de correo'
          }
        });
      }
      
      // Compilar plantillas con Handlebars
      const templateColegio = {
        subject: Handlebars.compile(plantillaColegio.asunto),
        body: Handlebars.compile(plantillaColegio.cuerpo)
      };
      
      const templateSeguridad = {
        subject: Handlebars.compile(plantillaSeguridad.asunto),
        body: Handlebars.compile(plantillaSeguridad.cuerpo)
      };
      
      const templateProfesional = {
        subject: Handlebars.compile(plantillaProfesional.asunto),
        body: Handlebars.compile(plantillaProfesional.cuerpo)
      };
      
      // Procesar cada fisioterapeuta
      const resultados = [];
      
      for (const fisioterapeutaId of fisioterapeutas_ids) {
        try {
          // Obtener datos del fisioterapeuta
          const fisioterapeuta = await FisioterapeutaModel.getById(fisioterapeutaId);
          
          if (!fisioterapeuta) {
            resultados.push({
              fisioterapeuta_id: fisioterapeutaId,
              success: false,
              error: 'Fisioterapeuta no encontrado'
            });
            continue;
          }
          
          // Obtener contrato
          const contrato = await ContratoModel.getByFisioterapeutaId(fisioterapeutaId);
          
          if (!contrato) {
            resultados.push({
              fisioterapeuta_id: fisioterapeutaId,
              success: false,
              error: 'Contrato no encontrado'
            });
            continue;
          }
          
          // Obtener lista de fisioterapeutas activos
          const activos = await FisioterapeutaModel.getAllActivos();
          
          // Generar CSV con lista de activos
          const tempDir = process.env.TEMP_DIR || path.join(__dirname, '../../storage/temp');
          
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          
          const csvPath = path.join(tempDir, `fisioterapeutas_activos_${Date.now()}.csv`);
          
          const csvContent = [
            'NOMBRE,APELLIDOS,FECHA ALTA,EMAIL,FINESS',
            ...activos.map(f => `${f.nombre},${f.apellidos},${this.formatDate(f.fecha_alta)},${f.email},${f.finess}`)
          ].join('\n');
          
          fs.writeFileSync(csvPath, csvContent);
          
          // Preparar datos para las plantillas
          const data = {
            fisioterapeuta: {
              nombre: `${fisioterapeuta.nombre} ${fisioterapeuta.apellidos}`,
              fecha_alta: this.formatDate(fisioterapeuta.fecha_alta),
              email: fisioterapeuta.email
            },
            config: {
              firma_email: emailConfig.firma_email || ''
            }
          };
          
          // Crear notificación en la base de datos
          const notificacion = await NotificacionModel.create({
            fisioterapeuta_id: fisioterapeutaId,
            tipo: 'ALTA',
            fecha_envio: new Date().toISOString(),
            estado: 'ENVIADO'
          });
          
          // Enviar correos
          const destinatariosColegio = destinatarios.filter(d => d.nombre === 'Colegio de Fisioterapeutas');
          const destinatariosSeguridad = destinatarios.filter(d => d.nombre === 'Seguridad Social');
          
          // Enviar al Colegio de Fisioterapeutas
          if (destinatariosColegio.length > 0) {
            const destinatarioColegio = destinatariosColegio[0];
            
            const mailOptions = {
              from: emailConfig.email_remitente,
              to: destinatarioColegio.email,
              subject: templateColegio.subject(data),
              html: templateColegio.body(data),
              attachments: [
                {
                  filename: path.basename(contrato.ruta_archivo),
                  path: contrato.ruta_archivo
                },
                {
                  filename: 'fisioterapeutas_activos.csv',
                  path: csvPath
                }
              ]
            };
            
            try {
              await transporter.sendMail(mailOptions);
              
              // Registrar destinatario
              await NotificacionModel.registrarDestinatario(
                notificacion.id,
                destinatarioColegio.id,
                'ENVIADO'
              );
            } catch (error) {
              console.error('Error al enviar correo al Colegio:', error);
              
              // Registrar error
              await NotificacionModel.registrarDestinatario(
                notificacion.id,
                destinatarioColegio.id,
                'FALLIDO'
              );
            }
          }
          
          // Enviar a la Seguridad Social
          if (destinatariosSeguridad.length > 0) {
            const destinatarioSeguridad = destinatariosSeguridad[0];
            
            const mailOptions = {
              from: emailConfig.email_remitente,
              to: destinatarioSeguridad.email,
              subject: templateSeguridad.subject(data),
              html: templateSeguridad.body(data),
              attachments: [
                {
                  filename: path.basename(contrato.ruta_archivo),
                  path: contrato.ruta_archivo
                },
                {
                  filename: 'fisioterapeutas_activos.csv',
                  path: csvPath
                }
              ]
            };
            
            try {
              await transporter.sendMail(mailOptions);
              
              // Registrar destinatario
              await NotificacionModel.registrarDestinatario(
                notificacion.id,
                destinatarioSeguridad.id,
                'ENVIADO'
              );
            } catch (error) {
              console.error('Error al enviar correo a la Seguridad Social:', error);
              
              // Registrar error
              await NotificacionModel.registrarDestinatario(
                notificacion.id,
                destinatarioSeguridad.id,
                'FALLIDO'
              );
            }
          }
          
          // Enviar al Profesional
          if (fisioterapeuta.email) {
            const mailOptions = {
              from: emailConfig.email_remitente,
              to: fisioterapeuta.email,
              subject: templateProfesional.subject(data),
              html: templateProfesional.body(data),
              attachments: [
                {
                  filename: path.basename(contrato.ruta_archivo),
                  path: contrato.ruta_archivo
                },
                {
                  filename: 'fisioterapeutas_activos.csv',
                  path: csvPath
                }
              ]
            };
            
            try {
              await transporter.sendMail(mailOptions);
              
              // Buscar destinatario "Profesional"
              const destinatarioProfesional = destinatarios.find(d => d.nombre === 'Profesional');
              
              if (destinatarioProfesional) {
                // Registrar destinatario
                await NotificacionModel.registrarDestinatario(
                  notificacion.id,
                  destinatarioProfesional.id,
                  'ENVIADO'
                );
              }
            } catch (error) {
              console.error('Error al enviar correo al Profesional:', error);
              
              // Buscar destinatario "Profesional"
              const destinatarioProfesional = destinatarios.find(d => d.nombre === 'Profesional');
              
              if (destinatarioProfesional) {
                // Registrar error
                await NotificacionModel.registrarDestinatario(
                  notificacion.id,
                  destinatarioProfesional.id,
                  'FALLIDO'
                );
              }
            }
          }
          
          // Actualizar fecha de notificación
          await FisioterapeutaModel.registrarNotificacionAlta(
            fisioterapeutaId,
            new Date().toISOString()
          );
          
          // Limpiar archivos temporales
          if (fs.existsSync(csvPath)) {
            fs.unlinkSync(csvPath);
          }
          
          resultados.push({
            fisioterapeuta_id: fisioterapeutaId,
            success: true,
            notificacion_id: notificacion.id
          });
        } catch (error) {
          console.error(`Error al procesar fisioterapeuta ${fisioterapeutaId}:`, error);
          
          resultados.push({
            fisioterapeuta_id: fisioterapeutaId,
            success: false,
            error: error.message
          });
        }
      }
      
      res.json({
        message: 'Proceso de notificaciones completado',
        resultados
      });
    } catch (error) {
      console.error('Error al enviar notificaciones de alta:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
  
  // Enviar notificaciones de baja
  static async enviarNotificacionesBaja(req, res) {
    try {
      const { fisioterapeutas_ids } = req.body;
      
      if (!fisioterapeutas_ids || !Array.isArray(fisioterapeutas_ids) || fisioterapeutas_ids.length === 0) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATA',
            message: 'Se requiere un array de IDs de fisioterapeutas'
          }
        });
      }
      
      // Obtener configuración de correo
      const emailConfig = await ConfiguracionModel.getEmailConfig();
      
      if (!emailConfig.host || !emailConfig.user || !emailConfig.password) {
        return res.status(400).json({
          error: {
            code: 'INVALID_CONFIG',
            message: 'Configuración de correo incompleta'
          }
        });
      }
      
      // Crear transporter de nodemailer
      const transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port || 587,
        secure: emailConfig.secure === 'true',
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password
        }
      });
      
      // Obtener destinatarios activos
      const destinatarios = await DestinatarioModel.getAll();
      
      // Obtener plantillas
      const plantillaColegioPromise = PlantillaModel.getByNombre('BAJA_COLEGIO');
      const plantillaSeguridadPromise = PlantillaModel.getByNombre('BAJA_SEGURIDAD_SOCIAL');
      const plantillaProfesionalPromise = PlantillaModel.getByNombre('BAJA_PROFESIONAL');
      
      const [plantillaColegio, plantillaSeguridad, plantillaProfesional] = await Promise.all([
        plantillaColegioPromise,
        plantillaSeguridadPromise,
        plantillaProfesionalPromise
      ]);
      
      // Verificar que existen todas las plantillas
      if (!plantillaColegio || !plantillaSeguridad || !plantillaProfesional) {
        return res.status(400).json({
          error: {
            code: 'MISSING_TEMPLATE',
            message: 'Faltan plantillas de correo'
          }
        });
      }
      
      // Compilar plantillas con Handlebars
      const templateColegio = {
        subject: Handlebars.compile(plantillaColegio.asunto),
        body: Handlebars.compile(plantillaColegio.cuerpo)
      };
      
      const templateSeguridad = {
        subject: Handlebars.compile(plantillaSeguridad.asunto),
        body: Handlebars.compile(plantillaSeguridad.cuerpo)
      };
      
      const templateProfesional = {
        subject: Handlebars.compile(plantillaProfesional.asunto),
        body: Handlebars.compile(plantillaProfesional.cuerpo)
      };
      
      // Procesar cada fisioterapeuta
      const resultados = [];
      
      for (const fisioterapeutaId of fisioterapeutas_ids) {
        try {
          // Obtener datos del fisioterapeuta
          const fisioterapeuta = await FisioterapeutaModel.getById(fisioterapeutaId);
          
          if (!fisioterapeuta) {
            resultados.push({
              fisioterapeuta_id: fisioterapeutaId,
              success: false,
              error: 'Fisioterapeuta no encontrado'
            });
            continue;
          }
          
          // Verificar que tenga fecha de baja
          if (!fisioterapeuta.fecha_baja) {
            resultados.push({
              fisioterapeuta_id: fisioterapeutaId,
              success: false,
              error: 'El fisioterapeuta no tiene fecha de baja'
            });
            continue;
          }
          
          // Obtener lista de fisioterapeutas activos
          const activos = await FisioterapeutaModel.getAllActivos();
          
          // Generar CSV con lista de activos
          const tempDir = process.env.TEMP_DIR || path.join(__dirname, '../../storage/temp');
          
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          
          const csvPath = path.join(tempDir, `fisioterapeutas_activos_${Date.now()}.csv`);
          
          const csvContent = [
            'NOMBRE,APELLIDOS,FECHA ALTA,EMAIL,FINESS',
            ...activos.map(f => `${f.nombre},${f.apellidos},${this.formatDate(f.fecha_alta)},${f.email},${f.finess}`)
          ].join('\n');
          
          fs.writeFileSync(csvPath, csvContent);
          
          // Preparar datos para las plantillas
          const data = {
            fisioterapeuta: {
              nombre: `${fisioterapeuta.nombre} ${fisioterapeuta.apellidos}`,
              fecha_baja: this.formatDate(fisioterapeuta.fecha_baja),
              email: fisioterapeuta.email
            },
            config: {
              firma_email: emailConfig.firma_email || ''
            }
          };
          
          // Crear notificación en la base de datos
          const notificacion = await NotificacionModel.create({
            fisioterapeuta_id: fisioterapeutaId,
            tipo: 'BAJA',
            fecha_envio: new Date().toISOString(),
            estado: 'ENVIADO'
          });
          
          // Enviar correos
          const destinatariosColegio = destinatarios.filter(d => d.nombre === 'Colegio de Fisioterapeutas');
          const destinatariosSeguridad = destinatarios.filter(d => d.nombre === 'Seguridad Social');
          
          // Enviar al Colegio de Fisioterapeutas
          if (destinatariosColegio.length > 0) {
            const destinatarioColegio = destinatariosColegio[0];
            
            const mailOptions = {
              from: emailConfig.email_remitente,
              to: destinatarioColegio.email,
              subject: templateColegio.subject(data),
              html: templateColegio.body(data),
              attachments: [
                {
                  filename: 'fisioterapeutas_activos.csv',
                  path: csvPath
                }
              ]
            };
            
            try {
              await transporter.sendMail(mailOptions);
              
              // Registrar destinatario
              await NotificacionModel.registrarDestinatario(
                notificacion.id,
                destinatarioColegio.id,
                'ENVIADO'
              );
            } catch (error) {
              console.error('Error al enviar correo al Colegio:', error);
              
              // Registrar error
              await NotificacionModel.registrarDestinatario(
                notificacion.id,
                destinatarioColegio.id,
                'FALLIDO'
              );
            }
          }
          
          // Enviar a la Seguridad Social
          if (destinatariosSeguridad.length > 0) {
            const destinatarioSeguridad = destinatariosSeguridad[0];
            
            const mailOptions = {
              from: emailConfig.email_remitente,
              to: destinatarioSeguridad.email,
              subject: templateSeguridad.subject(data),
              html: templateSeguridad.body(data),
              attachments: [
                {
                  filename: 'fisioterapeutas_activos.csv',
                  path: csvPath
                }
              ]
            };
            
            try {
              await transporter.sendMail(mailOptions);
              
              // Registrar destinatario
              await NotificacionModel.registrarDestinatario(
                notificacion.id,
                destinatarioSeguridad.id,
                'ENVIADO'
              );
            } catch (error) {
              console.error('Error al enviar correo a la Seguridad Social:', error);
              
              // Registrar error
              await NotificacionModel.registrarDestinatario(
                notificacion.id,
                destinatarioSeguridad.id,
                'FALLIDO'
              );
            }
          }
          
          // Enviar al Profesional
          if (fisioterapeuta.email) {
            const mailOptions = {
              from: emailConfig.email_remitente,
              to: fisioterapeuta.email,
              subject: templateProfesional.subject(data),
              html: templateProfesional.body(data)
            };
            
            try {
              await transporter.sendMail(mailOptions);
              
              // Buscar destinatario "Profesional"
              const destinatarioProfesional = destinatarios.find(d => d.nombre === 'Profesional');
              
              if (destinatarioProfesional) {
                // Registrar destinatario
                await NotificacionModel.registrarDestinatario(
                  notificacion.id,
                  destinatarioProfesional.id,
                  'ENVIADO'
                );
              }
            } catch (error) {
              console.error('Error al enviar correo al Profesional:', error);
              
              // Buscar destinatario "Profesional"
              const destinatarioProfesional = destinatarios.find(d => d.nombre === 'Profesional');
              
              if (destinatarioProfesional) {
                // Registrar error
                await NotificacionModel.registrarDestinatario(
                  notificacion.id,
                  destinatarioProfesional.id,
                  'FALLIDO'
                );
              }
            }
          }
          
          // Actualizar estado y fecha de notificación
          await FisioterapeutaModel.actualizarEstadoInactivo(
            fisioterapeutaId,
            new Date().toISOString()
          );
          
          // Limpiar archivos temporales
          if (fs.existsSync(csvPath)) {
            fs.unlinkSync(csvPath);
          }
          
          resultados.push({
            fisioterapeuta_id: fisioterapeutaId,
            success: true,
            notificacion_id: notificacion.id
          });
        } catch (error) {
          console.error(`Error al procesar fisioterapeuta ${fisioterapeutaId}:`, error);
          
          resultados.push({
            fisioterapeuta_id: fisioterapeutaId,
            success: false,
            error: error.message
          });
        }
      }
      
      res.json({
        message: 'Proceso de notificaciones completado',
        resultados
      });
    } catch (error) {
      console.error('Error al enviar notificaciones de baja:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        }
      });
    }
  }
  
  // Formatear fecha
  static formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR'); // Formato DD/MM/YYYY
  }
}

module.exports = NotificacionController;
