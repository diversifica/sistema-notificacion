const db = require('../config/database');

class ConfiguracionModel {
  // Obtener todas las configuraciones
  static getAll() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM configuracion ORDER BY clave ASC';
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Obtener configuración por clave
  static getByKey(clave) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM configuracion WHERE clave = ?';
      
      db.get(query, [clave], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Obtener valor de configuración por clave
  static async getValue(clave, defaultValue = null) {
    try {
      const config = await this.getByKey(clave);
      return config ? config.valor : defaultValue;
    } catch (error) {
      console.error(`Error al obtener configuración ${clave}:`, error);
      return defaultValue;
    }
  }

  // Obtener múltiples configuraciones por prefijo
  static getByPrefix(prefix) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM configuracion WHERE clave LIKE ? ORDER BY clave ASC';
      
      db.all(query, [`${prefix}%`], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Crear o actualizar configuración
  static set(clave, valor, descripcion = null) {
    return new Promise((resolve, reject) => {
      // Verificar si la configuración ya existe
      this.getByKey(clave)
        .then(existingConfig => {
          if (existingConfig) {
            // Actualizar configuración existente
            const query = `
              UPDATE configuracion SET
                valor = ?,
                descripcion = COALESCE(?, descripcion),
                fecha_actualizacion = CURRENT_TIMESTAMP
              WHERE clave = ?
            `;
            
            db.run(query, [valor, descripcion, clave], function(err) {
              if (err) {
                reject(err);
              } else {
                resolve({ 
                  id: existingConfig.id, 
                  clave, 
                  valor, 
                  descripcion: descripcion || existingConfig.descripcion 
                });
              }
            });
          } else {
            // Crear nueva configuración
            const query = `
              INSERT INTO configuracion (
                clave, 
                valor, 
                descripcion
              ) VALUES (?, ?, ?)
            `;
            
            db.run(query, [clave, valor, descripcion], function(err) {
              if (err) {
                reject(err);
              } else {
                resolve({ 
                  id: this.lastID, 
                  clave, 
                  valor, 
                  descripcion 
                });
              }
            });
          }
        })
        .catch(err => reject(err));
    });
  }

  // Eliminar configuración
  static delete(clave) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM configuracion WHERE clave = ?';
      
      db.run(query, [clave], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ clave });
        }
      });
    });
  }

  // Obtener configuración de correo electrónico
  static getEmailConfig() {
    return new Promise((resolve, reject) => {
      this.getByPrefix('SMTP')
        .then(smtpConfigs => {
          // Convertir array de configuraciones a objeto
          const config = {};
          smtpConfigs.forEach(item => {
            const key = item.clave.replace('SMTP_', '').toLowerCase();
            config[key] = item.valor;
          });
          
          // Añadir email remitente
          this.getByKey('EMAIL_REMITENTE')
            .then(emailRemitente => {
              if (emailRemitente) {
                config.email_remitente = emailRemitente.valor;
              }
              
              // Añadir firma de email
              this.getByKey('FIRMA_EMAIL')
                .then(firmaEmail => {
                  if (firmaEmail) {
                    config.firma_email = firmaEmail.valor;
                  }
                  
                  resolve(config);
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }
}

module.exports = ConfiguracionModel;
