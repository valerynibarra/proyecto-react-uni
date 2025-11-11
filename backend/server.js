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

        let sql = `SELECT 
            u.id, u.nombre, u.correo, u.rol, u.telefono, u.direccion, u.programa,
            (SELECT COUNT(*) FROM inscripciones i WHERE i.estudiante_id = u.id) AS inscripciones_ref,
            (SELECT COUNT(*) FROM cursos c WHERE c.profesor_id = u.id) AS cursos_ref
        FROM usuarios u`;
        const params = [];

        if (role && role !== 'Todos') {
            sql += ' WHERE u.rol = ?';
            params.push(role);
            if (q) {
                sql += ' AND (u.nombre LIKE ? OR u.correo LIKE ?)';
                params.push(`%${q}%`, `%${q}%`);
            }
        } else if (q) {
            sql += ' WHERE (u.nombre LIKE ? OR u.correo LIKE ?)';
            params.push(`%${q}%`, `%${q}%`);
        }

        sql += ' ORDER BY u.nombre';

        const [rows] = await promiseDb.query(sql, params);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Crear usuario (admin)
app.post('/usuarios', async (req, res) => {
    try {
        const { nombre, correo, contraseña, rol, telefono, direccion, programa } = req.body;
        if (!nombre || !correo || !contraseña || !rol || !telefono || !direccion || !programa) {
            return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, correo, contraseña, rol, teléfono, dirección y programa' });
        }

        const allowedRoles = new Set(['Estudiante', 'Profesor', 'Administrador', 'Director de Programa Académico']);
        if (!allowedRoles.has(rol)) {
            return res.status(400).json({ error: 'Rol no válido' });
        }

        // Validar dominio del correo
        const correoOk = /^[^@\s]+@somospensadores\.edu\.co$/i.test(correo);
        if (!correoOk) {
            return res.status(400).json({ error: 'El correo debe terminar en @somospensadores.edu.co' });
        }

        // Validar teléfono de 10 dígitos (obligatorio)
        if (!telefono || !/^\d{10}$/.test(String(telefono))) {
            return res.status(400).json({ error: 'El teléfono debe tener 10 dígitos' });
        }

        const promiseDb = db.promise();

        // Evitar correos duplicados
        const [exists] = await promiseDb.query('SELECT id FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
        if (exists.length) {
            return res.status(409).json({ error: 'El correo ya está registrado' });
        }

        const [result] = await promiseDb.query(
            'INSERT INTO usuarios (nombre, correo, `contraseña`, rol, telefono, direccion, programa) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, correo, contraseña, rol, telefono, direccion, programa]
        );

        const newId = result.insertId;
        const [rows] = await promiseDb.query('SELECT id, nombre, correo, rol, telefono, direccion, programa FROM usuarios WHERE id = ?', [newId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener un usuario por ID
app.get('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const promiseDb = db.promise();
        const [rows] = await promiseDb.query('SELECT id, nombre, correo, rol, telefono, direccion, programa, `contraseña` AS contraseña FROM usuarios WHERE id = ? LIMIT 1', [id]);
        if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Actualizar usuario por ID (campos parciales)
app.put('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, rol, telefono, direccion, programa, contraseña } = req.body;
        const promiseDb = db.promise();

        // Verificar existencia
        const [existsRows] = await promiseDb.query('SELECT id, correo FROM usuarios WHERE id = ? LIMIT 1', [id]);
        if (!existsRows.length) return res.status(404).json({ error: 'Usuario no encontrado' });

        const allowedRoles = new Set(['Estudiante', 'Profesor', 'Administrador', 'Director de Programa Académico']);
        const setParts = [];
        const params = [];

        if (nombre !== undefined) {
            if (!String(nombre).trim()) return res.status(400).json({ error: 'El nombre no puede estar vacío' });
            setParts.push('nombre = ?'); params.push(String(nombre).trim());
        }
        if (correo !== undefined) {
            const correoVal = String(correo).trim();
            const correoOk = /^[^@\s]+@somospensadores\.edu\.co$/i.test(correoVal);
            if (!correoOk) return res.status(400).json({ error: 'El correo debe terminar en @somospensadores.edu.co' });
            // Unicidad (excepto el mismo id)
            const [dupRows] = await promiseDb.query('SELECT id FROM usuarios WHERE correo = ? AND id <> ? LIMIT 1', [correoVal, id]);
            if (dupRows.length) return res.status(409).json({ error: 'El correo ya está registrado por otro usuario' });
            setParts.push('correo = ?'); params.push(correoVal);
        }
        if (rol !== undefined) {
            if (!allowedRoles.has(rol)) return res.status(400).json({ error: 'Rol no válido' });
            setParts.push('rol = ?'); params.push(rol);
        }
        if (telefono !== undefined) {
            if (telefono && !/^\d{10}$/.test(String(telefono))) return res.status(400).json({ error: 'El teléfono debe tener 10 dígitos' });
            setParts.push('telefono = ?'); params.push(telefono);
        }
        if (direccion !== undefined) {
            if (!String(direccion).trim()) return res.status(400).json({ error: 'La dirección no puede estar vacía' });
            setParts.push('direccion = ?'); params.push(String(direccion).trim());
        }
        if (programa !== undefined) {
            if (!String(programa).trim()) return res.status(400).json({ error: 'El programa no puede estar vacío' });
            setParts.push('programa = ?'); params.push(String(programa).trim());
        }
        if (contraseña !== undefined) {
            if (String(contraseña).length < 6) return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres' });
            setParts.push('`contraseña` = ?'); params.push(String(contraseña));
        }

        if (!setParts.length) return res.status(400).json({ error: 'No se enviaron campos para actualizar' });

        params.push(id);
        await promiseDb.query(`UPDATE usuarios SET ${setParts.join(', ')} WHERE id = ?`, params);

        const [updated] = await promiseDb.query('SELECT id, nombre, correo, rol, telefono, direccion, programa FROM usuarios WHERE id = ? LIMIT 1', [id]);
        res.json({ actualizado: true, usuario: updated[0] });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Eliminar usuario por ID (verifica referencias básicas)
app.delete('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const promiseDb = db.promise();
        const [userRows] = await promiseDb.query('SELECT id, rol FROM usuarios WHERE id = ? LIMIT 1', [id]);
        if (!userRows.length) return res.status(404).json({ error: 'Usuario no encontrado' });

        // Verificar referencias (estudiante en inscripciones / profesor en cursos)
        const [refIns] = await promiseDb.query('SELECT COUNT(*) AS cnt FROM inscripciones WHERE estudiante_id = ?', [id]);
        const [refCursos] = await promiseDb.query('SELECT COUNT(*) AS cnt FROM cursos WHERE profesor_id = ?', [id]);
        if (refIns[0].cnt > 0 || refCursos[0].cnt > 0) {
            return res.status(409).json({ error: 'No se puede eliminar: usuario con referencias activas', referencias: { inscripciones: refIns[0].cnt, cursos: refCursos[0].cnt } });
        }

        await promiseDb.query('DELETE FROM usuarios WHERE id = ? LIMIT 1', [id]);
        res.json({ eliminado: true, id });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// ============== ENDPOINTS PARA ADMINISTRADOR ==============

// Obtener todos los cursos (para admin)
app.get('/admin/cursos', async (req, res) => {
    try {
        const promiseDb = db.promise();
        
        const [cursosRows] = await promiseDb.query(`
            SELECT 
                c.id,
                c.codigo,
                c.nombre,
                c.programa,
                c.semestre,
                c.cupo,
                c.creditos,
                c.estado,
                u.nombre AS profesor,
                COUNT(DISTINCT i.estudiante_id) AS inscritos,
                GROUP_CONCAT(DISTINCT p.nombre ORDER BY p.fecha_inicio DESC SEPARATOR ', ') AS periodos
            FROM cursos c
            LEFT JOIN usuarios u ON c.profesor_id = u.id
            LEFT JOIN inscripciones i ON c.id = i.curso_id
            LEFT JOIN ofertas_curso o ON o.curso_id = c.id
            LEFT JOIN periodos_academicos p ON o.periodo_id = p.id
            GROUP BY c.id
            ORDER BY c.nombre
        `);
        
        res.json(cursosRows);
    } catch (error) {
        console.error('Error al obtener cursos (admin):', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener todas las inscripciones (para admin)
app.get('/admin/inscripciones', async (req, res) => {
    try {
        const promiseDb = db.promise();
        
        const [inscripcionesRows] = await promiseDb.query(`
            SELECT 
                i.id,
                i.curso_id,
                i.estudiante_id,
                i.fecha_inscripcion,
                IFNULL(i.estado,'aprobada') AS estado,
                NULL AS fecha_aprobacion,
                c.nombre AS curso_nombre,
                c.codigo AS curso_codigo,
                c.programa,
                c.semestre,
                u_est.nombre AS estudiante_nombre,
                u_est.correo AS estudiante_email,
                u_prof.nombre AS profesor_nombre,
                p.nombre AS periodo,
                o.grupo AS grupo
            FROM inscripciones i
            LEFT JOIN cursos c ON i.curso_id = c.id
            LEFT JOIN usuarios u_est ON i.estudiante_id = u_est.id
            LEFT JOIN usuarios u_prof ON c.profesor_id = u_prof.id
            LEFT JOIN ofertas_curso o ON o.curso_id = c.id
            LEFT JOIN periodos_academicos p ON o.periodo_id = p.id
            ORDER BY i.fecha_inscripcion DESC
        `);
        
        res.json(inscripcionesRows);
    } catch (error) {
        console.error('Error al obtener inscripciones (admin):', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener todas las calificaciones (para admin)
app.get('/admin/calificaciones', async (req, res) => {
    try {
        const promiseDb = db.promise();
        
        const [calificacionesRows] = await promiseDb.query(`
            SELECT 
                cal.id,
                u.nombre as estudiante,
                c.nombre as curso,
                c.codigo,
                cal.evaluacion,
                cal.calificacion,
                cal.sobre,
                ROUND((cal.calificacion / cal.sobre) * 100, 0) as porcentaje,
                CASE 
                    WHEN (cal.calificacion / cal.sobre) * 100 >= 90 THEN 'A'
                    WHEN (cal.calificacion / cal.sobre) * 100 >= 80 THEN 'B'
                    WHEN (cal.calificacion / cal.sobre) * 100 >= 70 THEN 'C'
                    ELSE 'F'
                END as letra,
                cal.fecha
            FROM calificaciones cal
            JOIN usuarios u ON cal.estudiante_id = u.id
            JOIN cursos c ON cal.curso_id = c.id
            ORDER BY cal.fecha DESC
        `);
        
        res.json(calificacionesRows);
    } catch (error) {
        console.error('Error al obtener calificaciones (admin):', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener todas las asistencias (para admin)
app.get('/admin/asistencias', async (req, res) => {
    try {
        const promiseDb = db.promise();
        const [asistenciasRows] = await promiseDb.query(`
            SELECT 
                a.id,
                u.nombre as estudiante,
                c.nombre as curso,
                c.codigo,
                a.fecha,
                a.horario,
                a.estado,
                up.nombre as profesor
            FROM asistencias a
            JOIN usuarios u ON a.estudiante_id = u.id
            JOIN cursos c ON a.curso_id = c.id
            LEFT JOIN usuarios up ON c.profesor_id = up.id
            ORDER BY a.fecha DESC
        `);
        res.json(asistenciasRows);
    } catch (error) {
        console.error('Error al obtener asistencias (admin):', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ============== ENDPOINTS PARA PROFESOR ==============

// Obtener métricas del profesor (inicio)
app.get('/profesor/metricas', async (req, res) => {
    try {
        const promiseDb = db.promise();
        
        // Contar cursos activos
        const [cursosRows] = await promiseDb.query("SELECT COUNT(*) as total FROM cursos WHERE estado = 'activo'");
        
        // Contar total de inscripciones (estudiantes únicos)
        const [estudiantesRows] = await promiseDb.query("SELECT COUNT(DISTINCT estudiante_id) as total FROM inscripciones");
        
        // Contar calificaciones pendientes (ejemplo: evaluaciones sin calificar - ajusta según tu lógica)
        const [pendientesRows] = await promiseDb.query("SELECT COUNT(*) as total FROM calificaciones WHERE calificacion = 0 OR calificacion IS NULL");
        
        // Contar clases por semana (contar horarios únicos)
        const [clasesRows] = await promiseDb.query("SELECT COUNT(*) as total FROM horarios");
        
        res.json({
            cursos: cursosRows[0]?.total || 0,
            estudiantes: estudiantesRows[0]?.total || 0,
            pendientes: pendientesRows[0]?.total || 0,
            clasesSemana: clasesRows[0]?.total || 0
        });
    } catch (error) {
        console.error('Error al obtener métricas profesor:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener cursos del profesor
app.get('/profesor/cursos', async (req, res) => {
    try {
        const promiseDb = db.promise();
        
        // Consultar cursos con cantidad de inscritos
        const [cursosRows] = await promiseDb.query(`
            SELECT 
                c.id,
                c.codigo,
                c.nombre,
                c.programa,
                c.semestre,
                c.cupo,
                c.creditos,
                c.estado,
                u.nombre as profesor,
                COUNT(DISTINCT i.estudiante_id) as inscritos
            FROM cursos c
            LEFT JOIN usuarios u ON c.profesor_id = u.id
            LEFT JOIN inscripciones i ON c.id = i.curso_id
            GROUP BY c.id
        `);
        
        res.json(cursosRows);
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener calificaciones del profesor
app.get('/profesor/calificaciones', async (req, res) => {
    try {
        const promiseDb = db.promise();
        
        const [calificacionesRows] = await promiseDb.query(`
            SELECT 
                cal.id,
                u.nombre as estudiante,
                c.nombre as curso,
                c.codigo,
                cal.evaluacion,
                cal.calificacion,
                cal.sobre,
                ROUND((cal.calificacion / cal.sobre) * 100, 0) as porcentaje,
                CASE 
                    WHEN (cal.calificacion / cal.sobre) * 100 >= 90 THEN 'A'
                    WHEN (cal.calificacion / cal.sobre) * 100 >= 80 THEN 'B'
                    WHEN (cal.calificacion / cal.sobre) * 100 >= 70 THEN 'C'
                    ELSE 'F'
                END as letra,
                cal.fecha
            FROM calificaciones cal
            JOIN usuarios u ON cal.estudiante_id = u.id
            JOIN cursos c ON cal.curso_id = c.id
            ORDER BY cal.fecha DESC
        `);
        
        res.json(calificacionesRows);
    } catch (error) {
        console.error('Error al obtener calificaciones:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener asistencias del profesor
app.get('/profesor/asistencias', async (req, res) => {
    try {
        const promiseDb = db.promise();
        
        const [asistenciasRows] = await promiseDb.query(`
            SELECT 
                a.id,
                u.nombre as estudiante,
                c.nombre as curso,
                c.codigo,
                a.fecha,
                a.horario,
                a.estado,
                up.nombre as profesor
            FROM asistencias a
            JOIN usuarios u ON a.estudiante_id = u.id
            JOIN cursos c ON a.curso_id = c.id
            LEFT JOIN usuarios up ON c.profesor_id = up.id
            ORDER BY a.fecha DESC
        `);
        
        res.json(asistenciasRows);
    } catch (error) {
        console.error('Error al obtener asistencias:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener horario del profesor
app.get('/profesor/horario', async (req, res) => {
    try {
        const promiseDb = db.promise();
        
        const [horarioRows] = await promiseDb.query(`
            SELECT 
                h.id,
                h.dia,
                c.codigo,
                c.nombre as curso,
                h.horario,
                u.nombre as profesor,
                h.aula
            FROM horarios h
            JOIN cursos c ON h.curso_id = c.id
            LEFT JOIN usuarios u ON c.profesor_id = u.id
            ORDER BY 
                FIELD(h.dia, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'),
                h.horario
        `);
        
        res.json(horarioRows);
    } catch (error) {
        console.error('Error al obtener horario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ============== ENDPOINTS PARA ADMIN: HORARIOS ==============
app.get('/admin/horarios', async (req, res) => {
    try {
        const promiseDb = db.promise();
        const [rows] = await promiseDb.query(`
            SELECT 
                h.id,
                h.dia,
                h.horario,
                h.aula,
                c.codigo,
                c.nombre AS curso,
                c.programa,
                c.estado,
                u.nombre AS profesor
            FROM horarios h
            JOIN cursos c ON h.curso_id = c.id
            LEFT JOIN usuarios u ON c.profesor_id = u.id
            ORDER BY 
                FIELD(h.dia, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'),
                h.horario
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener horarios (admin):', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ============== ENDPOINTS ADMIN: PERIODOS Y OFERTAS ==============
// Listar periodos académicos
app.get('/admin/periodos', async (_req, res) => {
    try {
        const promiseDb = db.promise();
        const [rows] = await promiseDb.query(`
            SELECT id, nombre, fecha_inicio, fecha_fin, estado, created_at
            FROM periodos_academicos
            ORDER BY fecha_inicio DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener periodos académicos:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Listar ofertas de curso (con joins informativos)
app.get('/admin/ofertas', async (_req, res) => {
    try {
        const promiseDb = db.promise();
        const [rows] = await promiseDb.query(`
            SELECT 
                o.id,
                o.curso_id,
                c.codigo,
                c.nombre AS curso,
                o.periodo_id,
                p.nombre AS periodo,
                o.grupo,
                o.profesor_id,
                u.nombre AS profesor,
                o.cupo,
                o.inscritos,
                o.estado,
                o.created_at
            FROM ofertas_curso o
            JOIN cursos c ON o.curso_id = c.id
            JOIN periodos_academicos p ON o.periodo_id = p.id
            LEFT JOIN usuarios u ON o.profesor_id = u.id
            ORDER BY p.fecha_inicio DESC, c.nombre ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener ofertas de curso:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Catálogos simples para selects en Admin
app.get('/admin/programas', async (_req, res) => {
    try {
        const promiseDb = db.promise();
        const [rows] = await promiseDb.query("SELECT DISTINCT programa FROM usuarios WHERE programa IS NOT NULL AND TRIM(programa) <> '' ORDER BY programa");
        res.json(rows.map(r => r.programa));
    } catch (error) {
        console.error('Error al obtener programas:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.get('/admin/direcciones', async (_req, res) => {
    try {
        const promiseDb = db.promise();
        const [rows] = await promiseDb.query("SELECT DISTINCT direccion FROM usuarios WHERE direccion IS NOT NULL AND TRIM(direccion) <> '' ORDER BY direccion");
        res.json(rows.map(r => r.direccion));
    } catch (error) {
        console.error('Error al obtener direcciones:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ============== ENDPOINTS PARA ADMIN: REPORTES ==============
app.get('/admin/reportes', async (_req, res) => {
    try {
        // Catálogo estático de reportes institucionales
        const reportes = [
            { id: 1, titulo: 'Reporte de Calificaciones por Curso', categoria: 'académico', descripcion: 'Análisis detallado de calificaciones por curso y período académico', frecuencia: 'mensual', formato: 'PDF' },
            { id: 2, titulo: 'Reporte de Asistencia Estudiantil', categoria: 'académico', descripcion: 'Estadísticas de asistencia por estudiante, curso y programa', frecuencia: 'semanal', formato: 'Excel' },
            { id: 3, titulo: 'Rendimiento Académico Individual', categoria: 'académico', descripcion: 'Reporte personalizado del rendimiento académico del estudiante', frecuencia: 'trimestral', formato: 'PDF' },
            { id: 4, titulo: 'Inscripciones por Programa', categoria: 'administrativo', descripcion: 'Análisis de inscripciones y tendencias por programa académico', frecuencia: 'mensual', formato: 'Excel' },
            { id: 5, titulo: 'Utilización de Aulas', categoria: 'administrativo', descripcion: 'Ocupación y utilización de espacios físicos', frecuencia: 'mensual', formato: 'Excel' },
            { id: 6, titulo: 'Estadísticas de Profesores', categoria: 'administrativo', descripcion: 'Distribución de cursos por profesor y carga académica', frecuencia: 'trimestral', formato: 'PDF' },
            { id: 7, titulo: 'Estado de Pagos Estudiantiles', categoria: 'financiero', descripcion: 'Estado de matrículas y pagos pendientes', frecuencia: 'mensual', formato: 'Excel' },
            { id: 8, titulo: 'Boleta de Calificaciones', categoria: 'académico', descripcion: 'Certificado oficial de calificaciones del estudiante', frecuencia: 'trimestral', formato: 'PDF' }
        ];
        res.json(reportes);
    } catch (error) {
        console.error('Error al obtener reportes (admin):', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener reportes disponibles
app.get('/profesor/reportes', async (req, res) => {
    try {
        res.json([
            { id: 1, titulo: 'Reporte de Calificaciones por Curso', categoria: 'académico', descripcion: 'Análisis detallado de calificaciones por curso y período académico', periodo: 'mensual', formato: 'PDF' },
            { id: 2, titulo: 'Reporte de Asistencia Estudiantil', categoria: 'académico', descripcion: 'Estadísticas de asistencia por estudiante, curso y programa', periodo: 'semanal', formato: 'Excel' },
            { id: 3, titulo: 'Rendimiento Académico Individual', categoria: 'académico', descripcion: 'Reporte personalizado del rendimiento académico del estudiante', periodo: 'trimestral', formato: 'PDF' },
        ]);
    } catch (error) {
        console.error('Error al obtener reportes:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// ============== ENDPOINTS PARA ESTUDIANTE ==============
// Métricas para panel de inicio del Estudiante
app.get('/estudiante/metricas', async (req, res) => {
    try {
        const { id, correo, nombre } = req.query;
        const promiseDb = db.promise();

        // 1) Resolver ID del estudiante a partir de id | correo | nombre
        let estudianteId = id;
        if (!estudianteId) {
            if (correo) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
                if (rows.length) estudianteId = rows[0].id;
            } else if (nombre) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE nombre = ? LIMIT 1', [nombre]);
                if (rows.length) estudianteId = rows[0].id;
            }
        }

        if (!estudianteId) {
            return res.status(400).json({ error: 'No se pudo identificar al estudiante (faltan parámetros id/correo/nombre)' });
        }

        // 2) Cursos inscritos (distintos)
        const [cursosRows] = await promiseDb.query(
            'SELECT COUNT(DISTINCT curso_id) AS total FROM inscripciones WHERE estudiante_id = ?',
            [estudianteId]
        );
        const cursosInscritos = cursosRows[0]?.total || 0;

        // 3) GPA promedio sobre 5 (promedio de (calificacion/sobre)*5)
        const [gpaRows] = await promiseDb.query(
            'SELECT ROUND(AVG((calificacion / NULLIF(sobre,0)) * 5), 1) AS gpa FROM calificaciones WHERE estudiante_id = ? AND calificacion IS NOT NULL AND sobre IS NOT NULL AND sobre > 0',
            [estudianteId]
        );
        const promedioGeneral = Number(gpaRows[0]?.gpa || 0).toFixed(1);

        // 4) Asistencia % (presentes / total)
        const [presentesRows] = await promiseDb.query(
            "SELECT COUNT(*) AS presentes FROM asistencias WHERE estudiante_id = ? AND estado = 'presente'",
            [estudianteId]
        );
        const [totalAsisRows] = await promiseDb.query(
            'SELECT COUNT(*) AS total FROM asistencias WHERE estudiante_id = ?',
            [estudianteId]
        );
        const presentes = presentesRows[0]?.presentes || 0;
        const totalAsistencias = totalAsisRows[0]?.total || 0;
        const asistencia = totalAsistencias > 0 ? Number(((presentes / totalAsistencias) * 100).toFixed(1)) : 0;

        // 5) Próxima clase en horas o minutos
        const [horariosRows] = await promiseDb.query(
            `SELECT h.dia, h.horario
             FROM horarios h
             INNER JOIN inscripciones i ON i.curso_id = h.curso_id
             WHERE i.estudiante_id = ?`,
            [estudianteId]
        );

        const dayMap = { 'Domingo':0, 'Lunes':1, 'Martes':2, 'Miércoles':3, 'Miercoles':3, 'Jueves':4, 'Viernes':5, 'Sábado':6, 'Sabado':6 };
        const now = new Date();
        let nextDiffMin = null;
        const getStart = (range) => (range || '').split('-')[0]?.trim();
        for (const h of horariosRows) {
            const dow = dayMap[h.dia];
            if (dow === undefined) continue;
            const start = getStart(h.horario);
            if (!start) continue;
            const [hh, mm] = start.split(':').map(Number);
            if (isNaN(hh)) continue;

            const candidate = new Date(now);
            const delta = (dow - candidate.getDay() + 7) % 7;
            candidate.setDate(candidate.getDate() + delta);
            candidate.setHours(hh, mm || 0, 0, 0);
            if (delta === 0 && candidate <= now) {
                candidate.setDate(candidate.getDate() + 7);
            }
            const diffMin = (candidate - now) / 60000;
            if (nextDiffMin === null || diffMin < nextDiffMin) nextDiffMin = diffMin;
        }

        let proximaClase = null; // texto formateado ("2h" o "45m")
        if (nextDiffMin !== null) {
            if (nextDiffMin >= 120) {
                proximaClase = `${Math.round(nextDiffMin / 60)}h`;
            } else if (nextDiffMin >= 60) {
                proximaClase = '1h';
            } else {
                const mins = Math.max(1, Math.round(nextDiffMin));
                proximaClase = `${mins}m`;
            }
        }

        res.json({ cursosInscritos, promedioGeneral: Number(promedioGeneral), asistencia, proximaClase });
    } catch (error) {
        console.error('Error en métricas de estudiante:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Inscripciones del estudiante
app.get('/estudiante/inscripciones', async (req, res) => {
    try {
        const { id, correo, nombre } = req.query;
        const promiseDb = db.promise();

        // Resolver ID del estudiante
        let estudianteId = id;
        if (!estudianteId) {
            if (correo) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
                if (rows.length) estudianteId = rows[0].id;
            } else if (nombre) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE nombre = ? LIMIT 1', [nombre]);
                if (rows.length) estudianteId = rows[0].id;
            }
        }

        if (!estudianteId) {
            return res.status(400).json({ error: 'No se pudo identificar al estudiante' });
        }

        // Consultar inscripciones del estudiante con datos del curso (usa estado real si existe, fallback 'aprobada')
        const [inscripcionesRows] = await promiseDb.query(`
            SELECT 
                i.id,
                i.curso_id,
                i.estudiante_id,
                i.fecha_inscripcion,
                IFNULL(i.estado,'aprobada') as estado,
                NULL as fecha_aprobacion,
                c.nombre as curso_nombre,
                c.codigo as curso_codigo,
                c.programa,
                c.semestre,
                u_est.nombre as estudiante_nombre,
                u_est.correo as estudiante_email,
                u_prof.nombre as profesor_nombre
            FROM inscripciones i
            LEFT JOIN cursos c ON i.curso_id = c.id
            LEFT JOIN usuarios u_est ON i.estudiante_id = u_est.id
            LEFT JOIN usuarios u_prof ON c.profesor_id = u_prof.id
            WHERE i.estudiante_id = ?
            ORDER BY i.fecha_inscripcion DESC
        `, [estudianteId]);

        res.json(inscripcionesRows);
    } catch (error) {
        console.error('Error obteniendo inscripciones de estudiante:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Calificaciones del estudiante
app.get('/estudiante/calificaciones', async (req, res) => {
    try {
        const { id, correo, nombre } = req.query;
        const promiseDb = db.promise();

        // Resolver ID del estudiante
        let estudianteId = id;
        if (!estudianteId) {
            if (correo) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
                if (rows.length) estudianteId = rows[0].id;
            } else if (nombre) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE nombre = ? LIMIT 1', [nombre]);
                if (rows.length) estudianteId = rows[0].id;
            }
        }

        if (!estudianteId) {
            return res.status(400).json({ error: 'No se pudo identificar al estudiante' });
        }

        // Consultar calificaciones del estudiante
        const [calificacionesRows] = await promiseDb.query(`
            SELECT 
                cal.id,
                u.nombre as estudiante,
                c.nombre as curso,
                c.codigo,
                cal.evaluacion,
                cal.calificacion,
                cal.sobre,
                ROUND((cal.calificacion / cal.sobre) * 100, 0) as porcentaje,
                CASE 
                    WHEN (cal.calificacion / cal.sobre) * 100 >= 90 THEN 'A'
                    WHEN (cal.calificacion / cal.sobre) * 100 >= 80 THEN 'B'
                    WHEN (cal.calificacion / cal.sobre) * 100 >= 70 THEN 'C'
                    ELSE 'D'
                END as letra,
                cal.fecha
            FROM calificaciones cal
            JOIN usuarios u ON cal.estudiante_id = u.id
            JOIN cursos c ON cal.curso_id = c.id
            WHERE cal.estudiante_id = ?
            ORDER BY cal.fecha DESC
        `, [estudianteId]);

        res.json(calificacionesRows);
    } catch (error) {
        console.error('Error obteniendo calificaciones de estudiante:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Asistencia del estudiante
app.get('/estudiante/asistencia', async (req, res) => {
    try {
        const { id, correo, nombre } = req.query;
        const promiseDb = db.promise();

        // Resolver ID del estudiante
        let estudianteId = id;
        if (!estudianteId) {
            if (correo) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
                if (rows.length) estudianteId = rows[0].id;
            } else if (nombre) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE nombre = ? LIMIT 1', [nombre]);
                if (rows.length) estudianteId = rows[0].id;
            }
        }

        if (!estudianteId) {
            return res.status(400).json({ error: 'No se pudo identificar al estudiante' });
        }

        // Consultar asistencias del estudiante
        const [asistenciasRows] = await promiseDb.query(`
            SELECT 
                a.id,
                u.nombre as estudiante,
                c.nombre as curso,
                c.codigo,
                a.fecha,
                a.horario,
                a.estado,
                up.nombre as profesor
            FROM asistencias a
            JOIN usuarios u ON a.estudiante_id = u.id
            JOIN cursos c ON a.curso_id = c.id
            LEFT JOIN usuarios up ON c.profesor_id = up.id
            WHERE a.estudiante_id = ?
            ORDER BY a.fecha DESC
        `, [estudianteId]);

        res.json(asistenciasRows);
    } catch (error) {
        console.error('Error obteniendo asistencia de estudiante:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Horario del estudiante (solo clases de cursos inscritos)
app.get('/estudiante/horario', async (req, res) => {
    try {
        const { id, correo, nombre } = req.query;
        const promiseDb = db.promise();

        // Resolver ID del estudiante
        let estudianteId = id;
        if (!estudianteId) {
            if (correo) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
                if (rows.length) estudianteId = rows[0].id;
            } else if (nombre) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE nombre = ? LIMIT 1', [nombre]);
                if (rows.length) estudianteId = rows[0].id;
            }
        }

        if (!estudianteId) {
            return res.status(400).json({ error: 'No se pudo identificar al estudiante' });
        }

        // Consultar horario del estudiante (solo cursos en los que está inscrito)
        const [horarioRows] = await promiseDb.query(`
            SELECT 
                h.id,
                h.dia,
                c.codigo,
                c.nombre as curso,
                h.horario,
                u.nombre as profesor,
                h.aula
            FROM horarios h
            INNER JOIN cursos c ON h.curso_id = c.id
            INNER JOIN inscripciones i ON c.id = i.curso_id
            LEFT JOIN usuarios u ON c.profesor_id = u.id
            WHERE i.estudiante_id = ?
            ORDER BY 
                FIELD(h.dia, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'),
                h.horario
        `, [estudianteId]);

        res.json(horarioRows);
    } catch (error) {
        console.error('Error obteniendo horario de estudiante:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Resumen para Mi Portal del estudiante
app.get('/estudiante/portal/resumen', async (req, res) => {
    try {
        const { id, correo, nombre } = req.query;
        const promiseDb = db.promise();

        // Resolver ID del estudiante
        let estudianteId = id;
        if (!estudianteId) {
            if (correo) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
                if (rows.length) estudianteId = rows[0].id;
            } else if (nombre) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE nombre = ? LIMIT 1', [nombre]);
                if (rows.length) estudianteId = rows[0].id;
            }
        }

        if (!estudianteId) {
            return res.status(400).json({ error: 'No se pudo identificar al estudiante' });
        }

        // Calcular GPA (promedio de todas las calificaciones)
        const [gpaRows] = await promiseDb.query(`
            SELECT AVG((calificacion / sobre) * 5) as gpa
            FROM calificaciones
            WHERE estudiante_id = ?
        `, [estudianteId]);
        const gpa = gpaRows[0].gpa || 0;

            // Calcular créditos totales (suma real de créditos). Si no existe la columna estado aún, estado NULL se toma como aprobado.
            const [creditosRows] = await promiseDb.query(`
                SELECT COALESCE(SUM(COALESCE(c.creditos,3)),0) AS creditosTotales
                FROM inscripciones i
                JOIN cursos c ON i.curso_id = c.id
                WHERE i.estudiante_id = ? AND (i.estado = 'aprobada' OR i.estado IS NULL)
            `, [estudianteId]);
            const creditosTotales = creditosRows[0]?.creditosTotales || 0;

        // Calcular semestre actual (créditos / 18)
        const semestre = Math.ceil(creditosTotales / 18) || 1;

        // Cursos actuales (inscritos actualmente)
        const [cursosRows] = await promiseDb.query(`
            SELECT COUNT(*) as cursosActuales
            FROM inscripciones
            WHERE estudiante_id = ? AND estado IN ('aprobada', 'pendiente')
        `, [estudianteId]);
        const cursosActuales = cursosRows[0].cursosActuales || 0;

        // Horario de hoy (calcular día actual y buscar clases)
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaHoy = diasSemana[new Date().getDay()];
        
        const [horarioHoyRows] = await promiseDb.query(`
            SELECT 
                c.codigo,
                c.nombre as curso,
                h.horario,
                h.aula
            FROM horarios h
            INNER JOIN cursos c ON h.curso_id = c.id
            INNER JOIN inscripciones i ON c.id = i.curso_id
            WHERE i.estudiante_id = ? AND h.dia = ?
            ORDER BY h.horario
        `, [estudianteId, diaHoy]);

        res.json({
            gpa: parseFloat(gpa.toFixed(2)),
            creditosTotales,
            semestre,
            cursosActuales,
            horarioHoy: horarioHoyRows
        });
    } catch (error) {
        console.error('Error obteniendo resumen portal estudiante:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Cursos inscritos con estadísticas para Mi Portal
app.get('/estudiante/portal/cursos', async (req, res) => {
    try {
        const { id, correo, nombre } = req.query;
        const promiseDb = db.promise();

        // Resolver ID del estudiante
        let estudianteId = id;
        if (!estudianteId) {
            if (correo) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
                if (rows.length) estudianteId = rows[0].id;
            } else if (nombre) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE nombre = ? LIMIT 1', [nombre]);
                if (rows.length) estudianteId = rows[0].id;
            }
        }

        // Obtener cursos inscritos con calificación promedio y asistencia (sin filtrar por estado, usando subconsultas para evitar duplicados)
        const [cursosRows] = await promiseDb.query(`
            SELECT 
                c.id,
                c.codigo,
                c.nombre as curso,
                u.nombre as profesor,
                COALESCE((
                    SELECT AVG((calificacion / sobre) * 5)
                    FROM calificaciones cal
                    WHERE cal.curso_id = c.id AND cal.estudiante_id = ?
                ), 0) as calificacionActual,
                COALESCE((
                    SELECT (SUM(CASE WHEN estado = 'presente' THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(id), 0)
                    FROM asistencias a
                    WHERE a.curso_id = c.id AND a.estudiante_id = ?
                ), 0) as asistenciaPorcentaje,
                GROUP_CONCAT(DISTINCT CONCAT(h.dia, ' ', h.horario) SEPARATOR ', ') as horarios
            FROM inscripciones i
            INNER JOIN cursos c ON i.curso_id = c.id
            LEFT JOIN usuarios u ON c.profesor_id = u.id
            LEFT JOIN horarios h ON h.curso_id = c.id
            WHERE i.estudiante_id = ?
            GROUP BY c.id, c.codigo, c.nombre, u.nombre
        `, [estudianteId, estudianteId, estudianteId]);

        res.json(cursosRows);
    } catch (error) {
        console.error('Error obteniendo cursos portal estudiante:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Perfil del estudiante
app.get('/estudiante/perfil', async (req, res) => {
    try {
        const { id, correo, nombre } = req.query;
        const promiseDb = db.promise();

        // Resolver ID del estudiante
        let estudianteId = id;
        if (!estudianteId) {
            if (correo) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
                if (rows.length) estudianteId = rows[0].id;
            } else if (nombre) {
                const [rows] = await promiseDb.query('SELECT id FROM usuarios WHERE nombre = ? LIMIT 1', [nombre]);
                if (rows.length) estudianteId = rows[0].id;
            }
        }

        if (!estudianteId) {
            return res.status(400).json({ error: 'No se pudo identificar al estudiante' });
        }

        // Obtener información del perfil + fecha de matrícula (primera inscripción)
        const [perfilRows] = await promiseDb.query(`
            SELECT 
                u.id,
                u.nombre,
                u.correo,
                u.rol,
                u.programa,
                (SELECT MIN(i.fecha_inscripcion) FROM inscripciones i WHERE i.estudiante_id = u.id) AS fecha_matricula
            FROM usuarios u
            WHERE u.id = ?
        `, [estudianteId]);

        if (perfilRows.length === 0) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        res.json(perfilRows[0]);
    } catch (error) {
        console.error('Error obteniendo perfil estudiante:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Actualizar perfil del estudiante (telefono, direccion, programa)
app.put('/estudiante/perfil', async (req, res) => {
    try {
        const { id, correo, nombre } = req.query; // identificación
        const { telefono, direccion, programa } = req.body; // campos editables
        const promiseDb = db.promise();

        // Resolver ID del estudiante
        let estudianteId = id;
        if (!estudianteId) {
            if (correo) {
                const [r1] = await promiseDb.query('SELECT id FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
                if (r1.length) estudianteId = r1[0].id;
            } else if (nombre) {
                const [r2] = await promiseDb.query('SELECT id FROM usuarios WHERE nombre = ? LIMIT 1', [nombre]);
                if (r2.length) estudianteId = r2[0].id;
            }
        }

        if (!estudianteId) {
            return res.status(400).json({ error: 'No se pudo identificar al estudiante' });
        }

        // Validar que exista
        const [existsRows] = await promiseDb.query('SELECT id FROM usuarios WHERE id = ? AND rol = "Estudiante" LIMIT 1', [estudianteId]);
        if (!existsRows.length) return res.status(404).json({ error: 'Estudiante no encontrado' });

        // Construir SET dinámico según valores presentes
        const fields = [];
        const params = [];
        if (telefono !== undefined) { fields.push('telefono = ?'); params.push(telefono); }
        if (direccion !== undefined) { fields.push('direccion = ?'); params.push(direccion); }
        if (programa !== undefined) { fields.push('programa = ?'); params.push(programa); }

        if (!fields.length) {
            return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
        }

        params.push(estudianteId);
        const sql = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`;
        await promiseDb.query(sql, params);

        // Devolver perfil actualizado
        const [perfilRows] = await promiseDb.query(`
            SELECT 
                u.id,
                u.nombre,
                u.correo,
                u.rol,
                u.programa,
                u.telefono,
                u.direccion,
                (SELECT MIN(i.fecha_inscripcion) FROM inscripciones i WHERE i.estudiante_id = u.id) AS fecha_matricula
            FROM usuarios u
            WHERE u.id = ?
        `, [estudianteId]);

        res.json({ actualizado: true, perfil: perfilRows[0] });
    } catch (error) {
        console.error('Error actualizando perfil estudiante:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
