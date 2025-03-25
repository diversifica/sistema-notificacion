const db = require('../config/database');

class PlantillaModel {
  // Obtener todas las plantillas
  static getAll(includeInactive = false) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM plantilla';
      
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

  // Obtener plantilla por ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM plantilla WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Obtener plantilla por nombre
  static getByNombre(nombre) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM plantilla WHERE nombre = ?';
      
      db.get(query, [nombre], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Crear nueva plantilla
  static create(plantilla) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO plantilla (
          nombre, 
          asunto, 
          cuerpo, 
          activo
        ) VALUES (?, ?, ?, ?)
      `;
      
      const params = [
        plantilla.nombre,
        plantilla.asunto,
        plantilla.cuerpo,
        plantilla.activo !== undefined ? plantilla.activo : 1
      ];
      
      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...plantilla });
        }
      });
    });
  }

  // Actualizar plantilla
  static update(id, plantilla) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE plantilla SET
          nombre = COALESCE(?, nombre),
          asunto = COALESCE(?, asunto),
          cuerpo = COALESCE(?, cuerpo),
          activo = COALESCE(?, activo)
        WHERE id = ?
      `;
      
      const params = [
        plantilla.nombre,
        plantilla.asunto,
        plantilla.cuerpo,
        plantilla.activo,
        id
      ];
      
      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...plantilla });
        }
      });
    });
  }

  // Eliminar plantilla
  static delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM plantilla WHERE id = ?';
      
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id });
        }
      });
    });
  }

  // Activar/Desactivar plantilla
  static toggleActive(id, activo) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE plantilla SET
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
}

module.exports = PlantillaModel;
