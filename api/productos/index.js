const supabase = require('../_lib/db');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            // Traer todos los productos que NO estén eliminados (estado != 0)
            // Se excluye estado=0 para incluir también productos con estado=1 o NULL
            const { data: productos, error } = await supabase
                .from('productos')
                .select('*')
                .neq('estado', 0)
                .order('id_producto', { ascending: true });

            if (error) {
                console.error('❌ Error al obtener productos:', error);
                throw error;
            }

            console.log(`✅ Productos encontrados: ${productos ? productos.length : 0}`);
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

        return res.status(405).json({ error: 'Método no permitido' });
    } catch (error) {
        console.error('❌ Error en /api/productos:', error);
        res.status(500).json({ error: error.message });
    }
};
