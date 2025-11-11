
import React, { useEffect, useState } from 'react';
import { FaHome, FaBookOpen, FaClipboardList, FaCalendarAlt, FaChartBar, FaSignOutAlt, FaUser, FaUniversity, FaGraduationCap, FaUsers, FaClock, FaCalendarCheck, FaEye, FaEdit, FaChartLine, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaFileAlt, FaFilePdf, FaFileExcel, FaDownload } from 'react-icons/fa';
import { FaRegCheckCircle } from 'react-icons/fa';
import confirmLogout from '../utils/confirmLogout';
import './ProfesorPage.css';

const ProfesorPage = () => {
    const [usuario, setUsuario] = useState({ nombre: '', rol: '' });
    const [collapsed, setCollapsed] = useState(false);
    const [activePage, setActivePage] = useState('inicio');
    const [metrics, setMetrics] = useState({ cursos: 0, estudiantes: 0, pendientes: 0, clasesSemana: 0 });

    // Estados para datos desde el backend
    const [courses, setCourses] = useState([]);
    const [grades, setGrades] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [reports, setReports] = useState([]);
    
    // Estados para filtros
    const [query, setQuery] = useState('');
    const [programFilter, setProgramFilter] = useState('Todos');
    const [gradeQuery, setGradeQuery] = useState('');
    const [gradeCourseFilter, setGradeCourseFilter] = useState('Todos');
    const [gradeTypeFilter, setGradeTypeFilter] = useState('Todos');
    const [attendanceQuery, setAttendanceQuery] = useState('');
    const [attendanceCourseFilter, setAttendanceCourseFilter] = useState('Todos');
    const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('Todos');
    const [scheduleDayFilter, setScheduleDayFilter] = useState('Todos');
    const [scheduleProgramFilter, setScheduleProgramFilter] = useState('Todos');
    const [reportCategoryFilter, setReportCategoryFilter] = useState('Todos');
    const [reportFormatFilter, setReportFormatFilter] = useState('Todos');

    // Cargar usuario desde localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('usuario');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUsuario(parsedUser);
            } catch (error) {
                setUsuario({ nombre: '', rol: 'Profesor' });
            }
        } else {
            setUsuario({ nombre: '', rol: 'Profesor' });
        }
    }, []);

    // Cargar métricas del profesor
    useEffect(() => {
        fetch('http://localhost:5000/profesor/metricas')
            .then(res => res.json())
            .then(data => setMetrics(data))
            .catch(err => console.error('Error al cargar métricas:', err));
    }, []);

    // Cargar cursos
    useEffect(() => {
        if (activePage === 'cursos') {
            fetch('http://localhost:5000/profesor/cursos')
                .then(res => res.json())
                .then(data => setCourses(data))
                .catch(err => console.error('Error al cargar cursos:', err));
        }
    }, [activePage]);

    // Cargar calificaciones
    useEffect(() => {
        if (activePage === 'calificaciones') {
            fetch('http://localhost:5000/profesor/calificaciones')
                .then(res => res.json())
                .then(data => setGrades(data))
                .catch(err => console.error('Error al cargar calificaciones:', err));
        }
    }, [activePage]);

    // Cargar asistencias
    useEffect(() => {
        if (activePage === 'asistencia') {
            fetch('http://localhost:5000/profesor/asistencias')
                .then(res => res.json())
                .then(data => setAttendance(data))
                .catch(err => console.error('Error al cargar asistencias:', err));
        }
    }, [activePage]);

    // Cargar horario
    useEffect(() => {
        if (activePage === 'horario') {
            fetch('http://localhost:5000/profesor/horario')
                .then(res => res.json())
                .then(data => setSchedule(data))
                .catch(err => console.error('Error al cargar horario:', err));
        }
    }, [activePage]);

    // Cargar reportes
    useEffect(() => {
        if (activePage === 'reportes') {
            fetch('http://localhost:5000/profesor/reportes')
                .then(res => res.json())
                .then(data => setReports(data))
                .catch(err => console.error('Error al cargar reportes:', err));
        }
    }, [activePage]);

    const handleLogoutClick = async () => {
        const ok = await confirmLogout();
        if (ok) {
            localStorage.removeItem('usuario');
            window.location.href = '/';
        }
    };

    const toggleCollapsed = () => setCollapsed((s) => !s);

    return (
        <div className="profesor-dashboard">
            {/* Sidebar lateral */}
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                <div>
                    <div className="sidebar-header">
                        <FaUniversity className="sidebar-icon" aria-hidden="true" />
                        <div className="sidebar-texts">
                            <h2>SOMOS PENSADORES</h2>
                            <p>Panel Profesor</p>
                        </div>
                    </div>
                    <div
                        className="collapse-toggle"
                        onClick={toggleCollapsed}
                        title={collapsed ? 'Expandir' : 'Contraer'}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') toggleCollapsed();
                        }}
                    >
                        {collapsed ? '>' : '<'}
                    </div>
                    <hr className="sidebar-divider" />
                    <nav className="menu">
                        <ul>
                            <li className={activePage === 'inicio' ? 'active' : ''} onClick={() => setActivePage('inicio')}>
                                <FaHome className="menu-icon" />
                                <span className="menu-text">Inicio</span>
                            </li>
                            <li className={activePage === 'cursos' ? 'active' : ''} onClick={() => setActivePage('cursos')}>
                                <FaBookOpen className="menu-icon" />
                                <span className="menu-text">Mis Cursos</span>
                            </li>
                            <li className={activePage === 'calificaciones' ? 'active' : ''} onClick={() => setActivePage('calificaciones')}>
                                <FaClipboardList className="menu-icon" />
                                <span className="menu-text">Calificaciones</span>
                            </li>
                            <li className={activePage === 'asistencia' ? 'active' : ''} onClick={() => setActivePage('asistencia')}>
                                <FaRegCheckCircle className="menu-icon" />
                                <span className="menu-text">Asistencia</span>
                            </li>
                            <li className={activePage === 'horario' ? 'active' : ''} onClick={() => setActivePage('horario')}>
                                <FaCalendarAlt className="menu-icon" />
                                <span className="menu-text">Horario</span>
                            </li>
                            <li className={activePage === 'reportes' ? 'active' : ''} onClick={() => setActivePage('reportes')}>
                                <FaChartBar className="menu-icon" />
                                <span className="menu-text">Reportes Académicos</span>
                            </li>
                            <li className="logout" onClick={handleLogoutClick}>
                                <FaSignOutAlt className="menu-icon" />
                                <span className="menu-text">Cerrar sesión</span>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className="user-info">
                    <div className="avatar" aria-hidden="true">
                        {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div className="user-details">
                        <p className="user-name">{usuario.nombre || 'Profesor'}</p>
                        <p className="user-role">{usuario.rol || 'Profesor'}</p>
                    </div>
                </div>
            </aside>
            <main className="main-content">
                {activePage === 'inicio' && (
                    <>
                        <header className="header">
                            <h1>¡Hola, {usuario.nombre || 'Profesor'}!</h1>
                            <p>Panel de profesor - Gestiona tus cursos y estudiantes</p>
                            <p style={{ color: '#64748b', marginTop: 6 }}>Especialización: {usuario.especializacion || 'Ingeniería de Sistemas'}</p>
                        </header>

                        {/* Tarjetas de estadísticas */}
                        <section className="stats" style={{ marginTop: 16 }}>
                            <div className="stat-card">
                                <div>
                                    <p>Mis Cursos</p>
                                    <h2>{metrics.cursos}</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaBookOpen />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Total Estudiantes</p>
                                    <h2>{metrics.estudiantes}</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaGraduationCap />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Calificaciones Pendientes</p>
                                    <h2>{metrics.pendientes}</h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaClipboardList />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Clases Esta Semana</p>
                                    <h2>{metrics.clasesSemana}</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaCalendarAlt />
                                </div>
                            </div>
                        </section>

                        <hr className="divider" />

                        {/* Acciones rápidas */}
                        <section className="quick-actions">
                            <h3>Acciones Rápidas</h3>
                            <p>Gestión académica diaria</p>

                            <div className="action-buttons">
                                <div className="action-card" onClick={() => setActivePage('calificaciones')}>
                                    <FaClipboardList className="action-icon blue" />
                                    <h4>Registrar Calificaciones</h4>
                                    <p>Calificar evaluaciones</p>
                                </div>

                                <div className="action-card" onClick={() => setActivePage('asistencia')}>
                                    <FaRegCheckCircle className="action-icon green" />
                                    <h4>Tomar Asistencia</h4>
                                    <p>Registrar presencia</p>
                                </div>

                                <div className="action-card" onClick={() => setActivePage('horario')}>
                                    <FaCalendarAlt className="action-icon purple" />
                                    <h4>Ver Horarios</h4>
                                    <p>Cronograma de clases</p>
                                </div>

                                <div className="action-card" onClick={() => setActivePage('reportes')}>
                                    <FaChartBar className="action-icon orange" />
                                    <h4>Reportes Académicos</h4>
                                    <p>Análisis de rendimiento</p>
                                </div>
                            </div>
                        </section>

                        <hr className="divider" />

                        {/* Actividad reciente */}
                        <section className="recent-activity">
                            <h3>Actividad Reciente</h3>
                            <ul>
                                <li>✅ Nueva calificación registrada en Matemáticas Avanzadas — hace 2 horas</li>
                                <li>🟢 Asistencia registrada para la clase de Física — hace 4 horas</li>
                                <li>🟣 Nuevo horario publicado para el próximo semestre — hace 1 día</li>
                            </ul>
                        </section>
                    </>
                )}
                {activePage === 'cursos' && (
                    <section className="courses-page">
                        {/* Breadcrumb / header */}
                        <div className="courses-header">
                            <div className="users-breadcrumb">
                                <p className="breadcrumb-path">Inicio / Mis Cursos</p>
                                <h2 className="breadcrumb-title">Mis Cursos</h2>
                                <p className="breadcrumb-sub">Gestiona tus cursos asignados</p>
                            </div>
                        </div>

                        {/* Tarjetas superiores */}
                        <div className="users-cards">
                            <div className="stat-card">
                                <div>
                                    <p>Total Cursos</p>
                                    <h2>{courses.length}</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaBookOpen />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Cursos Activos</p>
                                    <h2>{courses.filter(c=>c.estado==='activo').length}</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaCalendarCheck />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Total Estudiantes</p>
                                    <h2>{courses.reduce((acc,c)=>acc + c.inscritos,0)}</h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaUsers />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Promedio Créditos</p>
                                    <h2>{(courses.reduce((a,c)=>a+c.creditos,0)/courses.length).toFixed(1)}</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaClock />
                                </div>
                            </div>
                        </div>

                        {/* Panel de lista de cursos */}
                        <div className="courses-panel">
                            <div className="courses-panel-top">
                                <div className="courses-panel-search">
                                    <input
                                        className="search-input"
                                        placeholder="Buscar por nombre, código o profesor..."
                                        value={query}
                                        onChange={(e)=>setQuery(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="courses-filter-select"
                                    value={programFilter}
                                    onChange={(e)=>setProgramFilter(e.target.value)}
                                >
                                    <option>Todos</option>
                                    {[...new Set(courses.map(c=>c.programa))].map(p=> (
                                        <option key={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="users-table-wrapper">
                                <table className="courses-table">
                                    <thead>
                                        <tr>
                                            <th>Curso</th>
                                            <th>Profesor</th>
                                            <th>Programa</th>
                                            <th>Estudiantes</th>
                                            <th>Créditos</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses
                                            .filter(c=> programFilter==='Todos' || c.programa===programFilter)
                                            .filter(c=> {
                                                const q = query.toLowerCase();
                                                return !q || c.nombre.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q) || c.profesor.toLowerCase().includes(q);
                                            })
                                            .map((c)=>{
                                                const pct = c.cupo ? Math.round((c.inscritos/c.cupo)*100) : 0;
                                                return (
                                                    <tr key={c.id}>
                                                        <td>
                                                            <div className="user-cell">
                                                                <strong>{c.nombre}</strong>
                                                                <small>{c.codigo}</small>
                                                            </div>
                                                        </td>
                                                        <td>{c.profesor}</td>
                                                        <td>
                                                            <div className="user-cell">
                                                                <span>{c.programa}</span>
                                                                <small>Semestre {c.semestre}</small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{display:'flex',flexDirection:'column',gap:6}}>
                                                                <span>{c.inscritos}/{c.cupo}</span>
                                                                <div className="progress"><div className="progress-bar" style={{width: pct+'%'}} /></div>
                                                            </div>
                                                        </td>
                                                        <td><span className="pill">{c.creditos}</span></td>
                                                        <td><span className={c.estado==='activo' ? 'pill pill-active' : 'pill pill-inactive'}>{c.estado}</span></td>
                                                        <td>
                                                            <div className="row-actions">
                                                                <button className="icon-btn" title="Ver"><FaEye /></button>
                                                                <button className="icon-btn" title="Editar"><FaEdit /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}
                {activePage === 'calificaciones' && (
                    <section className="grades-page">
                        {/* Breadcrumb / header */}
                        <div className="courses-header">
                            <div className="users-breadcrumb">
                                <p className="breadcrumb-path">Inicio / Calificaciones de Mis Cursos</p>
                                <h2 className="breadcrumb-title">Calificaciones de Mis Cursos</h2>
                                <p className="breadcrumb-sub">Gestiona las calificaciones académicas</p>
                            </div>
                        </div>

                        {/* Tarjetas superiores */}
                        <div className="users-cards">
                            <div className="stat-card">
                                <div>
                                    <p>Total Calificaciones</p>
                                    <h2>{grades.length}</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaGraduationCap />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Promedio General</p>
                                    <h2>{(grades.reduce((a,g)=>a+g.calificacion,0)/grades.length).toFixed(1)}</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaChartLine />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Calificación Más Alta</p>
                                    <h2>{Math.max(...grades.map(g=>g.calificacion))}</h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaChartBar />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Cursos Evaluados</p>
                                    <h2>{new Set(grades.map(g=>g.curso)).size}</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaBookOpen />
                                </div>
                            </div>
                        </div>

                        {/* Panel de calificaciones */}
                        <div className="grades-panel">
                            <div className="grades-panel-top">
                                <div className="courses-panel-search">
                                    <input
                                        className="search-input"
                                        placeholder="Buscar por estudiante o curso..."
                                        value={gradeQuery}
                                        onChange={(e)=>setGradeQuery(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="grades-filter-select"
                                    value={gradeCourseFilter}
                                    onChange={(e)=>setGradeCourseFilter(e.target.value)}
                                >
                                    <option>Todos</option>
                                    {[...new Set(grades.map(g=>g.curso))].map(c => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>
                                <select
                                    className="grades-filter-select"
                                    value={gradeTypeFilter}
                                    onChange={(e)=>setGradeTypeFilter(e.target.value)}
                                >
                                    <option>Todos</option>
                                    {[...new Set(grades.map(g=>g.evaluacion))].map(t => (
                                        <option key={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="users-table-wrapper">
                                <table className="grades-table">
                                    <thead>
                                        <tr>
                                            <th>Estudiante</th>
                                            <th>Curso</th>
                                            <th>Evaluación</th>
                                            <th>Calificación</th>
                                            <th>Porcentaje</th>
                                            <th>Letra</th>
                                            <th>Fecha</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grades
                                            .filter(g=> gradeCourseFilter==='Todos' || g.curso===gradeCourseFilter)
                                            .filter(g=> gradeTypeFilter==='Todos' || g.evaluacion===gradeTypeFilter)
                                            .filter(g=> {
                                                const q = gradeQuery.toLowerCase();
                                                return !q || g.estudiante.toLowerCase().includes(q) || g.curso.toLowerCase().includes(q);
                                            })
                                            .map(g => (
                                                <tr key={g.id}>
                                                    <td>{g.estudiante}</td>
                                                    <td>
                                                        <div className="user-cell">
                                                            <strong>{g.curso}</strong>
                                                            <small>{g.codigo}</small>
                                                        </div>
                                                    </td>
                                                    <td><span className="eval-pill">{g.evaluacion}</span></td>
                                                    <td className="score">{g.calificacion}/{g.sobre}</td>
                                                    <td><span className="percentage-pill">{g.porcentaje}%</span></td>
                                                    <td><span className="letter-badge">{g.letra}</span></td>
                                                    <td>{new Date(g.fecha).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="row-actions">
                                                            <button className="icon-btn" title="Editar"><FaEdit /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}
                {activePage === 'asistencia' && (
                    <section className="attendance-page">
                        {/* Breadcrumb / header */}
                        <div className="courses-header">
                            <div className="users-breadcrumb">
                                <p className="breadcrumb-path">Inicio / Asistencia de Mis Cursos</p>
                                <h2 className="breadcrumb-title">Asistencia de Mis Cursos</h2>
                                <p className="breadcrumb-sub">Gestiona el registro de asistencia</p>
                            </div>
                        </div>

                        {/* Tarjetas superiores */}
                        <div className="users-cards">
                            <div className="stat-card">
                                <div>
                                    <p>Total Clases</p>
                                    <h2>{new Set(attendance.map(a=>a.fecha+a.curso)).size}</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaCalendarAlt />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Asistencia (%)</p>
                                    <h2>{((attendance.filter(a=>a.estado==='presente').length/attendance.length)*100).toFixed(1)}%</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaChartLine />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Presentes</p>
                                    <h2>{attendance.filter(a=>a.estado==='presente').length}</h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaCheckCircle />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Ausencias</p>
                                    <h2>{attendance.filter(a=>a.estado==='ausente').length}</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaTimesCircle />
                                </div>
                            </div>
                        </div>

                        {/* Panel de registro de asistencia */}
                        <div className="attendance-panel">
                            <div className="attendance-panel-header">
                                <div>
                                    <h3 className="panel-title">Registro de Asistencia</h3>
                                    <p className="panel-subtitle">Control de asistencia de estudiantes</p>
                                </div>
                                <button className="btn-take-attendance">
                                    <FaRegCheckCircle style={{marginRight:8}} /> Tomar Asistencia
                                </button>
                            </div>

                            <div className="attendance-panel-top">
                                <div className="courses-panel-search">
                                    <input
                                        className="search-input"
                                        placeholder="Buscar por estudiante o curso..."
                                        value={attendanceQuery}
                                        onChange={(e)=>setAttendanceQuery(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="attendance-filter-select"
                                    value={attendanceCourseFilter}
                                    onChange={(e)=>setAttendanceCourseFilter(e.target.value)}
                                >
                                    <option>Todos</option>
                                    {[...new Set(attendance.map(a=>a.curso))].map(c => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>
                                <select
                                    className="attendance-filter-select"
                                    value={attendanceStatusFilter}
                                    onChange={(e)=>setAttendanceStatusFilter(e.target.value)}
                                >
                                    <option>Todos</option>
                                    <option>presente</option>
                                    <option>tardanza</option>
                                    <option>ausente</option>
                                </select>
                            </div>

                            <div className="users-table-wrapper">
                                <table className="attendance-table">
                                    <thead>
                                        <tr>
                                            <th>Estudiante</th>
                                            <th>Curso</th>
                                            <th>Fecha</th>
                                            <th>Horario</th>
                                            <th>Estado</th>
                                            <th>Profesor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendance
                                            .filter(a=> attendanceCourseFilter==='Todos' || a.curso===attendanceCourseFilter)
                                            .filter(a=> attendanceStatusFilter==='Todos' || a.estado===attendanceStatusFilter)
                                            .filter(a=> {
                                                const q = attendanceQuery.toLowerCase();
                                                return !q || a.estudiante.toLowerCase().includes(q) || a.curso.toLowerCase().includes(q);
                                            })
                                            .map(a => (
                                                <tr key={a.id}>
                                                    <td>{a.estudiante}</td>
                                                    <td>
                                                        <div className="user-cell">
                                                            <strong>{a.curso}</strong>
                                                            <small>{a.codigo}</small>
                                                        </div>
                                                    </td>
                                                    <td>{new Date(a.fecha).toLocaleDateString()}</td>
                                                    <td><span className="time-pill">{a.horario}</span></td>
                                                    <td>
                                                        <span className={`attendance-badge ${
                                                            a.estado==='presente' ? 'badge-presente' : 
                                                            a.estado==='tardanza' ? 'badge-tardanza' : 
                                                            'badge-ausente'
                                                        }`}>
                                                            {a.estado==='presente' ? <FaCheckCircle style={{marginRight:4}}/> : 
                                                             a.estado==='tardanza' ? <FaClock style={{marginRight:4}}/> : 
                                                             <FaTimesCircle style={{marginRight:4}}/>}
                                                            {a.estado}
                                                        </span>
                                                    </td>
                                                    <td>{a.profesor}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}
                {activePage === 'horario' && (
                    <section className="schedule-page">
                        {/* Breadcrumb / header */}
                        <div className="courses-header">
                            <div className="users-breadcrumb">
                                <p className="breadcrumb-path">Inicio / Mi Horario de Clases</p>
                                <h2 className="breadcrumb-title">Mi Horario de Clases</h2>
                                <p className="breadcrumb-sub">Gestión de horarios académicos</p>
                            </div>
                        </div>

                        {/* Tarjetas superiores */}
                        <div className="users-cards">
                            <div className="stat-card">
                                <div>
                                    <p>Total Clases/Semana</p>
                                    <h2>{schedule.length}</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaCalendarAlt />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Cursos Activos</p>
                                    <h2>{new Set(schedule.map(s=>s.curso)).size}</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaBookOpen />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Horas/Semana</p>
                                    <h2>10h</h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaClock />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Aulas Diferentes</p>
                                    <h2>{new Set(schedule.map(s=>s.aula)).size}</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaMapMarkerAlt />
                                </div>
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="schedule-filters">
                            <h3>Filtros</h3>
                            <div className="filter-row">
                                <select
                                    className="schedule-filter-select"
                                    value={scheduleDayFilter}
                                    onChange={(e)=>setScheduleDayFilter(e.target.value)}
                                >
                                    <option>Todos</option>
                                    <option>Lunes</option>
                                    <option>Martes</option>
                                    <option>Miércoles</option>
                                    <option>Jueves</option>
                                    <option>Viernes</option>
                                    <option>Sábado</option>
                                </select>
                                <select
                                    className="schedule-filter-select"
                                    value={scheduleProgramFilter}
                                    onChange={(e)=>setScheduleProgramFilter(e.target.value)}
                                >
                                    <option>Todos</option>
                                    {[...new Set(schedule.map(s=>s.curso))].map(p => (
                                        <option key={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Horario Semanal */}
                        <div className="schedule-panel">
                            <div className="schedule-panel-header">
                                <h3 className="panel-title">Horario Semanal</h3>
                                <p className="panel-subtitle">Vista general del cronograma académico</p>
                            </div>

                            <div className="schedule-grid">
                                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((dia) => {
                                    const dayClasses = schedule.filter(s => 
                                        s.dia === dia && 
                                        (scheduleDayFilter === 'Todos' || s.dia === scheduleDayFilter) &&
                                        (scheduleProgramFilter === 'Todos' || s.curso === scheduleProgramFilter)
                                    );
                                    return (
                                        <div key={dia} className="schedule-day-column">
                                            <h4 className="day-header">{dia}</h4>
                                            {dayClasses.length === 0 ? (
                                                <p className="no-classes">Sin clases programadas</p>
                                            ) : (
                                                dayClasses.map(cls => (
                                                    <div key={cls.id} className={`schedule-class-card ${
                                                        cls.codigo.startsWith('MAT') ? 'card-blue' : 
                                                        cls.codigo.startsWith('ADM') ? 'card-orange' : 
                                                        cls.codigo.startsWith('FIS') ? 'card-green' : 
                                                        'card-purple'
                                                    }`}>
                                                        <div className="class-header">
                                                            <span className="class-code">{cls.codigo}</span>
                                                            <span className="class-time">{cls.horario}</span>
                                                        </div>
                                                        <h5 className="class-title">{cls.curso}</h5>
                                                        <p className="class-prof">Prof. {cls.profesor}</p>
                                                        <p className="class-location">
                                                            <FaMapMarkerAlt style={{marginRight:4}} />
                                                            {cls.aula}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}
                {activePage === 'reportes' && (
                    <section className="reports-page">
                        {/* Breadcrumb / header */}
                        <div className="courses-header">
                            <div className="users-breadcrumb">
                                <p className="breadcrumb-path">Inicio / Reportes Académicos</p>
                                <h2 className="breadcrumb-title">Reportes Académicos</h2>
                                <p className="breadcrumb-sub">Genera reportes institucionales y análisis de datos</p>
                            </div>
                        </div>

                        {/* Tarjetas superiores */}
                        <div className="users-cards">
                            <div className="stat-card">
                                <div>
                                    <p>Reportes Disponibles</p>
                                    <h2>{reports.length}</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaFileAlt />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Académicos</p>
                                    <h2>{reports.filter(r=>r.categoria==='académico').length}</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaChartBar />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Administrativos</p>
                                    <h2>0</h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaClock />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Financieros</p>
                                    <h2>0</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaChartLine />
                                </div>
                            </div>
                        </div>

                        {/* Panel de reportes */}
                        <div className="reports-panel">
                            <div className="reports-panel-header">
                                <div>
                                    <h3 className="panel-title">Catálogo de Reportes</h3>
                                    <p className="panel-subtitle">Selecciona y genera los reportes que necesitas</p>
                                </div>
                            </div>

                            <div className="reports-filters">
                                <select
                                    className="reports-filter-select"
                                    value={reportCategoryFilter}
                                    onChange={(e)=>setReportCategoryFilter(e.target.value)}
                                >
                                    <option>Todos</option>
                                    <option>académico</option>
                                    <option>administrativo</option>
                                    <option>financiero</option>
                                </select>
                                <select
                                    className="reports-filter-select"
                                    value={reportFormatFilter}
                                    onChange={(e)=>setReportFormatFilter(e.target.value)}
                                >
                                    <option>Todos</option>
                                    <option>PDF</option>
                                    <option>Excel</option>
                                </select>
                            </div>

                            <div className="reports-grid">
                                {reports
                                    .filter(r=> reportCategoryFilter==='Todos' || r.categoria===reportCategoryFilter)
                                    .filter(r=> reportFormatFilter==='Todos' || r.formato===reportFormatFilter)
                                    .map(r => (
                                        <div key={r.id} className="report-card">
                                            <div className="report-header">
                                                <div className="report-icon">
                                                    <FaChartBar />
                                                </div>
                                                <span className="report-category-badge">académico</span>
                                                <span className="report-format-badge">
                                                    {r.formato === 'PDF' ? <FaFilePdf style={{marginRight:4}}/> : <FaFileExcel style={{marginRight:4}}/>}
                                                    {r.formato}
                                                </span>
                                            </div>
                                            <h4 className="report-title">{r.titulo}</h4>
                                            <p className="report-description">{r.descripcion}</p>
                                            <div className="report-meta">
                                                <span className="report-period">
                                                    <FaClock style={{marginRight:4}} />
                                                    {r.periodo}
                                                </span>
                                            </div>
                                            <button className="btn-generate-report">
                                                <FaDownload style={{marginRight:6}} /> Generar
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default ProfesorPage;
