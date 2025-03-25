const express = require('express');
const router = express.Router();
const PlantillaController = require('../controllers/plantilla.controller');
const { verifyToken, verifyUser, verifyRoles } = require('../middlewares/auth.middleware');

// Middleware para todas las rutas
router.use(verifyToken, verifyUser);

// Rutas para obtener plantillas
router.get('/', PlantillaController.getAll);
router.get('/:id', PlantillaController.getById);
router.get('/nombre/:nombre', PlantillaController.getByNombre);

// Rutas para gestionar plantillas (requieren rol ADMIN)
router.post('/', verifyRoles(['ADMIN']), PlantillaController.create);
router.put('/:id', verifyRoles(['ADMIN']), PlantillaController.update);
router.delete('/:id', verifyRoles(['ADMIN']), PlantillaController.delete);
router.patch('/:id/toggle-active', verifyRoles(['ADMIN']), PlantillaController.toggleActive);

module.exports = router;
