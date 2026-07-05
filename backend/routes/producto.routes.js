const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');

router.get('/', productoController.getAll);
router.get('/:id_producto', productoController.getOne);
router.post('/', productoController.create);
router.put('/:id_producto', productoController.update);
router.delete('/:id_producto', productoController.delete);

module.exports = router;
