const supabase = require('../lib/db');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            // Obtener todos los pedidos con JOINs
            const { data: pedidos, error } = await supabase
                .from('pedidos')
                .select(`
                    id_pedido,
                    fecha_pedido,
                    direccion,
                    total,
                    metodo_pago,
                    usuario:usuarios!pedidos_id_usuario_fkey (nombre, correo, telefono),
                    repartidor:usuarios!pedidos_id_repartidor_fkey (nombre),
                    estado:estado_pedido!pedidos_id_estado_fkey (nombre_estado)
                `)
                .order('fecha_pedido', { ascending: false });

            if (error) throw error;

            // Formatear para que coincida con la respuesta original del backend
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

        if (req.method === 'POST') {
            const { id_usuario, direccion, metodo_pago, total, items } = req.body;

            if (!items || items.length === 0) {
                return res.status(400).json({ error: 'Carrito vacío' });
            }

            // Crear el pedido
            const { data: pedidoData, error: pedidoError } = await supabase
                .from('pedidos')
                .insert([{ id_usuario, direccion, metodo_pago, total, id_estado: 1 }])
                .select('id_pedido')
                .single();

            if (pedidoError) throw pedidoError;

            const id_pedido = pedidoData.id_pedido;

            // Agregar detalles
            const detalles = items.map(item => ({
                id_pedido,
                id_producto: item.id_producto,
                cantidad: item.cantidad
            }));

            const { error: detalleError } = await supabase
                .from('detalle_pedido')
                .insert(detalles);

            if (detalleError) throw detalleError;

            // Crear pago
            const { error: pagoError } = await supabase
                .from('pagos')
                .insert([{ id_pedido, metodo_pago, monto: total }]);

            if (pagoError) throw pagoError;

            return res.status(201).json({ message: 'Pedido creado', id_pedido });
        }

        return res.status(405).json({ error: 'Método no permitido' });
    } catch (error) {
        console.error('❌ Error en pedidos:', error.message);
        res.status(500).json({ error: 'Error: ' + error.message });
    }
};
