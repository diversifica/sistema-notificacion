const express = require('express');
const router = express.Router();
const FisioterapeutaController = require('../controllers/fisioterapeuta.controller');
const { verifyToken, verifyUser, verifyRoles } = require('../middlewares/auth.middleware');

// Middleware para todas las rutas
router.use(verifyToken, verifyUser);

// Rutas para obtener fisioterapeutas
router.get('/activos', FisioterapeutaController.getAllActivos);
router.get('/inactivos', FisioterapeutaController.getAllInactivos);
router.get('/pendientes-alta', FisioterapeutaController.getPendientesNotificarAlta);
router.get('/pendientes-baja', FisioterapeutaController.getPendientesNotificarBaja);
router.get('/search', FisioterapeutaController.search);
router.get('/:id', FisioterapeutaController.getById);

// Rutas para gestionar fisioterapeutas (requieren rol ADMIN)
router.post('/', verifyRoles(['ADMIN']), FisioterapeutaController.create);
router.put('/:id', verifyRoles(['ADMIN']), FisioterapeutaController.update);
router.delete('/:id', verifyRoles(['ADMIN']), FisioterapeutaController.delete);

// Rutas para gestionar altas y bajas
router.post('/:id/baja', verifyRoles(['ADMIN']), FisioterapeutaController.darDeBaja);
router.post('/:id/notificacion-alta', verifyRoles(['ADMIN']), FisioterapeutaController.registrarNotificacionAlta);
router.post('/:id/notificacion-baja', verifyRoles(['ADMIN']), FisioterapeutaController.registrarNotificacionBaja);

module.exports = router;
