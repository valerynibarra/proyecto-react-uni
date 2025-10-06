const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',         // ⚠️ cambia si tienes otro usuario
    password: '',         // ⚠️ agrega tu contraseña si tienes
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

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
