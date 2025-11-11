import React, { useEffect, useState } from "react";
import {
    FaHome,
    FaUser,
    FaClipboardList,
    FaGraduationCap,
    FaCalendarCheck,
    FaClock,
    FaSignOutAlt,
    FaChartLine,
    FaBookOpen,
    FaCalendarAlt,
    FaEdit,
    FaUserPlus,
    FaCheckCircle,
    FaTimesCircle,
    FaTimes,
    FaSearch,
} from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import confirmLogout from "../utils/confirmLogout";
import "./EstudiantePage.css";

const EstudiantePage = () => {
    const [usuario, setUsuario] = useState({ nombre: "", rol: "", programa: "" });
    const [collapsed, setCollapsed] = useState(false);
    const [activePage, setActivePage] = useState("inicio"); // "inicio" | "portal" | "inscripciones" | "calificaciones" | "asistencia" | "horario"
    const [activeTab, setActiveTab] = useState("resumen"); // Para Mi Portal: "resumen" | "cursos" | "calificaciones" | "perfil"
    // Métricas dinámicas de inicio
    const [estMetrics, setEstMetrics] = useState({ cursosInscritos: 0, promedioGeneral: 0, asistencia: 0, proximaClase: null });
    // Datos dinámicos de inscripciones
    const [inscripciones, setInscripciones] = useState([]);
    // Datos dinámicos de calificaciones
    const [calificaciones, setCalificaciones] = useState([]);
    // Datos dinámicos de asistencia
    const [asistencias, setAsistencias] = useState([]);
    // Datos dinámicos de horario
    const [horario, setHorario] = useState([]);
    // Datos dinámicos de Mi Portal
    const [portalResumen, setPortalResumen] = useState({ gpa: 0, creditosTotales: 0, semestre: 1, cursosActuales: 0, horarioHoy: [] });
    const [portalCursos, setPortalCursos] = useState([]);
    const [perfil, setPerfil] = useState({ nombre: '', correo: '', programa: '' });
    // Filtros Mi Portal > Calificaciones
    const [portalCalSearch, setPortalCalSearch] = useState('');
    const [portalCalCurso, setPortalCalCurso] = useState('');
    const [portalCalEval, setPortalCalEval] = useState('');

    // Cargar usuario guardado
    useEffect(() => {
        const storedUser = localStorage.getItem("usuario");
            if (storedUser) { 
            try {
                const parsedUser = JSON.parse(storedUser);
                setUsuario(parsedUser);
            } catch (error) {
                console.error("❌ Error al parsear usuario:", error);
            }
        }
    }, []);

    // Cargar métricas reales para el dashboard de inicio
    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const u = JSON.parse(localStorage.getItem('usuario') || '{}');
                const qs = new URLSearchParams();
                if (u?.correo) qs.append('correo', u.correo);
                else if (u?.nombre) qs.append('nombre', u.nombre);
                const resp = await fetch(`http://localhost:5000/estudiante/metricas?${qs.toString()}`);
                if (!resp.ok) throw new Error('Error cargando métricas');
                const data = await resp.json();
                setEstMetrics(data);
            } catch (e) {
                console.error('Error obteniendo métricas estudiante:', e);
            }
        };
        if (activePage === 'inicio') fetchMetrics();
    }, [activePage]); 
    
    // Cargar resumen de Mi Portal
    useEffect(() => {
        const fetchPortalResumen = async () => {
            try {
                const u = JSON.parse(localStorage.getItem('usuario') || '{}');
                const qs = new URLSearchParams();
                if (u?.correo) qs.append('correo', u.correo);
                else if (u?.nombre) qs.append('nombre', u.nombre);
                const resp = await fetch(`http://localhost:5000/estudiante/portal/resumen?${qs.toString()}`);
                if (!resp.ok) throw new Error('Error cargando resumen portal');
                const data = await resp.json();
                setPortalResumen(data);
            } catch (e) {
                console.error('Error obteniendo resumen portal:', e);
            }
        };
        if (activePage === 'portal' && activeTab === 'resumen') fetchPortalResumen();
    }, [activePage, activeTab]);
    
    // Cargar cursos de Mi Portal
    useEffect(() => {
        const fetchPortalCursos = async () => {
            try {
                const u = JSON.parse(localStorage.getItem('usuario') || '{}');
                const qs = new URLSearchParams();
                if (u?.correo) qs.append('correo', u.correo);
                else if (u?.nombre) qs.append('nombre', u.nombre);
                const resp = await fetch(`http://localhost:5000/estudiante/portal/cursos?${qs.toString()}`);
                if (!resp.ok) throw new Error('Error cargando cursos portal');
                const data = await resp.json();
                setPortalCursos(data);
            } catch (e) {
                console.error('Error obteniendo cursos portal:', e);
            }
        };
        if (activePage === 'portal' && activeTab === 'cursos') fetchPortalCursos();
    }, [activePage, activeTab]);
    
    // Cargar perfil del estudiante
    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const u = JSON.parse(localStorage.getItem('usuario') || '{}');
                const qs = new URLSearchParams();
                if (u?.correo) qs.append('correo', u.correo);
                else if (u?.nombre) qs.append('nombre', u.nombre);
                const resp = await fetch(`http://localhost:5000/estudiante/perfil?${qs.toString()}`);
                if (!resp.ok) throw new Error('Error cargando perfil');
                const data = await resp.json();
                setPerfil(data);
            } catch (e) {
                console.error('Error obteniendo perfil:', e);
            }
        };
        if (activePage === 'portal' && activeTab === 'perfil') fetchPerfil();
    }, [activePage, activeTab]);
    
    // Mostrar confirmación antes de cerrar sesión

    // Cargar inscripciones del estudiante
    useEffect(() => {
        const fetchInscripciones = async () => {
            try {
                const u = JSON.parse(localStorage.getItem('usuario') || '{}');
                const qs = new URLSearchParams();
                if (u?.correo) qs.append('correo', u.correo);
                else if (u?.nombre) qs.append('nombre', u.nombre);
                const resp = await fetch(`http://localhost:5000/estudiante/inscripciones?${qs.toString()}`);
                if (!resp.ok) throw new Error('Error cargando inscripciones');
                const data = await resp.json();
                setInscripciones(data);
            } catch (e) {
                console.error('Error obteniendo inscripciones:', e);
            }
        };
        if (activePage === 'inscripciones') fetchInscripciones();
    }, [activePage]);

    // Cargar calificaciones del estudiante (Mi Portal > Calificaciones y sección dedicada)
    useEffect(() => {
        const fetchCalificaciones = async () => {
            try {
                const u = JSON.parse(localStorage.getItem('usuario') || '{}');
                const qs = new URLSearchParams();
                if (u?.correo) qs.append('correo', u.correo);
                else if (u?.nombre) qs.append('nombre', u.nombre);
                const resp = await fetch(`http://localhost:5000/estudiante/calificaciones?${qs.toString()}`);
                if (!resp.ok) throw new Error('Error cargando calificaciones');
                const data = await resp.json();
                setCalificaciones(data);
            } catch (e) {
                console.error('Error obteniendo calificaciones:', e);
            }
        };
        if (activePage === 'calificaciones' || (activePage === 'portal' && activeTab === 'calificaciones')) fetchCalificaciones();
    }, [activePage, activeTab]);

    // Cargar asistencias del estudiante
    useEffect(() => {
        const fetchAsistencias = async () => {
            try {
                const u = JSON.parse(localStorage.getItem('usuario') || '{}');
                const qs = new URLSearchParams();
                if (u?.correo) qs.append('correo', u.correo);
                else if (u?.nombre) qs.append('nombre', u.nombre);
                const resp = await fetch(`http://localhost:5000/estudiante/asistencia?${qs.toString()}`);
                if (!resp.ok) throw new Error('Error cargando asistencias');
                const data = await resp.json();
                setAsistencias(data);
            } catch (e) {
                console.error('Error obteniendo asistencias:', e);
            }
        };
        if (activePage === 'asistencia') fetchAsistencias();
    }, [activePage]);

    // Cargar horario del estudiante
    useEffect(() => {
        const fetchHorario = async () => {
            try {
                const u = JSON.parse(localStorage.getItem('usuario') || '{}');
                const qs = new URLSearchParams();
                if (u?.correo) qs.append('correo', u.correo);
                else if (u?.nombre) qs.append('nombre', u.nombre);
                const resp = await fetch(`http://localhost:5000/estudiante/horario?${qs.toString()}`);
                if (!resp.ok) throw new Error('Error cargando horario');
                const data = await resp.json();
                setHorario(data);
            } catch (e) {
                console.error('Error obteniendo horario:', e);
            }
        };
        if (activePage === 'horario') fetchHorario();
    }, [activePage]);

    // Mostrar confirmación antes de cerrar sesión
    const handleLogoutClick = async () => {
        const ok = await confirmLogout();
        if (ok) {
            localStorage.removeItem("usuario");
            window.location.href = "/";
        }
    };

    const toggleCollapsed = () => setCollapsed((s) => !s);

    return (
        <div className="estudiante-dashboard">
            {/* Sidebar lateral */}
            <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
                <div>
                    <div className="sidebar-header">
                        <i className="fa-solid fa-building-columns sidebar-icon" aria-hidden="true"></i>
                        <div className="sidebar-texts">
                            <h2>SOMOS PENSADORES</h2>
                            <p>Sistema Académico</p>
                        </div>
                    </div>

                    <div
                        className="collapse-toggle"
                        onClick={toggleCollapsed}
                        title={collapsed ? "Expandir" : "Contraer"}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") toggleCollapsed();
                        }}
                    >
                        {collapsed ? ">" : "<"}
                    </div>

                    <hr className="sidebar-divider" />

                    <nav className="menu">
                        <ul>
                            <li
                                className={activePage === "inicio" ? "active" : ""}
                                onClick={() => setActivePage("inicio")}
                            >
                                <FaHome className="menu-icon" />
                                <span className="menu-text">Inicio</span>
                            </li>
                            <li
                                className={activePage === "portal" ? "active" : ""}
                                onClick={() => setActivePage("portal")}
                            >
                                <FaUser className="menu-icon" />
                                <span className="menu-text">Mi Portal</span>
                            </li>
                            <li
                                className={activePage === "inscripciones" ? "active" : ""}
                                onClick={() => setActivePage("inscripciones")}
                            >
                                <FaClipboardList className="menu-icon" />
                                <span className="menu-text">Mis Inscripciones</span>
                            </li>
                            <li
                                className={activePage === "calificaciones" ? "active" : ""}
                                onClick={() => setActivePage("calificaciones")}
                            >
                                <FaGraduationCap className="menu-icon" />
                                <span className="menu-text">Mis Calificaciones</span>
                            </li>
                            <li
                                className={activePage === "asistencia" ? "active" : ""}
                                onClick={() => setActivePage("asistencia")}
                            >
                                <FaCalendarCheck className="menu-icon" />
                                <span className="menu-text">Mi Asistencia</span>
                            </li>
                            <li
                                className={activePage === "horario" ? "active" : ""}
                                onClick={() => setActivePage("horario")}
                            >
                                <FaClock className="menu-icon" />
                                <span className="menu-text">Mi Horario</span>
                            </li>

                            {/* 🔹 Botón de cierre de sesión */}
                            <li className="logout" onClick={handleLogoutClick}>
                                <FaSignOutAlt className="menu-icon" />
                                <span className="menu-text">Cerrar sesión</span>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Información del usuario */}
                <div className="user-info">
                    <div className="avatar" aria-hidden="true">
                        {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : "E"}
                    </div>
                    <div className="user-details">
                        <p className="user-name">{usuario.nombre || "Estudiante"}</p>
                        <p className="user-role">{usuario.programa || "Ingeniería de Sistemas"}</p>
                    </div>
                </div>
            </aside>

            {/* Contenido principal */}
            <main className="main-content">
                {activePage === "inicio" ? (
                    // Vista: Inicio (Dashboard estudiante)
                    <section className="dashboard-estudiante">
                        {/* Cabecera / breadcrumb */}
                        <div className="breadcrumb-path">Portal del Estudiante - Tu información académica</div>
                        <h1 className="breadcrumb-title">¡Hola, {usuario.nombre || "Carlos Andrés Pérez"}!</h1>
                        <p className="breadcrumb-sub">Programa: {usuario.programa || "Ingeniería de Sistemas"}</p>

                        {/* Tarjetas de métricas */}
                        <div className="stats">
                            <div className="stat-card">
                                <div>
                                    <p>Cursos Inscritos</p>
                                    <h2>{estMetrics.cursosInscritos}</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaBookOpen />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Promedio General</p>
                                    <h2>{Number(estMetrics.promedioGeneral || 0).toFixed(1)}</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaChartLine />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Asistencia</p>
                                    <h2>{Number(estMetrics.asistencia || 0).toFixed(1)}%</h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaCalendarCheck />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Próxima Clase</p>
                                    <h2>{estMetrics.proximaClase || '-'}</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaClock />
                                </div>
                            </div>
                        </div>

                        {/* Acciones Rápidas */}
                        <div className="content-panel">
                            <div className="panel-header">
                                <div>
                                    <h3 className="panel-title">Acciones Rápidas</h3>
                                    <p className="panel-subtitle">Consulta tu información académica</p>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <div className="action-card" onClick={() => setActivePage("calificaciones")}>
                                    <FaGraduationCap className="action-icon blue" />
                                    <h4>Ver Calificaciones</h4>
                                    <p>Consultar notas</p>
                                </div>

                                <div className="action-card" onClick={() => setActivePage("asistencia")}>
                                    <FaCalendarCheck className="action-icon green" />
                                    <h4>Mi Asistencia</h4>
                                    <p>Registro de presencia</p>
                                </div>

                                <div className="action-card" onClick={() => setActivePage("horario")}>
                                    <FaClock className="action-icon purple" />
                                    <h4>Mi Horario</h4>
                                    <p>Cronograma académico</p>
                                </div>

                                <div className="action-card" onClick={() => setActivePage("inscripciones")}>
                                    <FaClipboardList className="action-icon orange" />
                                    <h4>Inscripciones</h4>
                                    <p>Gestionar materias</p>
                                </div>
                            </div>
                        </div>

                        {/* Actividad Reciente */}
                        <div className="content-panel">
                            <div className="panel-header">
                                <div>
                                    <h3 className="panel-title">Actividad Reciente</h3>
                                    <p className="panel-subtitle">Últimas acciones en el sistema</p>
                                </div>
                            </div>

                            <div className="activity-list">
                                <div className="activity-item">
                                    <span className="activity-icon">📝</span>
                                    <div>
                                        <strong>Nueva calificación registrada en Matemáticas Avanzadas</strong>
                                        <small>Hace 2 horas</small>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <span className="activity-icon">✅</span>
                                    <div>
                                        <strong>Asistencia registrada para la clase de Física</strong>
                                        <small>Hace 4 horas</small>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <span className="activity-icon">📅</span>
                                    <div>
                                        <strong>Nuevo horario publicado para el próximo semestre</strong>
                                        <small>Hace 1 día</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : activePage === "portal" ? (
                    // Vista: Mi Portal
                    <section className="portal-estudiante">
                        {/* Breadcrumb */}
                        <div className="breadcrumb-path">Inicio / Mi Portal</div>
                        <h1 className="breadcrumb-title">Portal del Estudiante</h1>
                        <p className="breadcrumb-sub">Gestiona tu información académica y personal</p>

                        {/* Tabs de navegación */}
                        <div className="portal-tabs">
                            <button 
                                className={`tab-btn ${activeTab === "resumen" ? "active" : ""}`}
                                onClick={() => setActiveTab("resumen")}
                            >
                                Resumen
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === "cursos" ? "active" : ""}`}
                                onClick={() => setActiveTab("cursos")}
                            >
                                Mis Cursos
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === "calificaciones" ? "active" : ""}`}
                                onClick={() => setActiveTab("calificaciones")}
                            >
                                Calificaciones
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === "perfil" ? "active" : ""}`}
                                onClick={() => setActiveTab("perfil")}
                            >
                                Mi Perfil
                            </button>
                        </div>

                        {/* Contenido según tab activo */}
                        {activeTab === "resumen" ? (
                            <div className="tab-content">
                                {/* Métricas del resumen (dinámicas) */}
                                <div className="portal-metrics">
                                    <div className="metric-card">
                                        <p className="metric-label">GPA Actual</p>
                                        <h2 className="metric-value" style={{color:'#10b981'}}>{portalResumen.gpa?.toFixed(2) || '0.00'}</h2>
                                        <div className="metric-icon blue">
                                            <FaChartLine />
                                        </div>
                                    </div>
                                    <div className="metric-card">
                                        <p className="metric-label">Créditos</p>
                                        <h2 className="metric-value">{portalResumen.creditosTotales}</h2>
                                        <div className="metric-icon green">
                                            <FaGraduationCap />
                                        </div>
                                    </div>
                                    <div className="metric-card">
                                        <p className="metric-label">Cursos Actuales</p>
                                        <h2 className="metric-value">{portalResumen.cursosActuales}</h2>
                                        <div className="metric-icon purple">
                                            <FaBookOpen />
                                        </div>
                                    </div>
                                    <div className="metric-card">
                                        <p className="metric-label">Semestre</p>
                                        <h2 className="metric-value">{portalResumen.semestre}°</h2>
                                        <div className="metric-icon orange">
                                            <FaCalendarAlt />
                                        </div>
                                    </div>
                                </div>

                                <div className="portal-grid">
                                    {/* Horario de Hoy dinámico */}
                                    <div className="portal-card">
                                        <h3 className="card-title">Horario de Hoy</h3>
                                        {portalResumen.horarioHoy && portalResumen.horarioHoy.length > 0 ? (
                                            portalResumen.horarioHoy.map((cls, idx) => (
                                                <div key={idx} className="schedule-item">
                                                    <div className="schedule-info">
                                                        <h4>{cls.curso}</h4>
                                                        <p className="schedule-location">{cls.codigo} - {cls.aula}</p>
                                                    </div>
                                                    <div className="schedule-time">
                                                        <span className="time-range">{cls.horario}</span>
                                                        {(() => {
                                                            // Badge según si es próxima clase (comparar hora actual)
                                                            try {
                                                                const ahora = new Date();
                                                                const horaActualMin = ahora.getHours() * 60 + ahora.getMinutes();
                                                                const [ini] = cls.horario.split('-');
                                                                const [hIni, mIni] = ini.trim().split(':').map(Number);
                                                                const iniMin = hIni * 60 + mIni;
                                                                if (iniMin >= horaActualMin) {
                                                                    return <span className="time-badge proxima">Próxima</span>;
                                                                } else {
                                                                    return <span className="time-badge despues">Pasada</span>;
                                                                }
                                                            } catch {
                                                                return null;
                                                            }
                                                        })()}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="no-classes">No hay clases hoy</p>
                                        )}
                                    </div>

                                    {/* Historial Académico */}
                                    <div className="portal-card">
                                        <h3 className="card-title">Historial Académico</h3>
                                        
                                        <div className="history-item">
                                            <div className="history-period">
                                                <h4>2024-1</h4>
                                                <p>18 créditos</p>
                                            </div>
                                            <div className="history-gpa">
                                                <span className="gpa-label">GPA: 4.1</span>
                                                <span className="status-badge completado">Completado</span>
                                            </div>
                                        </div>

                                        <div className="history-item">
                                            <div className="history-period">
                                                <h4>2023-2</h4>
                                                <p>16 créditos</p>
                                            </div>
                                            <div className="history-gpa">
                                                <span className="gpa-label">GPA: 4</span>
                                                <span className="status-badge completado">Completado</span>
                                            </div>
                                        </div>

                                        <div className="history-item">
                                            <div className="history-period">
                                                <h4>2023-1</h4>
                                                <p>17 créditos</p>
                                            </div>
                                            <div className="history-gpa">
                                                <span className="gpa-label">GPA: 4.3</span>
                                                <span className="status-badge completado">Completado</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : activeTab === "cursos" ? (
                            <div className="tab-content">
                                <div className="cursos-section">
                                    <h2 className="section-title">Cursos Inscritos - Semestre Actual</h2>
                                    <p className="section-subtitle">Información de tus cursos actuales</p>

                                    <div className="cursos-grid">
                                        {portalCursos && portalCursos.length > 0 ? (
                                            portalCursos.map((c) => {
                                                const cal = Number(c.calificacionActual || 0);
                                                const asis = Number(c.asistenciaPorcentaje || 0);
                                                const calClass = cal >= 4 ? 'verde' : cal >= 3 ? 'naranja' : 'azul';
                                                const asisClass = asis >= 90 ? 'verde' : asis >= 75 ? 'naranja' : 'azul';
                                                return (
                                                    <div key={c.id} className="curso-card">
                                                        <div className="curso-header">
                                                            <div>
                                                                <span className="curso-codigo">{c.codigo}</span>
                                                                <span className="curso-creditos">3 créditos</span>
                                                            </div>
                                                        </div>
                                                        <h3 className="curso-nombre">{c.curso}</h3>
                                                        <p className="curso-profesor">Prof. {c.profesor || '-'}</p>

                                                        <div className="curso-stats">
                                                            <div className="stat-item">
                                                                <span className="stat-label">Calificación Actual:</span>
                                                                <span className={`stat-value ${calClass}`}>{cal.toFixed(1)}</span>
                                                            </div>
                                                            <div className="stat-item">
                                                                <span className="stat-label">Asistencia:</span>
                                                                <span className={`stat-value ${asisClass}`}>{Math.round(asis)}%</span>
                                                            </div>
                                                        </div>

                                                        <div className="curso-horario">
                                                            <FaClock className="horario-icon" />
                                                            <span>{c.horarios || 'Sin horario asignado'}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="no-classes" style={{gridColumn:'1/-1'}}>No tienes cursos inscritos</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : activeTab === "calificaciones" ? (
                            <div className="tab-content">
                                <div className="calificaciones-section">
                                    <h2 className="section-title">Historial de Calificaciones</h2>
                                    <p className="section-subtitle">Registro completo de tu rendimiento académico</p>

                                    {/* Métricas rápidas */}
                                    <div className="portal-metrics" style={{marginBottom: '16px'}}>
                                        <div className="metric-card">
                                            <p className="metric-label">Total</p>
                                            <h2 className="metric-value">{calificaciones.length}</h2>
                                            <div className="metric-icon blue"><FaGraduationCap /></div>
                                        </div>
                                        <div className="metric-card">
                                            <p className="metric-label">Promedio %</p>
                                            <h2 className="metric-value" style={{color:'#10b981'}}>
                                                {calificaciones.length > 0 
                                                    ? (calificaciones.reduce((s, c) => s + Number(c.porcentaje || 0), 0) / calificaciones.length).toFixed(1) 
                                                    : '0.0'}%
                                            </h2>
                                            <div className="metric-icon green"><FaChartLine /></div>
                                        </div>
                                        <div className="metric-card">
                                            <p className="metric-label">Cursos</p>
                                            <h2 className="metric-value">{new Set(calificaciones.map(c => c.curso)).size}</h2>
                                            <div className="metric-icon purple"><FaBookOpen /></div>
                                        </div>
                                    </div>

                                    {/* Filtros dinámicos */}
                                    <div className="search-filter-bar">
                                        <input
                                            type="text"
                                            className="search-input"
                                            placeholder="Buscar por curso, código o evaluación..."
                                            value={portalCalSearch}
                                            onChange={(e) => setPortalCalSearch(e.target.value)}
                                        />
                                        <select
                                            className="filter-select"
                                            value={portalCalCurso}
                                            onChange={(e) => setPortalCalCurso(e.target.value)}
                                        >
                                            <option value="">Todos los cursos</option>
                                            {[...new Set(calificaciones.map(c => c.curso).filter(Boolean))].map((curso) => (
                                                <option key={curso} value={curso}>{curso}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="filter-select"
                                            value={portalCalEval}
                                            onChange={(e) => setPortalCalEval(e.target.value)}
                                        >
                                            <option value="">Todas las evaluaciones</option>
                                            {[...new Set(calificaciones.map(c => c.evaluacion).filter(Boolean))].map((ev) => (
                                                <option key={ev} value={ev}>{ev}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Tabla de calificaciones (dinámica) */}
                                    <div className="table-container">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Curso</th>
                                                    <th>Evaluación</th>
                                                    <th>Calificación</th>
                                                    <th>Porcentaje</th>
                                                    <th>Letra</th>
                                                    <th>Fecha</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {calificaciones.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>
                                                            No tienes calificaciones registradas
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    calificaciones
                                                    .filter((cal) => {
                                                        const s = (portalCalSearch || '').trim().toLowerCase();
                                                        const text = `${cal.curso || ''} ${cal.codigo || ''} ${cal.evaluacion || ''} ${cal.letra || ''}`.toLowerCase();
                                                        const bySearch = s ? text.includes(s) : true;
                                                        const byCurso = portalCalCurso ? cal.curso === portalCalCurso : true;
                                                        const byEval = portalCalEval ? cal.evaluacion === portalCalEval : true;
                                                        return bySearch && byCurso && byEval;
                                                    })
                                                    .map((cal) => (
                                                        <tr key={cal.id}>
                                                            <td>
                                                                <div className="course-info">
                                                                    <strong>{cal.curso}</strong>
                                                                    <span className="course-code">{cal.codigo}</span>
                                                                </div>
                                                            </td>
                                                            <td>{cal.evaluacion}</td>
                                                            <td>
                                                                <span className={`calificacion-value ${Number(cal.porcentaje) >= 80 ? 'verde' : 'azul'}`}>
                                                                    {cal.calificacion}/{cal.sobre}
                                                                </span>
                                                            </td>
                                                            <td>{cal.porcentaje}%</td>
                                                            <td>
                                                                <span className={`badge-letra letra-${cal.letra}`}>{cal.letra}</span>
                                                            </td>
                                                            <td>{new Date(cal.fecha).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="tab-content">
                                <div className="perfil-section">
                                    <div className="perfil-header">
                                        <div>
                                            <h2 className="section-title">Mi Perfil</h2>
                                            <p className="section-subtitle">Gestiona tu información personal</p>
                                        </div>
                                        <button className="btn-editar">
                                            <FaEdit /> Editar
                                        </button>
                                    </div>

                                    <div className="perfil-grid">
                                        {/* Panel Información Personal */}
                                        <div className="perfil-panel">
                                            <h3 className="panel-title">Información Personal</h3>
                                            
                                            <div className="info-item">
                                                <span className="info-label">Nombre Completo</span>
                                                <span className="info-value">{(perfil && perfil.nombre) || usuario.nombre || "Estudiante"}</span>
                                            </div>

                                            <div className="info-item">
                                                <span className="info-label">Email</span>
                                                <span className="info-value">{(perfil && perfil.correo) || "-"}</span>
                                            </div>

                                            <div className="info-item">
                                                <span className="info-label">Teléfono</span>
                                                <span className="info-value">{perfil.telefono || '-'}</span>
                                            </div>

                                            <div className="info-item">
                                                <span className="info-label">Dirección</span>
                                                <span className="info-value">{perfil.direccion || '-'}</span>
                                            </div>
                                        </div>

                                        {/* Panel Información Académica */}
                                        <div className="perfil-panel">
                                            <h3 className="panel-title">Información Académica</h3>
                                            
                                            <div className="info-item">
                                                <span className="info-label">Código Estudiantil</span>
                                                <span className="info-value">{perfil.id || '-'}</span>
                                            </div>

                                            <div className="info-item">
                                                <span className="info-label">Programa Académico</span>
                                                <span className="info-value">{(perfil && perfil.programa) || usuario.programa || "Ingeniería"}</span>
                                            </div>

                                            <div className="info-item">
                                                <span className="info-label">Semestre Actual</span>
                                                <span className="info-value">{portalResumen.semestre}° Semestre</span>
                                            </div>

                                            <div className="info-item">
                                                <span className="info-label">Fecha de Matrícula</span>
                                                <span className="info-value">{perfil.fecha_matricula ? new Date(perfil.fecha_matricula).toLocaleDateString() : '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                ) : activePage === "inscripciones" ? (
                    // Vista: Mis Inscripciones
                    <section className="inscripciones-estudiante">
                        {/* Breadcrumb */}
                        <div className="breadcrumb-path">Inicio / Mis Inscripciones</div>
                        <h1 className="breadcrumb-title">Mis Inscripciones</h1>
                        <p className="breadcrumb-sub">Gestiona tus inscripciones a cursos</p>

                        {/* Métricas de inscripciones */}
                        <div className="stats">
                            <div className="stat-card">
                                <div>
                                    <p>Total Inscripciones</p>
                                    <h2>{inscripciones.length}</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaUserPlus />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Aprobadas</p>
                                    <h2>{inscripciones.filter(i => i.estado === 'aprobada').length}</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaCheckCircle />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Pendientes</p>
                                    <h2>{inscripciones.filter(i => i.estado === 'pendiente').length}</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaClock />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Rechazadas</p>
                                    <h2>{inscripciones.filter(i => i.estado === 'rechazada').length}</h2>
                                </div>
                                <div className="icon-box red">
                                    <FaTimesCircle />
                                </div>
                            </div>
                        </div>

                        {/* Lista de inscripciones */}
                        <div className="inscripciones-list">
                            <div className="list-header">
                                <div>
                                    <h2 className="list-title">Lista de Inscripciones</h2>
                                    <p className="list-subtitle">Gestiona tus inscripciones a cursos</p>
                                </div>
                                <button className="btn-inscribir">
                                    <FaUserPlus /> Inscribirse a Curso
                                </button>
                            </div>

                            {/* Barra de búsqueda y filtros */}
                            <div className="search-filter-bar">
                                <input 
                                    type="text" 
                                    className="search-input" 
                                    placeholder="Buscar por estudiante, curso o código..." 
                                />
                                <select className="filter-select">
                                    <option>Estado</option>
                                    <option>Aprobada</option>
                                    <option>Pendiente</option>
                                    <option>Rechazada</option>
                                </select>
                                <select className="filter-select">
                                    <option>Programa</option>
                                    <option>Ingeniería de Sistemas</option>
                                    <option>Administración de Empresas</option>
                                    <option>Psicología</option>
                                </select>
                            </div>

                            {/* Tabla de inscripciones */}
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Estudiante</th>
                                            <th>Curso</th>
                                            <th>Programa</th>
                                            <th>Fecha Inscripción</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inscripciones.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>
                                                    No tienes inscripciones registradas
                                                </td>
                                            </tr>
                                        ) : (
                                            inscripciones.map((insc) => (
                                                <tr key={insc.id}>
                                                    <td>
                                                        <div className="student-info">
                                                            <strong>{insc.estudiante_nombre || usuario.nombre}</strong>
                                                            <span className="email-text">{insc.estudiante_email}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="course-info">
                                                            <strong>{insc.curso_nombre}</strong>
                                                            <span className="course-code">{insc.curso_codigo}</span>
                                                            <span className="professor-text">Prof. {insc.profesor_nombre}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="program-info">
                                                            <span>{insc.programa}</span>
                                                            <span className="semester-text">Semestre {insc.semestre}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="date-info">
                                                            <span>{new Date(insc.fecha_inscripcion).toLocaleDateString()}</span>
                                                            {insc.fecha_aprobacion && (
                                                                <span className="approved-date">Aprobada: {new Date(insc.fecha_aprobacion).toLocaleDateString()}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge-estado ${insc.estado}`}>{insc.estado}</span>
                                                    </td>
                                                    <td>
                                                        <div className="actions-cell">
                                                            {insc.estado === 'pendiente' && (
                                                                <button className="btn-action-cancel" title="Cancelar inscripción">
                                                                    <FaTimes />
                                                                </button>
                                                            )}
                                                            {insc.estado !== 'pendiente' && '-'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                ) : activePage === "calificaciones" ? (
                    // Vista: Mis Calificaciones
                    <section className="calificaciones-view">
                        {/* Breadcrumb */}
                        <div className="breadcrumb-path">Inicio / Mis Calificaciones</div>
                        <h1 className="breadcrumb-title">Mis Calificaciones</h1>
                        <p className="breadcrumb-sub">Consulta tus calificaciones</p>

                        {/* Métricas de calificaciones */}
                        <div className="stats">
                            <div className="stat-card">
                                <div>
                                    <p>Total Calificaciones</p>
                                    <h2>{calificaciones.length}</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaGraduationCap />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Promedio General</p>
                                    <h2>{calificaciones.length > 0 ? (calificaciones.reduce((sum, c) => sum + Number(c.porcentaje || 0), 0) / calificaciones.length).toFixed(1) : '0.0'}</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaChartLine />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Calificación Más Alta</p>
                                    <h2>{calificaciones.length > 0 ? Math.max(...calificaciones.map(c => Number(c.calificacion || 0))) : 0}</h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaChartLine />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Cursos Evaluados</p>
                                    <h2>{new Set(calificaciones.map(c => c.curso)).size}</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaBookOpen />
                                </div>
                            </div>
                        </div>

                        {/* Registro de calificaciones */}
                        <div className="calificaciones-list">
                            <div className="list-header">
                                <div>
                                    <h2 className="list-title">Registro de Calificaciones</h2>
                                    <p className="list-subtitle">Historial de tus calificaciones académicas</p>
                                </div>
                            </div>

                            {/* Barra de búsqueda y filtros */}
                            <div className="search-filter-bar">
                                <input 
                                    type="text" 
                                    className="search-input" 
                                    placeholder="Buscar por estudiante o curso..." 
                                />
                                <select className="filter-select">
                                    <option>Filtrar por curso</option>
                                    <option>Matemáticas Básicas</option>
                                    <option>Administración General</option>
                                </select>
                                <select className="filter-select">
                                    <option>Tipo evaluación</option>
                                    <option>Parcial</option>
                                    <option>Proyecto</option>
                                    <option>Examen Final</option>
                                </select>
                            </div>

                            {/* Tabla de calificaciones */}
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Estudiante</th>
                                            <th>Curso</th>
                                            <th>Evaluación</th>
                                            <th>Calificación</th>
                                            <th>Porcentaje</th>
                                            <th>Letra</th>
                                            <th>Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {calificaciones.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>
                                                    No tienes calificaciones registradas
                                                </td>
                                            </tr>
                                        ) : (
                                            calificaciones.map((cal) => (
                                                <tr key={cal.id}>
                                                    <td>
                                                        <strong>{cal.estudiante || usuario.nombre}</strong>
                                                    </td>
                                                    <td>
                                                        <div className="course-info">
                                                            <strong>{cal.curso}</strong>
                                                            <span className="course-code">{cal.codigo}</span>
                                                        </div>
                                                    </td>
                                                    <td>{cal.evaluacion}</td>
                                                    <td>
                                                        <span className={`calificacion-value ${Number(cal.porcentaje) >= 80 ? 'verde' : 'azul'}`}>
                                                            {cal.calificacion}/{cal.sobre}
                                                        </span>
                                                    </td>
                                                    <td>{cal.porcentaje}%</td>
                                                    <td>
                                                        <span className={`badge-letra letra-${cal.letra}`}>{cal.letra}</span>
                                                    </td>
                                                    <td>{new Date(cal.fecha).toLocaleDateString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                ) : activePage === "asistencia" ? (
                    // Vista: Mi Asistencia
                    <section className="asistencia-view">
                        {/* Breadcrumb */}
                        <div className="breadcrumb-path">Inicio / Mi Asistencia</div>
                        <h1 className="breadcrumb-title">Mi Asistencia</h1>
                        <p className="breadcrumb-sub">Consulta tu registro de asistencia</p>

                        {/* Métricas de asistencia */}
                        <div className="stats">
                            <div className="stat-card">
                                <div>
                                    <p>Total Clases</p>
                                    <h2>{asistencias.length}</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaCalendarAlt />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Asistencia (%)</p>
                                    <h2 style={{color:'#10b981'}}>
                                        {asistencias.length > 0 
                                            ? ((asistencias.filter(a => a.estado === 'presente').length / asistencias.length) * 100).toFixed(1) 
                                            : '0.0'}%
                                    </h2>
                                </div>
                                <div className="icon-box green">
                                    <FaChartLine />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Presentes</p>
                                    <h2>{asistencias.filter(a => a.estado === 'presente').length}</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaCheckCircle />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Ausencias</p>
                                    <h2 style={{color:'#dc2626'}}>{asistencias.filter(a => a.estado === 'ausente').length}</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaTimesCircle />
                                </div>
                            </div>
                        </div>

                        {/* Registro de Asistencia */}
                        <div className="asistencia-list">
                            <div className="list-header">
                                <div>
                                    <h2 className="list-title">Registro de Asistencia</h2>
                                    <p className="list-subtitle">Tu historial de asistencia a clases</p>
                                </div>
                            </div>

                            {/* Barra de búsqueda y filtros */}
                            <div className="search-filter-bar">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Buscar por estudiante o curso..."
                                />
                                <select className="filter-select">
                                    <option>Filtrar por curso</option>
                                    <option>Matemáticas Básicas</option>
                                    <option>Administración General</option>
                                </select>
                                <select className="filter-select">
                                    <option>Estado</option>
                                    <option>presente</option>
                                    <option>tardanza</option>
                                    <option>ausente</option>
                                </select>
                            </div>

                            {/* Tabla de asistencia */}
                            <div className="table-container">
                                <table className="data-table">
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
                                        {asistencias.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>
                                                    No tienes registros de asistencia
                                                </td>
                                            </tr>
                                        ) : (
                                            asistencias.map((asis) => (
                                                <tr key={asis.id}>
                                                    <td><strong>{asis.estudiante || usuario.nombre}</strong></td>
                                                    <td>
                                                        <div className="course-info">
                                                            <strong>{asis.curso}</strong>
                                                            <span className="course-code">{asis.codigo}</span>
                                                        </div>
                                                    </td>
                                                    <td>{new Date(asis.fecha).toLocaleDateString()}</td>
                                                    <td>{asis.horario}</td>
                                                    <td>
                                                        <div className="estado-cell">
                                                            {asis.estado === 'presente' && <FaCheckCircle className="icon-presente" />}
                                                            {asis.estado === 'tardanza' && <FaClock className="icon-tardanza" />}
                                                            {asis.estado === 'ausente' && <FaTimesCircle className="icon-ausente" />}
                                                            <span className={`badge-asistencia ${asis.estado}`}>{asis.estado}</span>
                                                        </div>
                                                    </td>
                                                    <td>{asis.profesor}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                ) : activePage === "horario" ? (
                    // Vista: Mi Horario
                    <section className="horario-view">
                        {/* Breadcrumb */}
                        <div className="breadcrumb-path">Inicio / Mi Horario Académico</div>
                        <h1 className="breadcrumb-title">Mi Horario Académico</h1>
                        <p className="breadcrumb-sub">Tu cronograma académico semanal</p>

                        {/* Métricas de horario */}
                        <div className="stats">
                            <div className="stat-card">
                                <div>
                                    <p>Total Clases/Semana</p>
                                    <h2>{horario.length}</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaCalendarAlt />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Cursos Activos</p>
                                    <h2>{new Set(horario.map(h => h.curso)).size}</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaBookOpen />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Horas/Semana</p>
                                    <h2>{(() => {
                                        let totalHoras = 0;
                                        horario.forEach(h => {
                                            const [inicio, fin] = (h.horario || '').split('-').map(t => t.trim());
                                            if (inicio && fin) {
                                                const [hI, mI] = inicio.split(':').map(Number);
                                                const [hF, mF] = fin.split(':').map(Number);
                                                if (!isNaN(hI) && !isNaN(hF)) {
                                                    totalHoras += (hF - hI) + ((mF || 0) - (mI || 0)) / 60;
                                                }
                                            }
                                        });
                                        return Math.round(totalHoras);
                                    })()}h</h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaClock />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Aulas Diferentes</p>
                                    <h2>{new Set(horario.map(h => h.aula)).size}</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaMapMarkerAlt />
                                </div>
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="content-panel">
                            <div className="panel-header">
                                <div>
                                    <h3 className="panel-title">Filtros</h3>
                                </div>
                            </div>
                            <div className="search-filter-bar">
                                <select className="filter-select">
                                    <option>Filtrar por día</option>
                                    <option>Lunes</option>
                                    <option>Martes</option>
                                    <option>Miércoles</option>
                                    <option>Jueves</option>
                                    <option>Viernes</option>
                                    <option>Sábado</option>
                                </select>
                                <select className="filter-select">
                                    <option>Filtrar por programa</option>
                                    <option>Ingeniería de Sistemas</option>
                                    <option>Administración de Empresas</option>
                                    <option>Psicología</option>
                                </select>
                            </div>
                        </div>

                        {/* Horario Semanal */}
                        <div className="content-panel">
                            <div className="panel-header">
                                <div>
                                    <h3 className="panel-title">Horario Semanal</h3>
                                    <p className="panel-subtitle">Vista general del cronograma académico</p>
                                </div>
                            </div>
                            <div className="schedule-grid">
                                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((dia) => {
                                    const clasesDelDia = horario.filter(h => h.dia === dia);
                                    return (
                                        <div key={dia} className="schedule-day-column">
                                            <h4 className="day-header">{dia}</h4>
                                            {clasesDelDia.length === 0 ? (
                                                <p className="no-classes">Sin clases programadas</p>
                                            ) : (
                                                clasesDelDia.map((cls) => {
                                                    // Asignar color según el código del curso
                                                    let colorVariant = 'card-blue';
                                                    if (cls.codigo?.startsWith('ADM')) colorVariant = 'card-orange';
                                                    else if (cls.codigo?.startsWith('FIS')) colorVariant = 'card-green';
                                                    else if (cls.codigo?.startsWith('HUM') || cls.codigo?.startsWith('PSI')) colorVariant = 'card-purple';

                                                    return (
                                                        <div key={cls.id} className={`schedule-class-card ${colorVariant}`}>
                                                            <div className="class-header">
                                                                <span className="class-code">{cls.codigo}</span>
                                                                <span className="class-time">{cls.horario}</span>
                                                            </div>
                                                            <h5 className="class-title">{cls.curso}</h5>
                                                            <div className="class-meta">
                                                                <span className="meta-item">
                                                                    <FaUser className="meta-icon" /> Prof. {cls.profesor}
                                                                </span>
                                                                <span className="meta-item">
                                                                    <FaMapMarkerAlt className="meta-icon" /> {cls.aula}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                ) : (
                    // Otras vistas (por implementar)
                    <div>
                        <h2>Vista: {activePage}</h2>
                        <p>Contenido en desarrollo...</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EstudiantePage;
