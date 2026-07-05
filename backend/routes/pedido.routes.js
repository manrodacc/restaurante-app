const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');

router.post('/', pedidoController.createPedido);
router.get('/', pedidoController.getAllPedidos);
router.get('/:id_pedido', pedidoController.getPedidoById);
router.get('/user/:id_usuario', pedidoController.getUserPedidos);
router.put('/:id_pedido/estado', pedidoController.updateEstado);
router.put('/:id_pedido/asignar', pedidoController.asignarRepartidor);

module.exports = router;
