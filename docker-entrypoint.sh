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
