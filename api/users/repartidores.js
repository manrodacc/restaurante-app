const supabase = require('../_lib/db');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

    try {
        const { data: repartidores, error } = await supabase
            .from('usuarios')
            .select('id_usuario, nombre, lat, lng')
            .eq('rol', 'repartidor')
            .eq('estado', 1);

        if (error) throw error;

        res.json(repartidores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
