const db = require('../config/db');

const Pedido = {
    create: async (id_usuario, direccion, metodo_pago, total) => {
        const [result] = await db.query(
            'INSERT INTO pedidos (id_usuario, direccion, metodo_pago, total, id_estado) VALUES (?, ?, ?, ?, 1)',
            [id_usuario, direccion, metodo_pago, total]
        );
        return result.insertId;
    },
    addDetail: async (id_pedido, id_producto, cantidad) => {
        await db.query(
            'INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad) VALUES (?, ?, ?)',
            [id_pedido, id_producto, cantidad]
        );
    },
    createPayment: async (id_pedido, metodo_pago, monto) => {
        await db.query(
            'INSERT INTO pagos (id_pedido, metodo_pago, monto) VALUES (?, ?, ?)',
            [id_pedido, metodo_pago, monto]
        );
    },
    
    // --- FUNCIÓN CORREGIDA ---
    getAll: async () => {
        try {
            const query = `
                SELECT p.id_pedido, p.fecha_pedido, p.direccion, p.total, p.metodo_pago,
                       u.nombre AS cliente_nombre, u.correo AS cliente_correo, u.telefono AS cliente_telefono,
                       r.nombre AS repartidor_nombre,
                       e.nombre_estado
                FROM pedidos p
                JOIN usuarios u ON p.id_usuario = u.id_usuario
                JOIN estados_pedido e ON p.id_estado = e.id_estado
                LEFT JOIN usuarios r ON p.id_repartidor = r.id_usuario
                ORDER BY p.fecha_pedido DESC
            `;
            
            console.log("📡 Ejecutando consulta SQL en el backend...");
            const [rows] = await db.query(query);
            console.log("✅ Consulta exitosa. Pedidos encontrados:", rows.length);
            return rows;
            
        } catch (error) {
            console.error("❌ ERROR CRÍTICO EN LA CONSULTA SQL DE PEDIDOS:");
            console.error("Mensaje:", error.message);
            console.error("Código SQL:", error.sql);
            console.error("Código de error:", error.errno);
            throw error;
        }
    },

    getById: async (id_pedido) => {
        const [rows] = await db.query(`
            SELECT p.*, u.nombre AS cliente_nombre, u.telefono AS cliente_telefono, u.lat AS cliente_lat, u.lng AS cliente_lng,
                   e.nombre_estado,
                   r.nombre AS repartidor_nombre, r.lat AS rep_lat, r.lng AS rep_lng
            FROM pedidos p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            JOIN estados_pedido e ON p.id_estado = e.id_estado
            LEFT JOIN usuarios r ON p.id_repartidor = r.id_usuario
            WHERE p.id_pedido = ?
        `, [id_pedido]);
        return rows[0];
    },
    getDetails: async (id_pedido) => {
        const [rows] = await db.query(`
            SELECT d.cantidad, d.id_producto, pr.nombre, pr.precio, (d.cantidad * pr.precio) as subtotal
            FROM detalle_pedido d
            JOIN productos pr ON d.id_producto = pr.id_producto
            WHERE d.id_pedido = ?
        `, [id_pedido]);
        return rows;
    },
    getByUserId: async (id_usuario) => {
        const [rows] = await db.query(`
            SELECT p.*, e.nombre_estado,
                   u.nombre AS cliente_nombre, u.lat AS cliente_lat, u.lng AS cliente_lng,
                   r.nombre AS repartidor_nombre, r.lat AS rep_lat, r.lng AS rep_lng
            FROM pedidos p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            JOIN estados_pedido e ON p.id_estado = e.id_estado
            LEFT JOIN usuarios r ON p.id_repartidor = r.id_usuario
            WHERE p.id_usuario = ?
            ORDER BY p.fecha_pedido DESC
        `, [id_usuario]);
        return rows;
    },
    updateState: async (id_pedido, id_estado) => {
        await db.query('UPDATE pedidos SET id_estado = ? WHERE id_pedido = ?', [id_estado, id_pedido]);
    },
    assignRepartidor: async (id_pedido, id_repartidor) => {
        await db.query('UPDATE pedidos SET id_repartidor = ?, id_estado = 4 WHERE id_pedido = ?', [id_repartidor, id_pedido]);
    },
    getByRepartidor: async (id_repartidor) => {
        const [rows] = await db.query(`
            SELECT p.*, u.nombre AS cliente_nombre, u.telefono AS cliente_telefono, u.lat AS cliente_lat, u.lng AS cliente_lng, e.nombre_estado
            FROM pedidos p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            JOIN estados_pedido e ON p.id_estado = e.id_estado
            WHERE p.id_repartidor = ? AND p.id_estado IN (4, 5, 6)
            ORDER BY p.fecha_pedido DESC
        `, [id_repartidor]);
        return rows;
    }
};

module.exports = Pedido;
