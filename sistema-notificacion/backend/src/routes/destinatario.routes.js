const express = require('express');
const router = express.Router();
const DestinatarioController = require('../controllers/destinatario.controller');
const { verifyToken, verifyUser, verifyRoles } = require('../middlewares/auth.middleware');

// Middleware para todas las rutas
router.use(verifyToken, verifyUser);

// Rutas para obtener destinatarios
router.get('/', DestinatarioController.getAll);
router.get('/:id', DestinatarioController.getById);

// Rutas para gestionar destinatarios (requieren rol ADMIN)
router.post('/', verifyRoles(['ADMIN']), DestinatarioController.create);
router.put('/:id', verifyRoles(['ADMIN']), DestinatarioController.update);
router.delete('/:id', verifyRoles(['ADMIN']), DestinatarioController.delete);
router.patch('/:id/toggle-active', verifyRoles(['ADMIN']), DestinatarioController.toggleActive);

module.exports = router;
