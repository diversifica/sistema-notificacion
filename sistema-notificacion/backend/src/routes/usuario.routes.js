const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuario.controller');
const { verifyToken, verifyUser, verifyRoles } = require('../middlewares/auth.middleware');

// Middleware para todas las rutas
router.use(verifyToken, verifyUser);

// Rutas para obtener usuarios (requieren rol ADMIN)
router.get('/', verifyRoles(['ADMIN']), UsuarioController.getAll);
router.get('/:id', verifyRoles(['ADMIN']), UsuarioController.getById);

// Rutas para gestionar usuarios (requieren rol ADMIN)
router.post('/', verifyRoles(['ADMIN']), UsuarioController.create);
router.put('/:id', verifyRoles(['ADMIN']), UsuarioController.update);
router.delete('/:id', verifyRoles(['ADMIN']), UsuarioController.delete);
router.patch('/:id/toggle-active', verifyRoles(['ADMIN']), UsuarioController.toggleActive);

module.exports = router;
