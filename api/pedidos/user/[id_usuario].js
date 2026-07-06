const supabase = require('../../_lib/db');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

    const { id_usuario } = req.query;

    try {
        const { data: pedidos, error } = await supabase
            .from('pedidos')
            .select(`
                *,
                estado:estado_pedido!pedidos_id_estado_fkey (nombre_estado),
                usuario:usuarios!pedidos_id_usuario_fkey (nombre, lat, lng),
                repartidor:usuarios!pedidos_id_repartidor_fkey (nombre, lat, lng)
            `)
            .eq('id_usuario', id_usuario)
            .order('fecha_pedido', { ascending: false });

        if (error) throw error;

        const formatted = (pedidos || []).map(p => ({
            ...p,
            nombre_estado: p.estado?.nombre_estado,
            cliente_nombre: p.usuario?.nombre || null,
            cliente_lat: p.usuario?.lat || null,
            cliente_lng: p.usuario?.lng || null,
            repartidor_nombre: p.repartidor?.nombre || null,
            rep_lat: p.repartidor?.lat || null,
            rep_lng: p.repartidor?.lng || null
        }));

        // Limpiar campos de join
        formatted.forEach(p => { 
            delete p.estado; 
            delete p.repartidor; 
            delete p.usuario; 
        });

        res.json(formatted);
    } catch (error) {
        console.error('❌ Error en getUserPedidos:', error.message);
        res.status(500).json({ error: error.message });
    }
};
