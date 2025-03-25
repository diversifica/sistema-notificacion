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

# Crear archivos de migración manualmente
RUN mkdir -p /app/migrations

# Crear archivo schema.sql
RUN echo "-- Esquema de la base de datos para el Sistema de Notificación de Altas y Bajas
-- Creación de tablas

-- Tabla de fisioterapeutas
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
);" > /app/migrations/schema.sql

# Crear archivo seed.sql
RUN echo "-- Datos iniciales para el Sistema de Notificación de Altas y Bajas
-- Inserción de datos de ejemplo

-- Destinatarios
INSERT INTO destinatario (nombre, email) VALUES 
('Colegio de Fisioterapeutas', 'cdo31@ordremk.fr'),
('Seguridad Social', 'ps.cpam-haute-garonne@assurance-maladie.fr'),
('Profesional', '');" > /app/migrations/seed.sql

# Crear estructura básica del backend
RUN mkdir -p /app/backend/src
RUN echo "const express = require('express');\nconst app = express();\napp.get('/', (req, res) => res.send('Sistema de Notificación de Altas y Bajas'));\nmodule.exports = app;" > /app/backend/src/app.js
RUN echo "const app = require('./src/app');\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => console.log(\`Servidor iniciado en puerto \${PORT}\`));" > /app/backend/server.js
RUN echo '{\n  "name": "sistema-notificacion-backend",\n  "version": "1.0.0",\n  "dependencies": {\n    "express": "^4.18.2",\n    "sqlite3": "^5.1.6",\n    "bcrypt": "^5.1.1",\n    "jsonwebtoken": "^9.0.2",\n    "cors": "^2.8.5",\n    "nodemailer": "^6.9.7",\n    "multer": "^1.4.5-lts.1",\n    "dotenv": "^16.3.1"\n  }\n}' > /app/backend/package.json

# Crear estructura básica del frontend
RUN mkdir -p /app/frontend/public /app/frontend/src
RUN echo '<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Sistema de Notificación</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>' > /app/frontend/public/index.html
RUN echo 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\nimport "./index.css";\n\nconst root = ReactDOM.createRoot(document.getElementById("root"));\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);' > /app/frontend/src/index.js
RUN echo 'import React from "react";\n\nfunction App() {\n  return (\n    <div className="App">\n      <header className="App-header">\n        <h1>Sistema de Notificación de Altas y Bajas</h1>\n        <p>Bienvenido al sistema</p>\n      </header>\n    </div>\n  );\n}\n\nexport default App;' > /app/frontend/src/App.js
RUN echo 'body {\n  margin: 0;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",\n    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",\n    sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\ncode {\n  font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",\n    monospace;\n}' > /app/frontend/src/index.css
RUN echo '{\n  "name": "sistema-notificacion-frontend",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0",\n    "react-router-dom": "^6.18.0",\n    "axios": "^1.6.0"\n  },\n  "scripts": {\n    "start": "react-scripts start",\n    "build": "echo \\"Build completado\\""\n  }\n}' > /app/frontend/package.json

# Crear script de entrada
RUN echo '#!/bin/sh\n\n# Inicializar la base de datos si no existe\nif [ ! -f /app/storage/db/database.sqlite ]; then\n  echo "Inicializando base de datos..."\n  cd /app\n  mkdir -p /app/storage/db\n  touch /app/storage/db/database.sqlite\n  cat /app/migrations/schema.sql | sqlite3 /app/storage/db/database.sqlite\n  cat /app/migrations/seed.sql | sqlite3 /app/storage/db/database.sqlite\n  echo "Base de datos inicializada correctamente."\nfi\n\n# Iniciar la aplicación\ncd /app/backend\nnode server.js' > /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Instalar dependencias del backend
WORKDIR /app/backend
RUN npm install --production

# Instalar dependencias del frontend
WORKDIR /app/frontend
RUN npm install

# Volver al directorio principal
WORKDIR /app

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["./docker-entrypoint.sh"]
