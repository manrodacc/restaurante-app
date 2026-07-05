const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');

router.get('/pedidos/:id_repartidor', pedidoController.getRepartidorPedidos);

module.exports = router;
