const db = require('../config/database');

class DestinatarioModel {
  // Obtener todos los destinatarios
  static getAll(includeInactive = false) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM destinatario';
      
      if (!includeInactive) {
        query += ' WHERE activo = 1';
      }
      
      query += ' ORDER BY nombre ASC';
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Obtener destinatario por ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM destinatario WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Crear nuevo destinatario
  static create(destinatario) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO destinatario (
          nombre, 
          email, 
          activo
        ) VALUES (?, ?, ?)
      `;
      
      const params = [
        destinatario.nombre,
        destinatario.email,
        destinatario.activo !== undefined ? destinatario.activo : 1
      ];
      
      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...destinatario });
        }
      });
    });
  }

  // Actualizar destinatario
  static update(id, destinatario) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE destinatario SET
          nombre = COALESCE(?, nombre),
          email = COALESCE(?, email),
          activo = COALESCE(?, activo)
        WHERE id = ?
      `;
      
      const params = [
        destinatario.nombre,
        destinatario.email,
        destinatario.activo,
        id
      ];
      
      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...destinatario });
        }
      });
    });
  }

  // Eliminar destinatario
  static delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM destinatario WHERE id = ?';
      
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id });
        }
      });
    });
  }

  // Activar/Desactivar destinatario
  static toggleActive(id, activo) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE destinatario SET
          activo = ?
        WHERE id = ?
      `;
      
      db.run(query, [activo ? 1 : 0, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, activo: activo ? 1 : 0 });
        }
      });
    });
  }

  // Buscar destinatario por nombre
  static findByNombre(nombre) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM destinatario WHERE nombre = ?';
      
      db.get(query, [nombre], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

module.exports = DestinatarioModel;
