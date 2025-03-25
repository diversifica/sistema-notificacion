FROM node:20-alpine
WORKDIR /app/backend

# Instalar dependencias adicionales
RUN apk add --no-cache python3 make g++ sqlite tzdata

# Crear directorio src primero
RUN mkdir -p src

# Crear archivos de la aplicación
RUN echo '{"name":"sistema-notificacion-backend","version":"1.0.0","dependencies":{"express":"^4.18.2"}}' > package.json
RUN echo 'const express = require("express"); const app = express(); app.get("/", (req, res) => res.send("Sistema de Notificación de Altas y Bajas")); module.exports = app;' > src/app.js
# La siguiente línea es la que cambia, especificando el puerto 8080
RUN echo 'const app = require("./src/app"); const PORT = 8080; app.listen(PORT, () => console.log(`Servidor iniciado en puerto ${PORT}`));' > server.js

# Instalar dependencias
RUN npm install

# Exponer puerto 8080 en lugar de 80
EXPOSE 8080

# Comando de inicio directo sin script entrypoint
CMD ["node", "server.js"]
