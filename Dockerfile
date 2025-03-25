FROM node:20-alpine

WORKDIR /app

# Instalar dependencias adicionales
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    tzdata

# Configurar zona horaria
RUN cp /usr/share/zoneinfo/Europe/Paris /etc/localtime && echo Europe/Paris > /etc/timezone

# Crear estructura de directorios
RUN mkdir -p backend frontend migrations storage/db storage/contratos storage/temp

# Copiar archivos de migración
COPY migrations ./migrations/

# Copiar código del backend
COPY backend ./backend/

# Copiar código del frontend
COPY frontend ./frontend/

# Instalar dependencias del backend
WORKDIR /app/backend
RUN npm install --production

# Instalar dependencias y construir el frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Volver al directorio principal
WORKDIR /app

# Copiar script de entrada
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["./docker-entrypoint.sh"]
