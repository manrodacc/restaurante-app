const supabase = require('../../_lib/db');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id_producto } = req.query;

    if (!id_producto) {
        return res.status(400).json({ error: 'ID de producto requerido' });
    }

    console.log(`📦 [${req.method}] /api/productos/${id_producto}`);

    try {
        if (req.method === 'GET') {
            const { data: productos, error } = await supabase
                .from('productos')
                .select('*')
                .eq('id_producto', id_producto)
                .limit(1);

            if (error) {
                console.error('❌ Error GET producto:', error);
                throw error;
            }

            const producto = productos && productos[0];
            if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

            return res.json(producto);
        }

        if (req.method === 'PUT') {
            const { nombre, descripcion, precio, imagen } = req.body;

            console.log(`✏️ Actualizando producto ${id_producto}:`, { nombre, precio });

            const { data, error } = await supabase
                .from('productos')
                .update({ nombre, descripcion, precio: parseFloat(precio), imagen })
                .eq('id_producto', id_producto)
                .select();

            if (error) {
                console.error('❌ Error PUT producto:', error);
                throw error;
            }

            console.log('✅ Producto actualizado:', data);
            return res.json({ message: 'Producto actualizado', data });
        }

        if (req.method === 'DELETE') {
            console.log(`🗑️ Eliminando producto ${id_producto}`);

            const { data, error } = await supabase
                .from('productos')
                .update({ estado: 0 })
                .eq('id_producto', id_producto)
                .select();

            if (error) {
                console.error('❌ Error DELETE producto:', error);
                throw error;
            }

            console.log('✅ Producto eliminado (soft):', data);
            return res.json({ message: 'Producto eliminado' });
        }

        return res.status(405).json({ error: 'Método no permitido' });
    } catch (error) {
        console.error(`❌ Error en /api/productos/${id_producto}:`, error.message);
        res.status(500).json({ error: error.message });
    }
};
