const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Pon tu contraseña aquí si tienes
    database: 'restaurante', // <--- CAMBIADO DE 'restaurante_db' a 'restaurante'
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();
module.exports = promisePool;
