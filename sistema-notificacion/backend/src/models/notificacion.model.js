const db = require('../config/database');

class NotificacionModel {
  // Obtener todas las notificaciones
  static getAll(page = 1, limit = 10, tipo = null, fisioterapeuta_id = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT n.*, f.nombre || ' ' || f.apellidos as fisioterapeuta_nombre
        FROM notificacion n
        JOIN fisioterapeuta f ON n.fisioterapeuta_id = f.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (tipo) {
        query += ' AND n.tipo = ?';
        params.push(tipo);
      }
      
      if (fisioterapeuta_id) {
        query += ' AND n.fisioterapeuta_id = ?';
        params.push(fisioterapeuta_id);
      }
      
      query += ' ORDER BY n.fecha_envio DESC LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Obtener el total de registros para la paginación
          let countQuery = `
            SELECT COUNT(*) as total FROM notificacion
            WHERE 1=1
          `;
          
          const countParams = [];
          
          if (tipo) {
            countQuery += ' AND tipo = ?';
            countParams.push(tipo);
          }
          
          if (fisioterapeuta_id) {
            countQuery += ' AND fisioterapeuta_id = ?';
            countParams.push(fisioterapeuta_id);
          }
          
          db.get(countQuery, countParams, (err, count) => {
            if (err) {
              reject(err);
            } else {
              // Para cada notificación, obtener sus destinatarios
              const promises = rows.map(notificacion => {
                return new Promise((resolve, reject) => {
                  const destinatariosQuery = `
                    SELECT d.nombre, d.email, nd.estado
                    FROM notificacion_destinatario nd
                    JOIN destinatario d ON nd.destinatario_id = d.id
                    WHERE nd.notificacion_id = ?
                  `;
                  
                  db.all(destinatariosQuery, [notificacion.id], (err, destinatarios) => {
                    if (err) {
                      reject(err);
                    } else {
                      notificacion.destinatarios = destinatarios;
                      resolve(notificacion);
                    }
                  });
                });
              });
              
              Promise.all(promises)
                .then(notificacionesConDestinatarios => {
                  resolve({
                    data: notificacionesConDestinatarios,
                    pagination: {
                      total: count.total,
                      page: page,
                      limit: limit,
                      pages: Math.ceil(count.total / limit)
                    }
                  });
                })
                .catch(err => reject(err));
            }
          });
        }
      });
    });
  }

  // Obtener notificación por ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT n.*, f.nombre || ' ' || f.apellidos as fisioterapeuta_nombre
        FROM notificacion n
        JOIN fisioterapeuta f ON n.fisioterapeuta_id = f.id
        WHERE n.id = ?
      `;
      
      db.get(query, [id], (err, notificacion) => {
        if (err) {
          reject(err);
        } else if (!notificacion) {
          resolve(null);
        } else {
          // Obtener los destinatarios de la notificación
          const destinatariosQuery = `
            SELECT d.nombre, d.email, nd.estado
            FROM notificacion_destinatario nd
            JOIN destinatario d ON nd.destinatario_id = d.id
            WHERE nd.notificacion_id = ?
          `;
          
          db.all(destinatariosQuery, [id], (err, destinatarios) => {
            if (err) {
              reject(err);
            } else {
              notificacion.destinatarios = destinatarios;
              resolve(notificacion);
            }
          });
        }
      });
    });
  }

  // Crear nueva notificación
  static create(notificacion) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO notificacion (
          fisioterapeuta_id,
          tipo,
          fecha_envio,
          estado
        ) VALUES (?, ?, ?, ?)
      `;
      
      const params = [
        notificacion.fisioterapeuta_id,
        notificacion.tipo,
        notificacion.fecha_envio || new Date().toISOString(),
        notificacion.estado || 'ENVIADO'
      ];
      
      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...notificacion });
        }
      });
    });
  }

  // Registrar relación notificación-destinatario
  static registrarDestinatario(notificacion_id, destinatario_id, estado) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO notificacion_destinatario (
          notificacion_id,
          destinatario_id,
          estado
        ) VALUES (?, ?, ?)
      `;
      
      const params = [
        notificacion_id,
        destinatario_id,
        estado || 'ENVIADO'
      ];
      
      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ 
            id: this.lastID, 
            notificacion_id, 
            destinatario_id, 
            estado 
          });
        }
      });
    });
  }

  // Actualizar estado de notificación
  static updateEstado(id, estado) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE notificacion SET
          estado = ?
        WHERE id = ?
      `;
      
      db.run(query, [estado, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, estado });
        }
      });
    });
  }

  // Actualizar estado de notificación-destinatario
  static updateEstadoDestinatario(notificacion_id, destinatario_id, estado) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE notificacion_destinatario SET
          estado = ?
        WHERE notificacion_id = ? AND destinatario_id = ?
      `;
      
      db.run(query, [estado, notificacion_id, destinatario_id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ notificacion_id, destinatario_id, estado });
        }
      });
    });
  }
}

module.exports = NotificacionModel;
