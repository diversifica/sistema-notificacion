const db = require('../config/database');
const bcrypt = require('bcrypt');

class UsuarioModel {
  // Obtener todos los usuarios
  static getAll(includeInactive = false) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT id, nombre, apellidos, email, rol, activo, fecha_creacion, fecha_actualizacion
        FROM usuario
      `;
      
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

  // Obtener usuario por ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, nombre, apellidos, email, rol, activo, fecha_creacion, fecha_actualizacion
        FROM usuario
        WHERE id = ?
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

  // Obtener usuario por email
  static getByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM usuario WHERE email = ?';
      
      db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Crear nuevo usuario
  static async create(usuario) {
    try {
      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(usuario.password, 10);
      
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO usuario (
            nombre, 
            apellidos, 
            email, 
            password, 
            rol, 
            activo
          ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
          usuario.nombre,
          usuario.apellidos,
          usuario.email,
          hashedPassword,
          usuario.rol || 'USUARIO',
          usuario.activo !== undefined ? usuario.activo : 1
        ];
        
        db.run(query, params, function(err) {
          if (err) {
            reject(err);
          } else {
            // No devolver la contraseña
            const { password, ...usuarioSinPassword } = usuario;
            resolve({ id: this.lastID, ...usuarioSinPassword });
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  // Actualizar usuario
  static async update(id, usuario) {
    try {
      let hashedPassword = null;
      
      // Si se proporciona una nueva contraseña, encriptarla
      if (usuario.password) {
        hashedPassword = await bcrypt.hash(usuario.password, 10);
      }
      
      return new Promise((resolve, reject) => {
        let query = `
          UPDATE usuario SET
            nombre = COALESCE(?, nombre),
            apellidos = COALESCE(?, apellidos),
            email = COALESCE(?, email),
            rol = COALESCE(?, rol),
            activo = COALESCE(?, activo),
            fecha_actualizacion = CURRENT_TIMESTAMP
        `;
        
        const params = [
          usuario.nombre,
          usuario.apellidos,
          usuario.email,
          usuario.rol,
          usuario.activo
        ];
        
        // Añadir la contraseña a la consulta si se proporciona
        if (hashedPassword) {
          query += ', password = ?';
          params.push(hashedPassword);
        }
        
        query += ' WHERE id = ?';
        params.push(id);
        
        db.run(query, params, function(err) {
          if (err) {
            reject(err);
          } else {
            // No devolver la contraseña
            const { password, ...usuarioSinPassword } = usuario;
            resolve({ id, ...usuarioSinPassword });
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  // Cambiar contraseña
  static async changePassword(id, oldPassword, newPassword) {
    try {
      // Obtener el usuario para verificar la contraseña actual
      const usuario = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM usuario WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
      
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      
      // Verificar la contraseña actual
      const isMatch = await bcrypt.compare(oldPassword, usuario.password);
      
      if (!isMatch) {
        throw new Error('Contraseña actual incorrecta');
      }
      
      // Encriptar la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Actualizar la contraseña
      return new Promise((resolve, reject) => {
        const query = `
          UPDATE usuario SET
            password = ?,
            fecha_actualizacion = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        db.run(query, [hashedPassword, id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, success: true });
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  // Eliminar usuario
  static delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM usuario WHERE id = ?';
      
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id });
        }
      });
    });
  }

  // Activar/Desactivar usuario
  static toggleActive(id, activo) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE usuario SET
          activo = ?,
          fecha_actualizacion = CURRENT_TIMESTAMP
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

  // Verificar credenciales para login
  static async verifyCredentials(email, password) {
    try {
      // Obtener el usuario por email
      const usuario = await this.getByEmail(email);
      
      if (!usuario) {
        return null;
      }
      
      // Verificar si el usuario está activo
      if (!usuario.activo) {
        throw new Error('Usuario inactivo');
      }
      
      // Verificar la contraseña
      const isMatch = await bcrypt.compare(password, usuario.password);
      
      if (!isMatch) {
        return null;
      }
      
      // No devolver la contraseña
      const { password: _, ...usuarioSinPassword } = usuario;
      
      return usuarioSinPassword;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UsuarioModel;
