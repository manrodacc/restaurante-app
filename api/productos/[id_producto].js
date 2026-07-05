const supabase = require('../lib/db');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id_producto } = req.query;

    try {
        if (req.method === 'GET') {
            const { data: productos, error } = await supabase
                .from('productos')
                .select('*')
                .eq('id_producto', id_producto)
                .limit(1);

            if (error) throw error;

            const producto = productos && productos[0];
            if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

            return res.json(producto);
        }

        if (req.method === 'PUT') {
            const { nombre, descripcion, precio, imagen } = req.body;

            const { error } = await supabase
                .from('productos')
                .update({ nombre, descripcion, precio, imagen })
                .eq('id_producto', id_producto);

            if (error) throw error;
            return res.json({ message: 'Producto actualizado' });
        }

        if (req.method === 'DELETE') {
            // Soft delete (estado = 0)
            const { error } = await supabase
                .from('productos')
                .update({ estado: 0 })
                .eq('id_producto', id_producto);

            if (error) throw error;
            return res.json({ message: 'Producto eliminado' });
        }

        return res.status(405).json({ error: 'Método no permitido' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
