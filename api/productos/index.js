const supabase = require('../lib/db');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const { data: productos, error } = await supabase
                .from('productos')
                .select('*')
                .eq('estado', 1);

            if (error) throw error;
            return res.json(productos);
        }

        if (req.method === 'POST') {
            const { nombre, descripcion, precio, imagen } = req.body;

            const { error } = await supabase
                .from('productos')
                .insert([{ nombre, descripcion, precio, imagen: imagen || null }]);

            if (error) throw error;
            return res.status(201).json({ message: 'Producto creado' });
        }

        return res.status(405).json({ error: 'Método no permitido' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
