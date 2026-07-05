const db = require('../config/db');

const User = {
    create: async (userData) => {
        const { nombre, correo, password, telefono, rol, lat, lng } = userData;
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, correo, password, telefono, rol, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, correo, password, telefono, rol || 'cliente', lat || null, lng || null]
        );
        return result;
    },
    findByEmail: async (correo) => {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        return rows[0];
    },
    findById: async (id_usuario) => {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id_usuario]);
        return rows[0];
    },
    updateLocation: async (id_usuario, lat, lng) => {
        await db.query('UPDATE usuarios SET lat = ?, lng = ? WHERE id_usuario = ?', [lat, lng, id_usuario]);
    },
    getAllRepartidores: async () => {
        const [rows] = await db.query('SELECT id_usuario, nombre, lat, lng FROM usuarios WHERE rol = "repartidor" AND estado = 1');
        return rows;
    }
};

module.exports = User;
