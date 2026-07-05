const supabase = require('../../_lib/db');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

    const { id_repartidor } = req.query;

    try {
        const { data: pedidos, error } = await supabase
            .from('pedidos')
            .select(`
                *,
                usuario:usuarios!pedidos_id_usuario_fkey (nombre),
                estado:estado_pedido!pedidos_id_estado_fkey (nombre_estado)
            `)
            .eq('id_repartidor', id_repartidor)
            .in('id_estado', [4, 5, 6])
            .order('fecha_pedido', { ascending: false });

        if (error) throw error;

        const formatted = (pedidos || []).map(p => ({
            ...p,
            cliente_nombre: p.usuario?.nombre,
            nombre_estado: p.estado?.nombre_estado
        }));

        formatted.forEach(p => { delete p.usuario; delete p.estado; });

        res.json(formatted);
    } catch (error) {
        console.error('❌ Error en getRepartidorPedidos:', error.message);
        res.status(500).json({ error: error.message });
    }
};
