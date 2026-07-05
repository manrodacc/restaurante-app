const Pedido = require('../models/pedido.model');

exports.createPedido = async (req, res) => {
    try {
        const { id_usuario, direccion, metodo_pago, total, items } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ error: 'Carrito vacío' });

        const id_pedido = await Pedido.create(id_usuario, direccion, metodo_pago, total);
        
        for (let item of items) {
            await Pedido.addDetail(id_pedido, item.id_producto, item.cantidad);
        }

        await Pedido.createPayment(id_pedido, metodo_pago, total);

        res.status(201).json({ message: 'Pedido creado', id_pedido });
    } catch (error) {
        console.error("❌ Error en createPedido:", error.message);
        res.status(500).json({ error: 'Error al crear el pedido: ' + error.message });
    }
};

exports.getAllPedidos = async (req, res) => {
    try {
        // Intentamos ejecutar la consulta
        const pedidos = await Pedido.getAll();
        res.json(pedidos);
    } catch (error) {
        // Aquí atrapamos el error exacto de MySQL
        console.error("❌ ERROR GRAVE EN EL BACKEND (getAllPedidos):", error.message);
        res.status(500).json({ 
            error: 'Error interno al obtener pedidos', 
            detalle: error.message // Esto es lo que verás en la consola del navegador o del backend
        });
    }
};

exports.getPedidoById = async (req, res) => {
    try {
        const pedido = await Pedido.getById(req.params.id_pedido);
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
        const detalles = await Pedido.getDetails(req.params.id_pedido);
        res.json({ ...pedido, detalles });
    } catch (error) {
        console.error("❌ Error en getPedidoById:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getUserPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.getByUserId(req.params.id_usuario);
        res.json(pedidos);
    } catch (error) {
        console.error("❌ Error en getUserPedidos:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.updateEstado = async (req, res) => {
    try {
        const { id_estado } = req.body;
        await Pedido.updateState(req.params.id_pedido, id_estado);
        res.json({ message: 'Estado actualizado' });
    } catch (error) {
        console.error("❌ Error en updateEstado:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.asignarRepartidor = async (req, res) => {
    try {
        const { id_repartidor } = req.body;
        await Pedido.assignRepartidor(req.params.id_pedido, id_repartidor);
        res.json({ message: 'Repartidor asignado' });
    } catch (error) {
        console.error("❌ Error en asignarRepartidor:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getRepartidorPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.getByRepartidor(req.params.id_repartidor);
        res.json(pedidos);
    } catch (error) {
        console.error("❌ Error en getRepartidorPedidos:", error.message);
        res.status(500).json({ error: error.message });
    }
};
