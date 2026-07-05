const supabase = require('../../lib/db');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'PUT') return res.status(405).json({ error: 'Método no permitido' });

    try {
        const { id_usuario } = req.query;
        const { lat, lng } = req.body;

        const { error } = await supabase
            .from('usuarios')
            .update({ lat, lng })
            .eq('id_usuario', id_usuario);

        if (error) throw error;

        res.json({ message: 'Ubicación actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
