const supabase = require('../_lib/db');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const { id } = req.query;
            
            if (id) {
                const { data: productos, error } = await supabase
                    .from('productos')
                    .select('*')
                    .eq('id_producto', id)
                    .limit(1);

                if (error) throw error;
                const producto = productos && productos[0];
                if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
                return res.json(producto);
            }

            // Traer todos los productos que NO estén eliminados (estado != 0)
            const { data: productos, error } = await supabase
                .from('productos')
                .select('*')
                .neq('estado', 0)
                .order('id_producto', { ascending: true });

            if (error) throw error;
            return res.json(productos || []);
        }

        if (req.method === 'POST') {
            const { nombre, descripcion, precio, imagen } = req.body;

            if (!nombre || !precio) {
                return res.status(400).json({ error: 'Nombre y precio son requeridos' });
            }

            const { data, error } = await supabase
                .from('productos')
                .insert([{ nombre, descripcion, precio: parseFloat(precio), imagen: imagen || null, estado: 1 }])
                .select();

            if (error) {
                console.error('❌ Error al crear producto:', error);
                throw error;
            }

            return res.status(201).json({ message: 'Producto creado', data });
        }
        if (req.method === 'PUT') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'ID requerido' });
            
            const { nombre, descripcion, precio, imagen } = req.body;
            const { data, error } = await supabase
                .from('productos')
                .update({ nombre, descripcion, precio: parseFloat(precio), imagen })
                .eq('id_producto', id)
                .select();

            if (error) throw error;
            return res.json({ message: 'Producto actualizado', data });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'ID requerido' });

            const { data, error } = await supabase
                .from('productos')
                .update({ estado: 0 })
                .eq('id_producto', id)
                .select();

            if (error) throw error;
            return res.json({ message: 'Producto eliminado' });
        }
        return res.status(405).json({ error: 'Método no permitido' });
    } catch (error) {
        console.error('❌ Error en /api/productos:', error);
        res.status(500).json({ error: error.message });
    }
};
