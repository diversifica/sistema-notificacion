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

# Crear estructura básica del backend
RUN mkdir -p /app/backend/src
RUN echo "const express = require('express');\nconst app = express();\napp.get('/', (req, res) => res.send('Sistema de Notificación de Altas y Bajas'));\nmodule.exports = app;" > /app/backend/src/app.js
RUN echo "const app = require('./src/app');\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => console.log(\`Servidor iniciado en puerto \${PORT}\`));" > /app/backend/server.js
RUN echo '{\n  "name": "sistema-notificacion-backend",\n  "version": "1.0.0",\n  "dependencies": {\n    "express": "^4.18.2"\n  }\n}' > /app/backend/package.json

# Crear script de entrada
RUN echo '#!/bin/sh\n\ncd /app/backend\nnpm install\nnode server.js' > /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Instalar dependencias del backend
WORKDIR /app/backend
RUN npm install

# Volver al directorio principal
WORKDIR /app

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["./docker-entrypoint.sh"]
