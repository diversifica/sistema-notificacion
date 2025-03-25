FROM node:20-alpine

WORKDIR /app

# Instalar dependencias adicionales
RUN apk add --no-cache python3 make g++ sqlite tzdata

# Crear estructura básica
RUN mkdir -p /app/backend/src

# Crear archivo package.json correctamente
RUN echo '{"name":"sistema-notificacion-backend","version":"1.0.0","dependencies":{"express":"^4.18.2"}}' > /app/backend/package.json

# Crear archivos de la aplicación
RUN echo 'const express = require("express"); const app = express(); app.get("/", (req, res) => res.send("Sistema de Notificación de Altas y Bajas")); module.exports = app;' > /app/backend/src/app.js
RUN echo 'const app = require("./src/app"); const PORT = process.env.PORT || 3000; app.listen(PORT, () => console.log(`Servidor iniciado en puerto ${PORT}`));' > /app/backend/server.js

# Crear script de entrada
RUN echo '#!/bin/sh\ncd /app/backend\nnpm install\nnode server.js' > /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh && \
    ls -la /app/entrypoint.sh

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["/bin/sh", "/app/entrypoint.sh"]
