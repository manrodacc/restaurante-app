const db = require('../config/db');

const Producto = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM productos WHERE estado = 1');
        return rows;
    },
    getById: async (id_producto) => {
        const [rows] = await db.query('SELECT * FROM productos WHERE id_producto = ?', [id_producto]);
        return rows[0];
    },
    create: async (data) => {
        const { nombre, descripcion, precio, imagen } = data;
        const [result] = await db.query(
            'INSERT INTO productos (nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?)',
            [nombre, descripcion, precio, imagen || null]
        );
        return result;
    },
    update: async (id_producto, data) => {
        const { nombre, descripcion, precio, imagen } = data;
        await db.query(
            'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, imagen = ? WHERE id_producto = ?',
            [nombre, descripcion, precio, imagen, id_producto]
        );
    },
    delete: async (id_producto) => {
        await db.query('UPDATE productos SET estado = 0 WHERE id_producto = ?', [id_producto]);
    }
};

module.exports = Producto;
