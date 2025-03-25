const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const fisioterapeutaRoutes = require('./routes/fisioterapeuta.routes');
const contratoRoutes = require('./routes/contrato.routes');
const notificacionRoutes = require('./routes/notificacion.routes');
const plantillaRoutes = require('./routes/plantilla.routes');
const destinatarioRoutes = require('./routes/destinatario.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const configuracionRoutes = require('./routes/configuracion.routes');

// Inicializar la base de datos
const db = require('./config/database');

// Crear directorios necesarios
const contratosDir = process.env.CONTRATOS_DIR || path.join(__dirname, '../storage/contratos');
const tempDir = process.env.TEMP_DIR || path.join(__dirname, '../storage/temp');
const dbDir = path.join(__dirname, '../storage/db');

if (!fs.existsSync(contratosDir)) {
  fs.mkdirSync(contratosDir, { recursive: true });
}

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Inicializar la aplicación Express
const app = express();

// Configurar middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/static', express.static(path.join(__dirname, '../public')));

// Configurar rutas
app.use('/api/auth', authRoutes);
app.use('/api/fisioterapeutas', fisioterapeutaRoutes);
app.use('/api/contratos', contratoRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/plantillas', plantillaRoutes);
app.use('/api/destinatarios', destinatarioRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/configuracion', configuracionRoutes);

// Ruta para verificar que el servidor está funcionando
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Servir la aplicación React en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });
}

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    }
  });
});

module.exports = app;
