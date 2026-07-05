const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/location/:id_usuario', userController.updateLocation);
router.get('/repartidores', userController.getRepartidores);

module.exports = router;
