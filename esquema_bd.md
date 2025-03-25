# Esquema de Base de Datos - Sistema de Notificación de Altas y Bajas

## Descripción General

El esquema de base de datos para el sistema de notificación de altas y bajas de fisioterapeutas está diseñado para almacenar toda la información necesaria para gestionar el registro de profesionales, sus estados (activo/inactivo) y las notificaciones enviadas. Se utilizará SQLite como sistema de gestión de base de datos por su simplicidad y facilidad de implementación en un entorno Docker.

## Diagrama Entidad-Relación

```
+-------------------+       +----------------------+       +-------------------+
|                   |       |                      |       |                   |
|   Fisioterapeuta  +-------+    Notificacion      +-------+   Destinatario    |
|                   |       |                      |       |                   |
+-------------------+       +----------------------+       +-------------------+
        |                            |
        |                            |
        v                            v
+-------------------+       +----------------------+
|                   |       |                      |
|     Contrato      |       |     Plantilla        |
|                   |       |                      |
+-------------------+       +----------------------+
```

## Definición de Tablas

### 1. Fisioterapeuta

Almacena la información de los fisioterapeutas registrados en el sistema.

```sql
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
```

### 2. Notificacion

Registra las notificaciones enviadas a los diferentes destinatarios.

```sql
CREATE TABLE notificacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fisioterapeuta_id INTEGER NOT NULL,
    tipo TEXT NOT NULL, -- ALTA o BAJA
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado TEXT NOT NULL DEFAULT 'ENVIADO', -- ENVIADO, FALLIDO, PENDIENTE
    FOREIGN KEY (fisioterapeuta_id) REFERENCES fisioterapeuta(id)
);
```

### 3. Destinatario

Almacena la información de los destinatarios de las notificaciones.

```sql
CREATE TABLE destinatario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL, -- Colegio de Fisioterapeutas, Seguridad Social, Profesional
    email TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT 1
);
```

### 4. NotificacionDestinatario

Tabla de relación entre notificaciones y destinatarios (muchos a muchos).

```sql
CREATE TABLE notificacion_destinatario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notificacion_id INTEGER NOT NULL,
    destinatario_id INTEGER NOT NULL,
    estado TEXT NOT NULL DEFAULT 'ENVIADO', -- ENVIADO, FALLIDO, PENDIENTE
    FOREIGN KEY (notificacion_id) REFERENCES notificacion(id),
    FOREIGN KEY (destinatario_id) REFERENCES destinatario(id)
);
```

### 5. Plantilla

Almacena las plantillas de correo electrónico para las diferentes notificaciones.

```sql
CREATE TABLE plantilla (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL, -- ALTA_COLEGIO, ALTA_SEGURIDAD_SOCIAL, ALTA_PROFESIONAL, BAJA_COLEGIO, BAJA_SEGURIDAD_SOCIAL, BAJA_PROFESIONAL
    asunto TEXT NOT NULL,
    cuerpo TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT 1
);
```

### 6. Contrato

Almacena la información de los contratos de los fisioterapeutas.

```sql
CREATE TABLE contrato (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fisioterapeuta_id INTEGER NOT NULL,
    nombre_archivo TEXT NOT NULL,
    ruta_archivo TEXT NOT NULL,
    fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fisioterapeuta_id) REFERENCES fisioterapeuta(id)
);
```

### 7. Usuario

Almacena la información de los usuarios del sistema.

```sql
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
```

### 8. Configuracion

Almacena la configuración general del sistema.

```sql
CREATE TABLE configuracion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clave TEXT NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descripcion TEXT,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Datos Iniciales

### Destinatarios

```sql
INSERT INTO destinatario (nombre, email) VALUES 
('Colegio de Fisioterapeutas', 'cdo31@ordremk.fr'),
('Seguridad Social', 'ps.cpam-haute-garonne@assurance-maladie.fr'),
('Profesional', ''); -- Se actualizará con el email del fisioterapeuta en cada caso
```

### Plantillas

```sql
INSERT INTO plantilla (nombre, asunto, cuerpo) VALUES 
('ALTA_COLEGIO', 'Notification de l''arrivée d''un nouveau kinésithérapeute et mise à jour du personnel au cabinet', 'Bonjour,\n\nJe me permets de vous écrire pour vous informer de l''arrivée d''un nouveau kinésithérapeute dans notre cabinet.\n\nNouveau kinésithérapeute:\n\n• Nom: [Nom du nouveau kinésithérapeute]\n\n• Date de début: [Date de début]\n\nDe plus, veuillez trouver ci-joint la liste des kinésithérapeutes actuellement en activité dans notre cabinet, ainsi que le contrat du nouveau kinésithérapeute. Ce dernier a également été informé de l''importance de procéder au changement de statut auprès du conseil départemental de l''ordre des masseurs-kinésithérapeutes de l''Haute-Garonne.\n\nNous vous remercions de votre attention et restons à votre disposition pour toute question supplémentaire que vous pourriez avoir.\n\n\n\nCordialement,\n\n[pied-de-signature]'),
('ALTA_SEGURIDAD_SOCIAL', 'Notification de l''arrivée d''un nouveau kinésithérapeute et mise à jour du personnel au cabinet (Finess 3170001576)', 'Bonjour,\n\nJe me permets de vous écrire pour vous informer de l''arrivée d''un nouveau kinésithérapeute dans notre cabinet.\n\nNouveau kinésithérapeute:\n\n• Nom: [Nom du nouveau kinésithérapeute]\n\n• Date de début: [Date de début]\n\nDe plus, veuillez trouver ci-joint la liste des kinésithérapeutes actuellement en activité dans notre cabinet, ainsi que le contrat du nouveau kinésithérapeute. Ce dernier a également été informé de l''importance de procéder au changement de statut auprès du conseil départemental de l''ordre des masseurs-kinésithérapeutes de l''Haute-Garonne.\n\n\n\nNous vous remercions de votre attention et restons à votre disposition pour toute question supplémentaire que vous pourriez avoir.\n\nCordialement,\n\n\n\n[pied-de-signature]'),
('ALTA_PROFESIONAL', 'Bienvenue dans notre cabinet de kinésithérapie', 'Cher/Chère [Nom du kinésithérapeute],\n\nNous sommes ravis de vous accueillir dans notre cabinet de kinésithérapie. Votre arrivée est prévue pour le [Date de début].\n\nNous avons informé le Conseil Départemental de l''Ordre des Masseurs-Kinésithérapeutes ainsi que la Sécurité Sociale de votre arrivée.\n\nVeuillez trouver ci-joint une copie de votre contrat ainsi que la liste des kinésithérapeutes actuellement en activité dans notre cabinet.\n\nN''hésitez pas à nous contacter si vous avez des questions ou des préoccupations.\n\nNous nous réjouissons de travailler avec vous.\n\nCordialement,\n\n[pied-de-signature]'),
('BAJA_COLEGIO', 'Notification du départ de [Nom du kinésithérapeute] du cabinet.', 'Madame, Monsieur,\n\nPar la présente, nous vous informons que le/la kinésithérapeute [Nom du kinésithérapeute], a quitté notre cabinet de kinésithérapie à compter du [Date de départ].\n\n\n\nDe plus, veuillez trouver ci-joint la liste des kinésithérapeutes actuellement en activité dans notre cabinet.\n\n\n\nRestant à votre disposition pour toute information complémentaire,\n\nCordialement,\n\n\n\n[pied-de-signature]'),
('BAJA_SEGURIDAD_SOCIAL', 'Notification du départ de [Nom du kinésithérapeute] du cabinet (Finess 3170001576).', 'Madame, Monsieur,\n\nPar la présente, nous vous informons que le/la kinésithérapeute [Nom du kinésithérapeute], a quitté notre cabinet de kinésithérapie à compter du [Date de départ].\n\n\n\nDe plus, veuillez trouver ci-joint la liste des kinésithérapeutes actuellement en activité dans notre cabinet.\n\n\n\nRestant à votre disposition pour toute information complémentaire,\n\nCordialement,\n\n\n\n[pied-de-signature]'),
('BAJA_PROFESIONAL', 'Confirmation de votre départ du cabinet de kinésithérapie', 'Cher/Chère [Nom du kinésithérapeute],\n\nNous vous confirmons que votre départ de notre cabinet de kinésithérapie a été enregistré à compter du [Date de départ].\n\nNous avons informé le Conseil Départemental de l''Ordre des Masseurs-Kinésithérapeutes ainsi que la Sécurité Sociale de votre départ.\n\nNous vous remercions pour votre collaboration et vous souhaitons beaucoup de succès dans vos projets futurs.\n\nCordialement,\n\n[pied-de-signature]');
```

### Configuración

```sql
INSERT INTO configuracion (clave, valor, descripcion) VALUES 
('EMAIL_REMITENTE', 'diversifica.ia@outlook.es', 'Email desde el que se envían las notificaciones'),
('FIRMA_EMAIL', '[Nombre del Remitente]\nCabinet de Kinésithérapie\nTel: [Teléfono]\nEmail: [Email]', 'Firma que se incluye en los correos electrónicos'),
('RUTA_CONTRATOS', '/app/storage/contratos', 'Ruta donde se almacenan los contratos de los fisioterapeutas'),
('FINESS_CABINET', '3170001576', 'Número FINESS del gabinete de fisioterapia');
```

### Usuario Administrador

```sql
INSERT INTO usuario (nombre, apellidos, email, password, rol) VALUES 
('Admin', 'Sistema', 'admin@sistema.com', '$2a$10$1qAz2wSx3eDc4rFv5tGb5t8WGc5wPZXPUoY1cYXvW1cj8zR.6Alu.', 'ADMIN'); -- Contraseña: admin123
```

## Índices

Para optimizar las consultas más frecuentes:

```sql
CREATE INDEX idx_fisioterapeuta_estado ON fisioterapeuta(estado);
CREATE INDEX idx_fisioterapeuta_fecha_alta ON fisioterapeuta(fecha_alta);
CREATE INDEX idx_fisioterapeuta_fecha_baja ON fisioterapeuta(fecha_baja);
CREATE INDEX idx_notificacion_fisioterapeuta ON notificacion(fisioterapeuta_id);
CREATE INDEX idx_notificacion_tipo ON notificacion(tipo);
CREATE INDEX idx_contrato_fisioterapeuta ON contrato(fisioterapeuta_id);
```

## Restricciones y Validaciones

1. El email del fisioterapeuta debe ser único.
2. La fecha de baja debe ser posterior a la fecha de alta.
3. El estado del fisioterapeuta solo puede ser 'ACTIVO' o 'INACTIVO'.
4. El tipo de notificación solo puede ser 'ALTA' o 'BAJA'.
5. El estado de la notificación solo puede ser 'ENVIADO', 'FALLIDO' o 'PENDIENTE'.

Estas restricciones se implementarán a nivel de aplicación, ya que SQLite tiene limitaciones en cuanto a la definición de restricciones complejas.
