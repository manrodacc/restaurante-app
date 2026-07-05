const supabase = require('../lib/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    try {
        const { correo, password } = req.body;

        const { data: users, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('correo', correo)
            .limit(1);

        if (error) throw error;

        const user = users && users[0];
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = jwt.sign(
            { id_usuario: user.id_usuario, rol: user.rol },
            process.env.JWT_SECRET || 'secreto',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id_usuario: user.id_usuario, nombre: user.nombre, rol: user.rol }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
