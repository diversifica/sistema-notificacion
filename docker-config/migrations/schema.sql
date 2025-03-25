-- Esquema de la base de datos para el Sistema de Notificación de Altas y Bajas
-- Creación de tablas

-- Tabla de fisioterapeutas
CREATE TABLE fisioterapeuta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    email TEXT NOT NULL,
    finess TEXT NOT NULL,
    fecha_alta DATE NOT NULL,
    fecha_baja DATE,
    estado TEXT NOT NULL DEFAULT 'ACTIVO', -- ACTIVO o INACTIVO
    fecha_notificacion_alta DATE,
    fecha_notificacion_baja DATE,
    ruta_contrato TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notificaciones
CREATE TABLE notificacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fisioterapeuta_id INTEGER NOT NULL,
    tipo TEXT NOT NULL, -- ALTA o BAJA
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado TEXT NOT NULL DEFAULT 'ENVIADO', -- ENVIADO, FALLIDO, PENDIENTE
    FOREIGN KEY (fisioterapeuta_id) REFERENCES fisioterapeuta(id)
);

-- Tabla de destinatarios
CREATE TABLE destinatario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL, -- Colegio de Fisioterapeutas, Seguridad Social, Profesional
    email TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT 1
);

-- Tabla de relación entre notificaciones y destinatarios
CREATE TABLE notificacion_destinatario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notificacion_id INTEGER NOT NULL,
    destinatario_id INTEGER NOT NULL,
    estado TEXT NOT NULL DEFAULT 'ENVIADO', -- ENVIADO, FALLIDO, PENDIENTE
    FOREIGN KEY (notificacion_id) REFERENCES notificacion(id),
    FOREIGN KEY (destinatario_id) REFERENCES destinatario(id)
);

-- Tabla de plantillas de correo
CREATE TABLE plantilla (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL, -- ALTA_COLEGIO, ALTA_SEGURIDAD_SOCIAL, ALTA_PROFESIONAL, BAJA_COLEGIO, BAJA_SEGURIDAD_SOCIAL, BAJA_PROFESIONAL
    asunto TEXT NOT NULL,
    cuerpo TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT 1
);

-- Tabla de contratos
CREATE TABLE contrato (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fisioterapeuta_id INTEGER NOT NULL,
    nombre_archivo TEXT NOT NULL,
    ruta_archivo TEXT NOT NULL,
    fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fisioterapeuta_id) REFERENCES fisioterapeuta(id)
);

-- Tabla de usuarios
CREATE TABLE usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'USUARIO', -- ADMIN, USUARIO
    activo BOOLEAN NOT NULL DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración
CREATE TABLE configuracion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clave TEXT NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descripcion TEXT,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creación de índices
CREATE INDEX idx_fisioterapeuta_estado ON fisioterapeuta(estado);
CREATE INDEX idx_fisioterapeuta_fecha_alta ON fisioterapeuta(fecha_alta);
CREATE INDEX idx_fisioterapeuta_fecha_baja ON fisioterapeuta(fecha_baja);
CREATE INDEX idx_notificacion_fisioterapeuta ON notificacion(fisioterapeuta_id);
CREATE INDEX idx_notificacion_tipo ON notificacion(tipo);
CREATE INDEX idx_contrato_fisioterapeuta ON contrato(fisioterapeuta_id);
