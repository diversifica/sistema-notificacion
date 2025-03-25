const express = require('express');
const router = express.Router();
const ConfiguracionController = require('../controllers/configuracion.controller');
const { verifyToken, verifyUser, verifyRoles } = require('../middlewares/auth.middleware');

// Middleware para todas las rutas
router.use(verifyToken, verifyUser);

// Rutas para obtener configuraciones
router.get('/', verifyRoles(['ADMIN']), ConfiguracionController.getAll);
router.get('/email', verifyRoles(['ADMIN']), ConfiguracionController.getEmailConfig);
router.get('/prefix/:prefix', verifyRoles(['ADMIN']), ConfiguracionController.getByPrefix);
router.get('/:clave', verifyRoles(['ADMIN']), ConfiguracionController.getByKey);

// Rutas para gestionar configuraciones (requieren rol ADMIN)
router.post('/', verifyRoles(['ADMIN']), ConfiguracionController.set);
router.delete('/:clave', verifyRoles(['ADMIN']), ConfiguracionController.delete);

module.exports = router;
