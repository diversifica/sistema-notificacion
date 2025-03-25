const db = require('../config/database');
const path = require('path');

class ContratoModel {
  // Obtener todos los contratos
  static getAll(fisioterapeutaId = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT c.*, f.nombre || ' ' || f.apellidos as fisioterapeuta_nombre
        FROM contrato c
        JOIN fisioterapeuta f ON c.fisioterapeuta_id = f.id
      `;
      
      const params = [];
      
      if (fisioterapeutaId) {
        query += ' WHERE c.fisioterapeuta_id = ?';
        params.push(fisioterapeutaId);
      }
      
      query += ' ORDER BY c.fecha_subida DESC';
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Obtener contrato por ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, f.nombre || ' ' || f.apellidos as fisioterapeuta_nombre
        FROM contrato c
        JOIN fisioterapeuta f ON c.fisioterapeuta_id = f.id
        WHERE c.id = ?
      `;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Obtener contrato por fisioterapeuta ID
  static getByFisioterapeutaId(fisioterapeutaId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM contrato
        WHERE fisioterapeuta_id = ?
        ORDER BY fecha_subida DESC
        LIMIT 1
      `;
      
      db.get(query, [fisioterapeutaId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Crear nuevo contrato
  static create(contrato) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO contrato (
          fisioterapeuta_id,
          nombre_archivo,
          ruta_archivo,
          fecha_subida
        ) VALUES (?, ?, ?, ?)
      `;
      
      const params = [
        contrato.fisioterapeuta_id,
        contrato.nombre_archivo,
        contrato.ruta_archivo,
        contrato.fecha_subida || new Date().toISOString()
      ];
      
      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...contrato });
        }
      });
    });
  }

  // Actualizar contrato
  static update(id, contrato) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE contrato SET
          fisioterapeuta_id = COALESCE(?, fisioterapeuta_id),
          nombre_archivo = COALESCE(?, nombre_archivo),
          ruta_archivo = COALESCE(?, ruta_archivo)
        WHERE id = ?
      `;
      
      const params = [
        contrato.fisioterapeuta_id,
        contrato.nombre_archivo,
        contrato.ruta_archivo,
        id
      ];
      
      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...contrato });
        }
      });
    });
  }

  // Eliminar contrato
  static delete(id) {
    return new Promise((resolve, reject) => {
      // Primero obtenemos la información del contrato para poder eliminar el archivo
      this.getById(id)
        .then(contrato => {
          if (!contrato) {
            return resolve({ id });
          }
          
          const query = 'DELETE FROM contrato WHERE id = ?';
          
          db.run(query, [id], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, ruta_archivo: contrato.ruta_archivo });
            }
          });
        })
        .catch(err => reject(err));
    });
  }

  // Parsear nombre de archivo para extraer información del fisioterapeuta
  static parseFileName(fileName) {
    try {
      // Formato esperado: "DD-MM-AAAA NOMBRE APELLIDO(S)"
      const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
      const match = fileNameWithoutExt.match(/^(\d{2}-\d{2}-\d{4})\s+(.+)$/);
      
      if (!match) {
        return null;
      }
      
      const fechaAlta = match[1];
      const nombreCompleto = match[2];
      
      // Intentar separar nombre y apellidos (asumiendo que el primer espacio separa nombre de apellidos)
      const nombrePartes = nombreCompleto.split(' ');
      let nombre = nombrePartes[0];
      let apellidos = nombrePartes.slice(1).join(' ');
      
      return {
        fecha_alta: fechaAlta,
        nombre,
        apellidos,
        nombre_completo: nombreCompleto
      };
    } catch (error) {
      console.error('Error al parsear el nombre del archivo:', error);
      return null;
    }
  }
}

module.exports = ContratoModel;
