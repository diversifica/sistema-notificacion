const db = require('../config/database');

class FisioterapeutaModel {
  // Obtener todos los fisioterapeutas activos
  static getAllActivos() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM fisioterapeuta 
        WHERE estado = 'ACTIVO'
        ORDER BY nombre ASC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Obtener todos los fisioterapeutas inactivos
  static getAllInactivos() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM fisioterapeuta 
        WHERE estado = 'INACTIVO'
        ORDER BY fecha_baja DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Obtener fisioterapeuta por ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM fisioterapeuta WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Crear nuevo fisioterapeuta
  static create(fisioterapeuta) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO fisioterapeuta (
          nombre, 
          apellidos, 
          email, 
          finess, 
          fecha_alta, 
          estado, 
          ruta_contrato
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        fisioterapeuta.nombre,
        fisioterapeuta.apellidos,
        fisioterapeuta.email,
        fisioterapeuta.finess,
        fisioterapeuta.fecha_alta,
        fisioterapeuta.estado || 'ACTIVO',
        fisioterapeuta.ruta_contrato
      ];
      
      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...fisioterapeuta });
        }
      });
    });
  }

  // Actualizar fisioterapeuta
  static update(id, fisioterapeuta) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE fisioterapeuta SET
          nombre = COALESCE(?, nombre),
          apellidos = COALESCE(?, apellidos),
          email = COALESCE(?, email),
          finess = COALESCE(?, finess),
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const params = [
        fisioterapeuta.nombre,
        fisioterapeuta.apellidos,
        fisioterapeuta.email,
        fisioterapeuta.finess,
        id
      ];
      
      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...fisioterapeuta });
        }
      });
    });
  }

  // Dar de baja fisioterapeuta
  static darDeBaja(id, fecha_baja) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE fisioterapeuta SET
          fecha_baja = ?,
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [fecha_baja, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, fecha_baja });
        }
      });
    });
  }

  // Actualizar estado a INACTIVO y registrar notificación
  static actualizarEstadoInactivo(id, fecha_notificacion_baja) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE fisioterapeuta SET
          estado = 'INACTIVO',
          fecha_notificacion_baja = ?,
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [fecha_notificacion_baja, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, estado: 'INACTIVO', fecha_notificacion_baja });
        }
      });
    });
  }

  // Registrar notificación de alta
  static registrarNotificacionAlta(id, fecha_notificacion_alta) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE fisioterapeuta SET
          fecha_notificacion_alta = ?,
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [fecha_notificacion_alta, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, fecha_notificacion_alta });
        }
      });
    });
  }

  // Eliminar fisioterapeuta
  static delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM fisioterapeuta WHERE id = ?';
      
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id });
        }
      });
    });
  }

  // Buscar fisioterapeutas
  static search(searchTerm, estado = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT * FROM fisioterapeuta 
        WHERE (nombre LIKE ? OR apellidos LIKE ? OR email LIKE ? OR finess LIKE ?)
      `;
      
      const params = [
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`
      ];

      if (estado) {
        query += ' AND estado = ?';
        params.push(estado);
      }
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Obtener fisioterapeutas pendientes de notificar alta
  static getPendientesNotificarAlta() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM fisioterapeuta 
        WHERE estado = 'ACTIVO' 
        AND fecha_notificacion_alta IS NULL
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Obtener fisioterapeutas pendientes de notificar baja
  static getPendientesNotificarBaja() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM fisioterapeuta 
        WHERE estado = 'ACTIVO' 
        AND fecha_baja IS NOT NULL 
        AND fecha_notificacion_baja IS NULL
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = FisioterapeutaModel;
