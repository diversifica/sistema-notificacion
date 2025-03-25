const express = require('express');
const router = express.Router();
const NotificacionController = require('../controllers/notificacion.controller');
const { verifyToken, verifyUser, verifyRoles } = require('../middlewares/auth.middleware');

// Middleware para todas las rutas
router.use(verifyToken, verifyUser);

// Rutas para obtener notificaciones
router.get('/', NotificacionController.getAll);
router.get('/:id', NotificacionController.getById);

// Rutas para enviar notificaciones (requieren rol ADMIN)
router.post('/enviar-altas', verifyRoles(['ADMIN']), NotificacionController.enviarNotificacionesAlta);
router.post('/enviar-bajas', verifyRoles(['ADMIN']), NotificacionController.enviarNotificacionesBaja);

module.exports = router;
