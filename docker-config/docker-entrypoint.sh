#!/bin/sh
# Script de inicialización para el Sistema de Notificación de Altas y Bajas

# Verificar si la base de datos existe
if [ ! -f /app/storage/db/database.sqlite ]; then
    echo "Creando base de datos..."
    mkdir -p /app/storage/db
    
    # Inicializar la base de datos con el esquema
    sqlite3 /app/storage/db/database.sqlite < /app/migrations/schema.sql
    
    # Cargar datos iniciales
    sqlite3 /app/storage/db/database.sqlite < /app/migrations/seed.sql
    
    echo "Base de datos creada e inicializada correctamente."
else
    echo "La base de datos ya existe."
fi

# Verificar directorios de almacenamiento
for dir in /app/storage/contratos /app/storage/temp; do
    if [ ! -d "$dir" ]; then
        echo "Creando directorio $dir..."
        mkdir -p "$dir"
        chmod 755 "$dir"
    fi
done

# Iniciar la aplicación
echo "Iniciando la aplicación..."
exec "$@"
