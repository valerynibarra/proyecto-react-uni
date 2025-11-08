const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Debug: log de todas las peticiones entrantes (muestra método y URL)
app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
});

// Health check simple para comprobar que el servidor en ejecución es el correcto
app.get('/health', (req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
});

// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'proyecto_uni'
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('✅ Conectado a MySQL');
    }
});

// Ruta para validar usuario
app.post('/login', (req, res) => {
    const { correo, contraseña } = req.body;

    const query = 'SELECT * FROM usuarios WHERE correo = ? AND contraseña = ?';
    db.query(query, [correo, contraseña], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error en el servidor' });
        } else if (result.length > 0) {
            const user = result[0];
            res.json({
                mensaje: 'Inicio de sesión exitoso',
                rol: user.rol,
                nombre: user.nombre
            });
        } else {
            res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }
    });
});

// ----------------- NUEVAS RUTAS -----------------
app.get('/counts', async (req, res) => {
    try {
        const promiseDb = db.promise();
        const [totalRows] = await promiseDb.query('SELECT COUNT(*) AS total FROM usuarios');
        const [estRows] = await promiseDb.query("SELECT COUNT(*) AS count FROM usuarios WHERE rol = 'Estudiante'");
        const [profRows] = await promiseDb.query("SELECT COUNT(*) AS count FROM usuarios WHERE rol = 'Profesor'");
        const [admRows] = await promiseDb.query("SELECT COUNT(*) AS count FROM usuarios WHERE rol = 'Administrador'");

        res.json({
            totalUsers: totalRows[0]?.total ?? 0,
            estudiantes: estRows[0]?.count ?? 0,
            profesores: profRows[0]?.count ?? 0,
            administradores: admRows[0]?.count ?? 0
        });
    } catch (error) {
        console.error('Error al obtener counts:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

/*Lista de Usuarios*/
app.get('/usuarios', async (req, res) => {
    try {
        const { q = '', role = '' } = req.query;
        const promiseDb = db.promise();

        let sql = 'SELECT id, nombre, correo, rol FROM usuarios';
        const params = [];

        if (role && role !== 'Todos') {
            sql += ' WHERE rol = ?';
            params.push(role);
            if (q) {
                sql += ' AND (nombre LIKE ? OR correo LIKE ?)';
                params.push(`%${q}%`, `%${q}%`);
            }
        } else if (q) {
            sql += ' WHERE (nombre LIKE ? OR correo LIKE ?)';
            params.push(`%${q}%`, `%${q}%`);
        }

        const [rows] = await promiseDb.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
