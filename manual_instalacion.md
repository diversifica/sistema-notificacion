# Manual de Instalación y Despliegue - Sistema de Notificación de Altas y Bajas

## Introducción

Este documento proporciona las instrucciones detalladas para instalar y desplegar el Sistema de Notificación de Altas y Bajas de fisioterapeutas utilizando Docker. El sistema está diseñado para ser fácilmente desplegable en cualquier servidor que soporte Docker.

## Requisitos Previos

Antes de comenzar la instalación, asegúrese de que su servidor cumple con los siguientes requisitos:

- Sistema operativo: Linux (recomendado Ubuntu 20.04 o superior)
- Docker Engine (versión 20.10 o superior)
- Docker Compose (versión 2.0 o superior)
- Al menos 2GB de RAM
- Al menos 10GB de espacio en disco
- Conexión a Internet para la descarga de imágenes Docker
- Servidor SMTP configurado para el envío de correos electrónicos

## Estructura de Archivos

Los archivos necesarios para el despliegue se organizan de la siguiente manera:

```
sistema-notificacion/
├── Dockerfile
├── docker-compose.yml
├── docker-entrypoint.sh
├── .dockerignore
├── migrations/
│   ├── schema.sql
│   └── seed.sql
├── .env.example
└── README.md
```

## Pasos de Instalación

### 1. Preparación del Entorno

1. Cree un directorio para el proyecto:

```bash
mkdir -p /opt/sistema-notificacion
cd /opt/sistema-notificacion
```

2. Copie todos los archivos de configuración Docker al directorio:

```bash
# Asumiendo que los archivos están en un directorio llamado docker-config
cp -r /ruta/a/docker-config/* /opt/sistema-notificacion/
```

3. Cree un archivo `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

4. Edite el archivo `.env` para configurar las variables de entorno:

```bash
# Abrir el archivo con un editor de texto
nano .env
```

Configure las siguientes variables:

```
# Configuración de la aplicación
NODE_ENV=production
PORT=3000
TZ=Europe/Paris

# Configuración de la base de datos
DB_PATH=/app/storage/db/database.sqlite

# Configuración del almacenamiento
STORAGE_PATH=/app/storage

# Configuración del servidor SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=usuario@example.com
SMTP_PASSWORD=contraseña_segura
```

### 2. Construcción y Despliegue

1. Construya la imagen Docker:

```bash
docker-compose build
```

2. Inicie los servicios:

```bash
docker-compose up -d
```

3. Verifique que los servicios están funcionando correctamente:

```bash
docker-compose ps
```

Debería ver algo similar a:

```
            Name                          Command               State           Ports         
---------------------------------------------------------------------------------------------
sistema-notificacion-altas-bajas   /app/docker-entrypoint.sh npm ...   Up      0.0.0.0:3000->3000/tcp
```

### 3. Verificación de la Instalación

1. Acceda a la aplicación a través del navegador:

```
http://[dirección-ip-del-servidor]:3000
```

2. Inicie sesión con las credenciales por defecto:

```
Email: admin@sistema.com
Contraseña: admin123
```

3. Cambie la contraseña por defecto inmediatamente después del primer inicio de sesión.

## Configuración Adicional

### Configuración del Servidor SMTP

Para que el sistema pueda enviar notificaciones por correo electrónico, es necesario configurar correctamente el servidor SMTP. Puede hacerlo de dos maneras:

1. A través del archivo `.env` (como se mostró anteriormente)
2. A través de la interfaz de administración del sistema:
   - Inicie sesión como administrador
   - Vaya a la sección "Configuración"
   - Actualice los parámetros del servidor SMTP

### Configuración de Plantillas de Correo

El sistema viene con plantillas predefinidas para las notificaciones de alta y baja. Puede personalizarlas a través de la interfaz de administración:

1. Inicie sesión como administrador
2. Vaya a la sección "Configuración"
3. Seleccione "Plantillas de Correo"
4. Edite las plantillas según sus necesidades

### Configuración de Destinatarios

Los destinatarios de las notificaciones (Colegio de Fisioterapeutas, Seguridad Social) vienen preconfigurados, pero puede actualizarlos:

1. Inicie sesión como administrador
2. Vaya a la sección "Configuración"
3. Seleccione "Destinatarios"
4. Actualice las direcciones de correo electrónico

## Mantenimiento

### Respaldo de Datos

Es recomendable realizar respaldos periódicos de la base de datos y los archivos de contratos. Puede hacerlo con los siguientes comandos:

```bash
# Crear directorio para respaldos
mkdir -p /opt/backups/sistema-notificacion

# Respaldar la base de datos
docker exec sistema-notificacion-altas-bajas sqlite3 /app/storage/db/database.sqlite .dump > /opt/backups/sistema-notificacion/database_$(date +%Y%m%d).sql

# Respaldar los contratos
docker cp sistema-notificacion-altas-bajas:/app/storage/contratos /opt/backups/sistema-notificacion/contratos_$(date +%Y%m%d)
```

### Actualización del Sistema

Para actualizar el sistema a una nueva versión:

1. Detenga los servicios:

```bash
cd /opt/sistema-notificacion
docker-compose down
```

2. Haga un respaldo de los datos (como se mostró anteriormente)

3. Actualice los archivos de configuración:

```bash
# Asumiendo que los nuevos archivos están en un directorio llamado nueva-version
cp -r /ruta/a/nueva-version/* /opt/sistema-notificacion/
```

4. Reconstruya e inicie los servicios:

```bash
docker-compose build
docker-compose up -d
```

### Logs del Sistema

Para ver los logs del sistema:

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver los últimos 100 logs
docker-compose logs --tail=100
```

## Solución de Problemas

### El sistema no inicia

Verifique los logs para identificar el problema:

```bash
docker-compose logs
```

Asegúrese de que todos los archivos tienen los permisos correctos:

```bash
chmod +x docker-entrypoint.sh
```

### No se pueden enviar correos electrónicos

Verifique la configuración del servidor SMTP:

```bash
# Ver la configuración actual
docker exec sistema-notificacion-altas-bajas sqlite3 /app/storage/db/database.sqlite "SELECT * FROM configuracion WHERE clave LIKE 'SMTP%';"
```

Asegúrese de que el servidor SMTP es accesible desde el contenedor:

```bash
docker exec sistema-notificacion-altas-bajas ping -c 3 smtp.example.com
```

### Problemas de permisos en los archivos

Si hay problemas con los permisos de los archivos, puede ajustarlos:

```bash
# Dar permisos al volumen de datos
docker exec sistema-notificacion-altas-bajas chmod -R 755 /app/storage
```

## Desinstalación

Si necesita desinstalar el sistema:

1. Detenga y elimine los contenedores:

```bash
cd /opt/sistema-notificacion
docker-compose down -v
```

2. Elimine los archivos de configuración:

```bash
rm -rf /opt/sistema-notificacion
```

## Soporte Técnico

Para obtener soporte técnico, contacte a:

- Email: diversifica.ia@outlook.es
- Teléfono: [Número de teléfono]

## Conclusión

Siguiendo estas instrucciones, habrá instalado y configurado correctamente el Sistema de Notificación de Altas y Bajas de fisioterapeutas en su servidor. El sistema está listo para ser utilizado por el personal administrativo para gestionar las altas y bajas de fisioterapeutas y enviar las notificaciones correspondientes.
