const supabase = require('../lib/db');
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    try {
        const { nombre, correo, password, telefono, rol } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from('usuarios')
            .insert([{ nombre, correo, password: hashedPassword, telefono, rol: rol || 'cliente' }]);

        if (error) throw error;

        res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
