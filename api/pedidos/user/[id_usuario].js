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
                repartidor:usuarios!pedidos_id_repartidor_fkey (nombre)
            `)
            .eq('id_usuario', id_usuario)
            .order('fecha_pedido', { ascending: false });

        if (error) throw error;

        const formatted = (pedidos || []).map(p => ({
            ...p,
            nombre_estado: p.estado?.nombre_estado,
            repartidor_nombre: p.repartidor?.nombre || null
        }));

        // Limpiar campos de join
        formatted.forEach(p => { delete p.estado; delete p.repartidor; });

        res.json(formatted);
    } catch (error) {
        console.error('❌ Error en getUserPedidos:', error.message);
        res.status(500).json({ error: error.message });
    }
};
