# Arquitectura del Sistema de Notificación de Altas y Bajas

## Visión General

El sistema de notificación de altas y bajas de fisioterapeutas será una aplicación web moderna que permitirá gestionar el registro de profesionales, automatizando la comunicación con instituciones externas y los propios profesionales. La aplicación estará diseñada para ser desplegada en un contenedor Docker, facilitando su instalación y mantenimiento.

## Arquitectura General

La arquitectura del sistema seguirá un patrón de diseño Modelo-Vista-Controlador (MVC) con una separación clara entre el frontend y el backend:

```
+----------------------------------+
|           Cliente Web            |
|  (Navegador - Interfaz Usuario)  |
+----------------------------------+
               |
               | HTTP/HTTPS
               |
+----------------------------------+
|         Servidor Web             |
|      (Nginx / Contenedor)        |
+----------------------------------+
               |
               |
+----------------------------------+
|        Aplicación Web            |
|  +----------------------------+  |
|  |        Frontend            |  |
|  | (React.js + Tailwind CSS)  |  |
|  +----------------------------+  |
|               |                  |
|  +----------------------------+  |
|  |         Backend            |  |
|  |   (Node.js + Express)      |  |
|  +----------------------------+  |
|               |                  |
|  +----------------------------+  |
|  |    Servicio de Correo      |  |
|  |      (Nodemailer)          |  |
|  +----------------------------+  |
+----------------------------------+
               |
               |
+----------------------------------+
|         Base de Datos            |
|           (SQLite)               |
+----------------------------------+
               |
               |
+----------------------------------+
|    Sistema de Archivos           |
|  (Almacenamiento de Contratos)   |
+----------------------------------+
```

## Componentes Principales

### 1. Frontend (Cliente)

- **Tecnología**: React.js con Tailwind CSS
- **Responsabilidades**:
  - Interfaz de usuario intuitiva y responsive
  - Formularios para registro de altas y bajas
  - Visualización de tablas de profesionales activos e inactivos
  - Interfaz para subir contratos
  - Menú de gestión con opciones para comunicar altas y bajas

### 2. Backend (Servidor)

- **Tecnología**: Node.js con Express
- **Responsabilidades**:
  - API RESTful para la gestión de fisioterapeutas
  - Lógica de negocio para procesar altas y bajas
  - Gestión de archivos (contratos)
  - Servicio de envío de correos electrónicos
  - Autenticación y autorización de usuarios

### 3. Base de Datos

- **Tecnología**: SQLite (para simplificar la implementación en Docker)
- **Responsabilidades**:
  - Almacenamiento de datos de fisioterapeutas
  - Registro de altas y bajas
  - Seguimiento de notificaciones enviadas

### 4. Sistema de Archivos

- **Responsabilidades**:
  - Almacenamiento de contratos de fisioterapeutas
  - Organización de documentos según la nomenclatura especificada

### 5. Servicio de Correo Electrónico

- **Tecnología**: Nodemailer
- **Responsabilidades**:
  - Envío de notificaciones por correo electrónico
  - Gestión de plantillas de correo
  - Adjuntar documentos a los correos

## Flujo de Datos

### Proceso de Alta

1. El usuario sube el contrato del nuevo fisioterapeuta al sistema.
2. El sistema valida el formato del nombre del archivo.
3. El usuario introduce los datos del fisioterapeuta en el formulario de altas.
4. El usuario marca la casilla "ENVIAR" y hace clic en "Comunicar Altas por mail".
5. El sistema procesa la solicitud:
   - Almacena los datos en la base de datos
   - Genera los correos electrónicos según las plantillas
   - Adjunta el contrato y el listado de fisioterapeutas activos
   - Envía los correos a los destinatarios
6. El sistema actualiza el estado del fisioterapeuta a "ACTIVO" y lo mueve a la tabla T_ALTAS.
7. El sistema registra la fecha de notificación.

### Proceso de Baja

1. El usuario accede a la tabla de fisioterapeutas activos.
2. El usuario introduce la fecha de baja y marca la casilla "ENVIAR BAJA".
3. El usuario hace clic en "Comunicar Bajas por mail".
4. El sistema procesa la solicitud:
   - Actualiza los datos en la base de datos
   - Genera los correos electrónicos según las plantillas
   - Adjunta el listado de fisioterapeutas activos
   - Envía los correos a los destinatarios
5. El sistema actualiza el estado del fisioterapeuta a "INACTIVO" y lo mueve a la tabla T_BAJAS.
6. El sistema registra la fecha de notificación.

## Consideraciones de Seguridad

1. **Autenticación**: Sistema de inicio de sesión para controlar el acceso a la aplicación.
2. **Autorización**: Diferentes niveles de acceso según el rol del usuario.
3. **Validación de Datos**: Validación en el cliente y en el servidor para prevenir inyecciones.
4. **Protección de Datos Personales**: Cumplimiento con normativas de protección de datos.
5. **Cifrado**: Comunicación segura mediante HTTPS.
6. **Logs**: Registro de actividades para auditoría y seguimiento.

## Despliegue en Docker

La aplicación se desplegará en un contenedor Docker, lo que facilitará su instalación y mantenimiento. Se utilizará un archivo `docker-compose.yml` para definir los servicios necesarios:

1. **Servicio Web**: Contenedor con la aplicación web (frontend y backend).
2. **Volúmenes**: Para persistencia de datos (base de datos y archivos).

Esta arquitectura permitirá un despliegue sencillo en cualquier servidor que soporte Docker, minimizando las dependencias y simplificando la configuración.
