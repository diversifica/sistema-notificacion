# Dockerfile para el Sistema de Notificación de Altas y Bajas
# Imagen base: Node.js 20 en Alpine Linux para un tamaño reducido
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    tzdata

# Configurar zona horaria
ENV TZ=Europe/Paris
RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copiar archivos de configuración de paquetes
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p /app/storage/contratos /app/storage/temp /app/storage/db

# Establecer permisos
RUN chmod -R 755 /app/storage

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
