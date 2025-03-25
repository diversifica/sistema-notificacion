const express = require('express');
const router = express.Router();
const multer = require('multer');
const ContratoController = require('../controllers/contrato.controller');
const { verifyToken, verifyUser, verifyRoles } = require('../middlewares/auth.middleware');

// Configuración de multer
const storage = ContratoController.getStorage();
const fileFilter = ContratoController.getFileFilter();
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Middleware para todas las rutas
router.use(verifyToken, verifyUser);

// Rutas para obtener contratos
router.get('/', ContratoController.getAll);
router.get('/:id', ContratoController.getById);

// Ruta para subir contrato
router.post('/upload', verifyRoles(['ADMIN']), upload.single('contrato'), ContratoController.upload);

// Ruta para eliminar contrato
router.delete('/:id', verifyRoles(['ADMIN']), ContratoController.delete);

module.exports = router;
