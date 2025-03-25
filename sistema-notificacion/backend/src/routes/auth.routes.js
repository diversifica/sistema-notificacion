const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { verifyToken, verifyUser } = require('../middlewares/auth.middleware');

// Ruta de login
router.post('/login', AuthController.login);

// Ruta para verificar token
router.get('/verify', verifyToken, AuthController.verifyToken);

// Ruta para obtener perfil del usuario actual
router.get('/profile', verifyToken, verifyUser, AuthController.getProfile);

// Ruta para cambiar contraseña
router.post('/change-password', verifyToken, verifyUser, AuthController.changePassword);

module.exports = router;
