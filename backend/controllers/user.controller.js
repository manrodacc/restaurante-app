const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { nombre, correo, password, telefono, rol } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ nombre, correo, password: hashedPassword, telefono, rol });
        res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const user = await User.findByEmail(correo);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = jwt.sign({ id_usuario: user.id_usuario, rol: user.rol }, process.env.JWT_SECRET || 'secreto', { expiresIn: '1d' });
        res.json({ token, user: { id_usuario: user.id_usuario, nombre: user.nombre, rol: user.rol } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const { lat, lng } = req.body;
        await User.updateLocation(id_usuario, lat, lng);
        res.json({ message: 'Ubicación actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRepartidores = async (req, res) => {
    try {
        const repartidores = await User.getAllRepartidores();
        res.json(repartidores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
