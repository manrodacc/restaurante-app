const supabase = require('../../lib/db');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'PUT') return res.status(405).json({ error: 'Método no permitido' });

    const { id_pedido } = req.query;

    try {
        const { id_repartidor } = req.body;

        const { error } = await supabase
            .from('pedidos')
            .update({ id_repartidor, id_estado: 4 })
            .eq('id_pedido', id_pedido);

        if (error) throw error;

        res.json({ message: 'Repartidor asignado' });
    } catch (error) {
        console.error('❌ Error en asignarRepartidor:', error.message);
        res.status(500).json({ error: error.message });
    }
};
