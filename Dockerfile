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

# Crear archivo schema.sql (usando cat para evitar problemas con los comentarios --)
RUN cat > /app/migrations/schema.sql << 'EOL'
CREATE TABLE fisioterapeuta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    email TEXT NOT NULL,
    finess TEXT NOT NULL,
    fecha_alta DATE NOT NULL,
    fecha_baja DATE,
    estado TEXT NOT NULL DEFAULT 'ACTIVO',
    fecha_notificacion_alta DATE,
    fecha_notificacion_baja DATE,
    ruta_contrato TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notificacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fisioterapeuta_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado TEXT NOT NULL DEFAULT 'ENVIADO',
    FOREIGN KEY (fisioterapeuta_id) REFERENCES fisioterapeuta(id)
);

CREATE TABLE destinatario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'USUARIO',
    activo BOOLEAN NOT NULL DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOL

# Crear archivo seed.sql
RUN cat > /app/migrations/seed.sql << 'EOL'
INSERT INTO destinatario (nombre, email) VALUES 
('Colegio de Fisioterapeutas', 'cdo31@ordremk.fr'),
('Seguridad Social', 'ps.cpam-haute-garonne@assurance-maladie.fr'),
('Profesional', '');

INSERT INTO usuario (nombre, apellidos, email, password, rol) VALUES 
('Admin', 'Sistema', 'admin@sistema.com', '$2a$10$1qAz2wSx3eDc4rFv5tGb5t8WGc5wPZXPUoY1cYXvW1cj8zR.6Alu.', 'ADMIN');
EOL

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
RUN cat > /app/docker-entrypoint.sh << 'EOL'
#!/bin/sh

# Inicializar la base de datos si no existe
if [ ! -f /app/storage/db/database.sqlite ]; then
  echo "Inicializando base de datos..."
  cd /app
  mkdir -p /app/storage/db
  touch /app/storage/db/database.sqlite
  cat /app/migrations/schema.sql | sqlite3 /app/storage/db/database.sqlite
  cat /app/migrations/seed.sql | sqlite3 /app/storage/db/database.sqlite
  echo "Base de datos inicializada correctamente."
fi

# Iniciar la aplicación
cd /app/backend
node server.js
EOL

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
