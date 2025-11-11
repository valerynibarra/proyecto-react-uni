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
    database: 'universidad_somospensadores'
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

    const query = 'SELECT * FROM usuarios WHERE correo = ?';
    db.query(query, [correo], async (err, result) => {
        if (err) {
            console.error('Error en la base de datos:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (result.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const user = result[0];

        try {
            const coincide = await bcrypt.compare(contraseña, user.contraseña);

            if (coincide) {
                res.json({
                    mensaje: 'Inicio de sesión exitoso',
                    rol: user.rol,
                    nombre: user.nombre
                });
            } else {
                res.status(401).json({ error: 'Correo o contraseña incorrectos' });
            }
        } catch (error) {
            console.error('Error al comparar contraseñas:', error);
            res.status(500).json({ error: 'Error en el servidor' });
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

        let sql = `
            SELECT 
                id, 
                nombre, 
                correo, 
                documento, 
                programa, 
                DATE_FORMAT(fecha_registro, '%Y-%m-%d') AS fecha_registro, 
                rol
            FROM usuarios
        `;
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

/* Crear nuevo usuario */
const bcrypt = require('bcrypt');

app.post('/usuarios', async (req, res) => {
    try {
        const { nombre, documento, correo, programa, rol } = req.body;
        const promiseDb = db.promise();

        // Validaciones básicas
        if (!nombre || !documento || !correo || !rol) {
            return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse.' });
        }

        if (!/^\d{1,10}$/.test(documento)) {
            return res.status(400).json({ error: 'El documento debe ser numérico y máximo de 10 dígitos.' });
        }

        if (!correo.endsWith('@somospensadores.edu.co')) {
            return res.status(400).json({ error: 'El correo debe ser institucional (@somospensadores.edu.co).' });
        }

        // Validar correo existente
        const [existing] = await promiseDb.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado.' });
        }

        // Generar contraseña: inicial del nombre + mitad del documento + inicial del rol
        const nombreInicial = nombre.trim().charAt(0).toLowerCase();
        const docHalf = documento.slice(0, Math.ceil(documento.length / 2));
        const rolInicial = rol.trim().charAt(0).toLowerCase();
        const contraseña = nombreInicial + docHalf + rolInicial;

        // Cifrar contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Insertar en base de datos
        const sql = `
            INSERT INTO usuarios (nombre, documento, correo, programa, rol, contraseña, fecha_registro)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        await promiseDb.query(sql, [nombre, documento, correo, programa || null, rol, hashedPassword]);

        res.json({ mensaje: 'Usuario creado exitosamente', contraseñaTemporal: contraseña });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

/* Eliminar usuario */
app.delete('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const promiseDb = db.promise();

        const [result] = await promiseDb.query('DELETE FROM usuarios WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
