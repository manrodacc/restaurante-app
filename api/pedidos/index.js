const supabase = require('../_lib/db');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id, action } = req.query;

    try {
        // ─── GET ───────────────────────────────────────────
        if (req.method === 'GET') {

            // GET /api/pedidos?id=5  →  detalle de un pedido
            if (id) {
                const { data: pedidos, error } = await supabase
                    .from('pedidos')
                    .select(`
                        *,
                        usuario:usuarios!pedidos_id_usuario_fkey (nombre),
                        repartidor:usuarios!pedidos_id_repartidor_fkey (nombre, lat, lng),
                        estado:estado_pedido!pedidos_id_estado_fkey (nombre_estado)
                    `)
                    .eq('id_pedido', id)
                    .limit(1);

                if (error) throw error;
                const pedido = pedidos && pedidos[0];
                if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

                const { data: detalles, error: detError } = await supabase
                    .from('detalle_pedido')
                    .select(`cantidad, id_producto, producto:productos (nombre, precio)`)
                    .eq('id_pedido', id);

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
                delete formatted.usuario;
                delete formatted.repartidor;
                delete formatted.estado;

                return res.json(formatted);
            }

            // GET /api/pedidos  →  listar todos
            const { data: pedidos, error } = await supabase
                .from('pedidos')
                .select(`
                    id_pedido, fecha_pedido, direccion, total, metodo_pago,
                    usuario:usuarios!pedidos_id_usuario_fkey (nombre, correo, telefono),
                    repartidor:usuarios!pedidos_id_repartidor_fkey (nombre),
                    estado:estado_pedido!pedidos_id_estado_fkey (nombre_estado)
                `)
                .order('fecha_pedido', { ascending: false });

            if (error) throw error;

            const formatted = (pedidos || []).map(p => ({
                id_pedido: p.id_pedido,
                fecha_pedido: p.fecha_pedido,
                direccion: p.direccion,
                total: p.total,
                metodo_pago: p.metodo_pago,
                cliente_nombre: p.usuario?.nombre,
                cliente_correo: p.usuario?.correo,
                cliente_telefono: p.usuario?.telefono,
                repartidor_nombre: p.repartidor?.nombre || null,
                nombre_estado: p.estado?.nombre_estado
            }));

            return res.json(formatted);
        }

        // ─── POST /api/pedidos  →  crear pedido ───────────
        if (req.method === 'POST') {
            const { id_usuario, direccion, metodo_pago, total, items } = req.body;

            if (!items || items.length === 0) {
                return res.status(400).json({ error: 'Carrito vacío' });
            }

            const { data: pedidoData, error: pedidoError } = await supabase
                .from('pedidos')
                .insert([{ id_usuario, direccion, metodo_pago, total, id_estado: 1 }])
                .select('id_pedido')
                .single();

            if (pedidoError) throw pedidoError;

            const id_pedido = pedidoData.id_pedido;

            const detalles = items.map(item => ({
                id_pedido,
                id_producto: item.id_producto,
                cantidad: item.cantidad
            }));

            const { error: detalleError } = await supabase
                .from('detalle_pedido')
                .insert(detalles);

            if (detalleError) throw detalleError;

            const { error: pagoError } = await supabase
                .from('pagos')
                .insert([{ id_pedido, metodo_pago, monto: total }]);

            if (pagoError) throw pagoError;

            return res.status(201).json({ message: 'Pedido creado', id_pedido });
        }

        // ─── PUT /api/pedidos?id=5&action=estado ──────────
        // ─── PUT /api/pedidos?id=5&action=asignar ─────────
        if (req.method === 'PUT') {
            if (!id) return res.status(400).json({ error: 'Falta el parámetro id' });

            if (action === 'estado') {
                const { id_estado } = req.body;
                const { error } = await supabase
                    .from('pedidos')
                    .update({ id_estado })
                    .eq('id_pedido', id);

                if (error) throw error;
                return res.json({ message: 'Estado actualizado' });
            }

            if (action === 'asignar') {
                const { id_repartidor } = req.body;
                const { error } = await supabase
                    .from('pedidos')
                    .update({ id_repartidor, id_estado: 4 })
                    .eq('id_pedido', id);

                if (error) throw error;
                return res.json({ message: 'Repartidor asignado' });
            }

            return res.status(400).json({ error: 'Acción no válida. Usa ?action=estado o ?action=asignar' });
        }

        return res.status(405).json({ error: 'Método no permitido' });

    } catch (error) {
        console.error('❌ Error en pedidos:', error.message);
        res.status(500).json({ error: error.message });
    }
};
