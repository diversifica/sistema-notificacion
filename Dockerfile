FROM node:16-alpine

WORKDIR /app

# Instalar dependencias del backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Instalar dependencias del frontend y construir
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend ./frontend
RUN cd frontend && npm run build

# Copiar código del backend
COPY backend ./backend

# Crear directorios de almacenamiento
RUN mkdir -p storage/db storage/contratos storage/temp

# Copiar archivos de migración
COPY migrations ./migrations

# Exponer puerto
EXPOSE 3000

# Script de entrada
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]
