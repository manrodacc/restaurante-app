const supabase = require('../../_lib/db');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

    const { id_pedido } = req.query;

    console.log(`📦 [GET] /api/pedidos/${id_pedido}`);

    try {
        // Obtener pedido con JOINs
        const { data: pedidos, error } = await supabase
            .from('pedidos')
            .select(`
                *,
                usuario:usuarios!pedidos_id_usuario_fkey (nombre),
                repartidor:usuarios!pedidos_id_repartidor_fkey (nombre, lat, lng),
                estado:estado_pedido!pedidos_id_estado_fkey (nombre_estado)
            `)
            .eq('id_pedido', id_pedido)
            .limit(1);

        if (error) throw error;

        const pedido = pedidos && pedidos[0];
        if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

        // Obtener detalles
        const { data: detalles, error: detError } = await supabase
            .from('detalle_pedido')
            .select(`
                cantidad,
                id_producto,
                producto:productos (nombre, precio)
            `)
            .eq('id_pedido', id_pedido);

        if (detError) throw detError;

        const formatted = {
            ...pedido,
            cliente_nombre: pedido.usuario?.nombre,
            repartidor_nombre: pedido.repartidor?.nombre || null,
            rep_lat: pedido.repartidor?.lat || null,
            rep_lng: pedido.repartidor?.lng || null,
            nombre_estado: pedido.estado?.nombre_estado,
            detalles: (detalles || []).map(d => ({
                cantidad: d.cantidad,
                id_producto: d.id_producto,
                nombre: d.producto?.nombre,
                precio: d.producto?.precio,
                subtotal: d.cantidad * (d.producto?.precio || 0)
            }))
        };

        // Limpiar campos de join
        delete formatted.usuario;
        delete formatted.repartidor;
        delete formatted.estado;

        res.json(formatted);
    } catch (error) {
        console.error('❌ Error en getPedidoById:', error.message);
        res.status(500).json({ error: error.message });
    }
};
