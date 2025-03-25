# API Endpoints - Sistema de Notificación de Altas y Bajas

## Visión General

Este documento define los endpoints de la API RESTful para el sistema de notificación de altas y bajas de fisioterapeutas. La API está diseñada siguiendo los principios REST y utiliza JSON como formato de intercambio de datos.

## Base URL

```
/api/v1
```

## Autenticación

Todos los endpoints (excepto `/auth/login`) requieren autenticación mediante token JWT. El token debe enviarse en el encabezado de la solicitud:

```
Authorization: Bearer <token>
```

## Endpoints

### Autenticación

#### Iniciar sesión

```
POST /auth/login
```

**Cuerpo de la solicitud:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Admin",
    "apellidos": "Sistema",
    "email": "admin@sistema.com",
    "rol": "ADMIN"
  }
}
```

#### Cerrar sesión

```
POST /auth/logout
```

**Respuesta exitosa (200 OK):**
```json
{
  "message": "Sesión cerrada correctamente"
}
```

#### Obtener usuario actual

```
GET /auth/me
```

**Respuesta exitosa (200 OK):**
```json
{
  "id": 1,
  "nombre": "Admin",
  "apellidos": "Sistema",
  "email": "admin@sistema.com",
  "rol": "ADMIN"
}
```

### Fisioterapeutas

#### Obtener todos los fisioterapeutas activos

```
GET /fisioterapeutas/activos
```

**Parámetros de consulta:**
- `page`: Número de página (por defecto: 1)
- `limit`: Número de elementos por página (por defecto: 10)
- `sort`: Campo por el que ordenar (por defecto: "nombre")
- `order`: Orden (asc o desc, por defecto: "asc")
- `search`: Término de búsqueda

**Respuesta exitosa (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "CESAR",
      "apellidos": "NAVARRO ALBARRACIN",
      "email": "cesar.navarro@ejemplo.com",
      "finess": "3170001",
      "fecha_alta": "2024-11-20",
      "fecha_notificacion_alta": "2024-11-21",
      "ruta_contrato": "/storage/contratos/20-11-2024 CESAR NAVARRO ALBARRACIN.pdf"
    },
    // ...
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

#### Obtener todos los fisioterapeutas inactivos

```
GET /fisioterapeutas/inactivos
```

**Parámetros de consulta:** (Mismos que para activos)

**Respuesta exitosa (200 OK):** (Formato similar a activos, pero incluye fecha_baja y fecha_notificacion_baja)

#### Obtener fisioterapeuta por ID

```
GET /fisioterapeutas/:id
```

**Respuesta exitosa (200 OK):**
```json
{
  "id": 1,
  "nombre": "CESAR",
  "apellidos": "NAVARRO ALBARRACIN",
  "email": "cesar.navarro@ejemplo.com",
  "finess": "3170001",
  "fecha_alta": "2024-11-20",
  "fecha_baja": null,
  "estado": "ACTIVO",
  "fecha_notificacion_alta": "2024-11-21",
  "fecha_notificacion_baja": null,
  "ruta_contrato": "/storage/contratos/20-11-2024 CESAR NAVARRO ALBARRACIN.pdf"
}
```

#### Crear nuevo fisioterapeuta

```
POST /fisioterapeutas
```

**Cuerpo de la solicitud:**
```json
{
  "nombre": "MANUEL",
  "apellidos": "HERNANDEZ PEREZ",
  "email": "manuel.hernandez@ejemplo.com",
  "finess": "3170002",
  "fecha_alta": "2024-11-25"
}
```

**Respuesta exitosa (201 Created):**
```json
{
  "id": 2,
  "nombre": "MANUEL",
  "apellidos": "HERNANDEZ PEREZ",
  "email": "manuel.hernandez@ejemplo.com",
  "finess": "3170002",
  "fecha_alta": "2024-11-25",
  "estado": "ACTIVO",
  "fecha_baja": null,
  "fecha_notificacion_alta": null,
  "fecha_notificacion_baja": null
}
```

#### Actualizar fisioterapeuta

```
PUT /fisioterapeutas/:id
```

**Cuerpo de la solicitud:**
```json
{
  "nombre": "MANUEL",
  "apellidos": "HERNANDEZ GARCIA",
  "email": "manuel.hernandez@ejemplo.com",
  "finess": "3170002"
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "id": 2,
  "nombre": "MANUEL",
  "apellidos": "HERNANDEZ GARCIA",
  "email": "manuel.hernandez@ejemplo.com",
  "finess": "3170002",
  "fecha_alta": "2024-11-25",
  "estado": "ACTIVO",
  "fecha_baja": null,
  "fecha_notificacion_alta": null,
  "fecha_notificacion_baja": null
}
```

#### Dar de baja fisioterapeuta

```
PUT /fisioterapeutas/:id/baja
```

**Cuerpo de la solicitud:**
```json
{
  "fecha_baja": "2024-12-31"
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "id": 2,
  "nombre": "MANUEL",
  "apellidos": "HERNANDEZ GARCIA",
  "email": "manuel.hernandez@ejemplo.com",
  "finess": "3170002",
  "fecha_alta": "2024-11-25",
  "fecha_baja": "2024-12-31",
  "estado": "ACTIVO",
  "fecha_notificacion_alta": "2024-11-26",
  "fecha_notificacion_baja": null
}
```

#### Eliminar fisioterapeuta

```
DELETE /fisioterapeutas/:id
```

**Respuesta exitosa (204 No Content)**

### Notificaciones

#### Enviar notificaciones de alta

```
POST /notificaciones/altas
```

**Cuerpo de la solicitud:**
```json
{
  "fisioterapeutas": [1, 2, 3]
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "message": "Notificaciones de alta enviadas correctamente",
  "enviadas": 3,
  "fallidas": 0,
  "detalles": [
    {
      "fisioterapeuta_id": 1,
      "estado": "ENVIADO",
      "destinatarios": ["Colegio de Fisioterapeutas", "Seguridad Social", "Profesional"]
    },
    // ...
  ]
}
```

#### Enviar notificaciones de baja

```
POST /notificaciones/bajas
```

**Cuerpo de la solicitud:**
```json
{
  "fisioterapeutas": [4, 5]
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "message": "Notificaciones de baja enviadas correctamente",
  "enviadas": 2,
  "fallidas": 0,
  "detalles": [
    {
      "fisioterapeuta_id": 4,
      "estado": "ENVIADO",
      "destinatarios": ["Colegio de Fisioterapeutas", "Seguridad Social", "Profesional"]
    },
    // ...
  ]
}
```

#### Obtener historial de notificaciones

```
GET /notificaciones
```

**Parámetros de consulta:**
- `page`: Número de página (por defecto: 1)
- `limit`: Número de elementos por página (por defecto: 10)
- `tipo`: Tipo de notificación (ALTA o BAJA)
- `fisioterapeuta_id`: ID del fisioterapeuta

**Respuesta exitosa (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "fisioterapeuta_id": 1,
      "fisioterapeuta_nombre": "CESAR NAVARRO ALBARRACIN",
      "tipo": "ALTA",
      "fecha_envio": "2024-11-21T10:15:30Z",
      "estado": "ENVIADO",
      "destinatarios": [
        {
          "nombre": "Colegio de Fisioterapeutas",
          "email": "cdo31@ordremk.fr",
          "estado": "ENVIADO"
        },
        // ...
      ]
    },
    // ...
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

### Contratos

#### Subir contrato

```
POST /contratos
```

**Cuerpo de la solicitud:** (multipart/form-data)
- `file`: Archivo del contrato
- `fisioterapeuta_id`: ID del fisioterapeuta (opcional)

**Respuesta exitosa (201 Created):**
```json
{
  "id": 1,
  "nombre_archivo": "20-11-2024 CESAR NAVARRO ALBARRACIN.pdf",
  "ruta_archivo": "/storage/contratos/20-11-2024 CESAR NAVARRO ALBARRACIN.pdf",
  "fecha_subida": "2024-11-20T09:30:15Z",
  "fisioterapeuta_id": 1
}
```

#### Obtener contratos

```
GET /contratos
```

**Parámetros de consulta:**
- `page`: Número de página (por defecto: 1)
- `limit`: Número de elementos por página (por defecto: 10)
- `fisioterapeuta_id`: ID del fisioterapeuta

**Respuesta exitosa (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "nombre_archivo": "20-11-2024 CESAR NAVARRO ALBARRACIN.pdf",
      "ruta_archivo": "/storage/contratos/20-11-2024 CESAR NAVARRO ALBARRACIN.pdf",
      "fecha_subida": "2024-11-20T09:30:15Z",
      "fisioterapeuta_id": 1,
      "fisioterapeuta_nombre": "CESAR NAVARRO ALBARRACIN"
    },
    // ...
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### Descargar contrato

```
GET /contratos/:id/descargar
```

**Respuesta exitosa:** Archivo PDF

#### Eliminar contrato

```
DELETE /contratos/:id
```

**Respuesta exitosa (204 No Content)**

### Plantillas

#### Obtener todas las plantillas

```
GET /plantillas
```

**Respuesta exitosa (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "ALTA_COLEGIO",
      "asunto": "Notification de l'arrivée d'un nouveau kinésithérapeute et mise à jour du personnel au cabinet",
      "cuerpo": "Bonjour,\n\nJe me permets de vous écrire...",
      "activo": true
    },
    // ...
  ]
}
```

#### Obtener plantilla por ID

```
GET /plantillas/:id
```

**Respuesta exitosa (200 OK):**
```json
{
  "id": 1,
  "nombre": "ALTA_COLEGIO",
  "asunto": "Notification de l'arrivée d'un nouveau kinésithérapeute et mise à jour du personnel au cabinet",
  "cuerpo": "Bonjour,\n\nJe me permets de vous écrire...",
  "activo": true
}
```

#### Actualizar plantilla

```
PUT /plantillas/:id
```

**Cuerpo de la solicitud:**
```json
{
  "asunto": "Notification de l'arrivée d'un nouveau kinésithérapeute et mise à jour du personnel au cabinet",
  "cuerpo": "Bonjour,\n\nJe me permets de vous écrire pour vous informer...",
  "activo": true
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "id": 1,
  "nombre": "ALTA_COLEGIO",
  "asunto": "Notification de l'arrivée d'un nouveau kinésithérapeute et mise à jour du personnel au cabinet",
  "cuerpo": "Bonjour,\n\nJe me permets de vous écrire pour vous informer...",
  "activo": true
}
```

### Destinatarios

#### Obtener todos los destinatarios

```
GET /destinatarios
```

**Respuesta exitosa (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Colegio de Fisioterapeutas",
      "email": "cdo31@ordremk.fr",
      "activo": true
    },
    // ...
  ]
}
```

#### Obtener destinatario por ID

```
GET /destinatarios/:id
```

**Respuesta exitosa (200 OK):**
```json
{
  "id": 1,
  "nombre": "Colegio de Fisioterapeutas",
  "email": "cdo31@ordremk.fr",
  "activo": true
}
```

#### Actualizar destinatario

```
PUT /destinatarios/:id
```

**Cuerpo de la solicitud:**
```json
{
  "nombre": "Colegio de Fisioterapeutas",
  "email": "nuevo.email@ordremk.fr",
  "activo": true
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "id": 1,
  "nombre": "Colegio de Fisioterapeutas",
  "email": "nuevo.email@ordremk.fr",
  "activo": true
}
```

### Usuarios

#### Obtener todos los usuarios

```
GET /usuarios
```

**Respuesta exitosa (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Admin",
      "apellidos": "Sistema",
      "email": "admin@sistema.com",
      "rol": "ADMIN",
      "activo": true,
      "fecha_creacion": "2024-10-01T00:00:00Z",
      "fecha_actualizacion": "2024-10-01T00:00:00Z"
    },
    // ...
  ]
}
```

#### Obtener usuario por ID

```
GET /usuarios/:id
```

**Respuesta exitosa (200 OK):**
```json
{
  "id": 1,
  "nombre": "Admin",
  "apellidos": "Sistema",
  "email": "admin@sistema.com",
  "rol": "ADMIN",
  "activo": true,
  "fecha_creacion": "2024-10-01T00:00:00Z",
  "fecha_actualizacion": "2024-10-01T00:00:00Z"
}
```

#### Crear usuario

```
POST /usuarios
```

**Cuerpo de la solicitud:**
```json
{
  "nombre": "Usuario",
  "apellidos": "Nuevo",
  "email": "usuario.nuevo@sistema.com",
  "password": "contraseña",
  "rol": "USUARIO"
}
```

**Respuesta exitosa (201 Created):**
```json
{
  "id": 2,
  "nombre": "Usuario",
  "apellidos": "Nuevo",
  "email": "usuario.nuevo@sistema.com",
  "rol": "USUARIO",
  "activo": true,
  "fecha_creacion": "2024-11-25T12:34:56Z",
  "fecha_actualizacion": "2024-11-25T12:34:56Z"
}
```

#### Actualizar usuario

```
PUT /usuarios/:id
```

**Cuerpo de la solicitud:**
```json
{
  "nombre": "Usuario",
  "apellidos": "Actualizado",
  "email": "usuario.actualizado@sistema.com",
  "rol": "USUARIO",
  "activo": true
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "id": 2,
  "nombre": "Usuario",
  "apellidos": "Actualizado",
  "email": "usuario.actualizado@sistema.com",
  "rol": "USUARIO",
  "activo": true,
  "fecha_creacion": "2024-11-25T12:34:56Z",
  "fecha_actualizacion": "2024-11-25T13:45:00Z"
}
```

#### Cambiar contraseña

```
PUT /usuarios/:id/password
```

**Cuerpo de la solicitud:**
```json
{
  "password_actual": "contraseña",
  "password_nueva": "nueva_contraseña"
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "message": "Contraseña actualizada correctamente"
}
```

#### Eliminar usuario

```
DELETE /usuarios/:id
```

**Respuesta exitosa (204 No Content)**

### Configuración

#### Obtener configuración

```
GET /configuracion
```

**Respuesta exitosa (200 OK):**
```json
{
  "data": [
    {
      "clave": "EMAIL_REMITENTE",
      "valor": "diversifica.ia@outlook.es",
      "descripcion": "Email desde el que se envían las notificaciones"
    },
    // ...
  ]
}
```

#### Actualizar configuración

```
PUT /configuracion/:clave
```

**Cuerpo de la solicitud:**
```json
{
  "valor": "nuevo.email@outlook.es",
  "descripcion": "Email desde el que se envían las notificaciones"
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "clave": "EMAIL_REMITENTE",
  "valor": "nuevo.email@outlook.es",
  "descripcion": "Email desde el que se envían las notificaciones",
  "fecha_actualizacion": "2024-11-25T14:30:00Z"
}
```

## Códigos de Estado

- `200 OK`: La solicitud se ha completado correctamente
- `201 Created`: El recurso se ha creado correctamente
- `204 No Content`: La solicitud se ha completado correctamente pero no hay contenido para devolver
- `400 Bad Request`: La solicitud no se puede procesar debido a un error del cliente
- `401 Unauthorized`: La solicitud requiere autenticación
- `403 Forbidden`: El servidor ha entendido la solicitud pero se niega a autorizarla
- `404 Not Found`: El recurso solicitado no existe
- `500 Internal Server Error`: Error interno del servidor

## Manejo de Errores

Todas las respuestas de error siguen el mismo formato:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error",
    "details": {} // Detalles adicionales (opcional)
  }
}
```

Ejemplos de códigos de error:
- `INVALID_CREDENTIALS`: Credenciales inválidas
- `RESOURCE_NOT_FOUND`: Recurso no encontrado
- `VALIDATION_ERROR`: Error de validación
- `UNAUTHORIZED`: No autorizado
- `FORBIDDEN`: Prohibido
- `INTERNAL_ERROR`: Error interno del servidor
