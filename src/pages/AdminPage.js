import React, { useEffect, useState } from "react";
import {
    FaHome,
    FaUsers,
    FaBookOpen,
    FaClipboardList,
    FaGraduationCap,
    FaCalendarAlt,
    FaClock,
    FaChartBar,
    FaSignOutAlt,
    FaUserPlus,
    FaPlus,
    FaChartLine,
    FaCheckCircle,
    FaTimesCircle,
} from "react-icons/fa";
import confirmLogout from "../utils/confirmLogout";
import "./AdminPage.css";

const AdminPage = () => {
    const [usuario, setUsuario] = useState({ nombre: "", rol: "" });
    const [collapsed, setCollapsed] = useState(false);
    const [activePage, setActivePage] = useState("dashboard"); // "dashboard" | "users" | "courses" | "inscripciones" | "calificaciones" | "asistencia" | "horarios" | "reportes"

    // Datos conectados al backend (incluye administradores)
    const [counts, setCounts] = useState({ totalUsers: 0, estudiantes: 0, profesores: 0, administradores: 0 });
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersQuery, setUsersQuery] = useState({ q: "", role: "Todos" });
    const [usersRefresh, setUsersRefresh] = useState(0);
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [createForm, setCreateForm] = useState({ nombre: '', correo: '', rol: 'Estudiante', contrasena: '', telefono: '', direccion: '', programa: '', programaOtro: '' });
    const [createError, setCreateError] = useState('');
    const [createFieldErrors, setCreateFieldErrors] = useState({});
    const [programas, setProgramas] = useState([]);
    const [direcciones, setDirecciones] = useState([]);
    const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }
    const [editUser, setEditUser] = useState(null); // usuario en edición o vista
    const [showEditModal, setShowEditModal] = useState(false);
    const [viewOnly, setViewOnly] = useState(false); // modo solo lectura para Ver
    const [editFormErrors, setEditFormErrors] = useState({});
    const [deleteUser, setDeleteUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editProgramaOtro, setEditProgramaOtro] = useState('');

    // Estados para Gestión de Cursos
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [coursesQuery, setCoursesQuery] = useState({ q: "", programa: "Todos", periodo: "Todos" });

    // Estados para inscripciones
    const [inscripciones, setInscripciones] = useState([]);
    const [inscripcionesLoading, setInscripcionesLoading] = useState(false);
    const [inscripcionesQuery, setInscripcionesQuery] = useState({ q: "", estado: "Todos", programa: "Todos", periodo: "Todos", grupo: "Todos" });

    // Estados para calificaciones
    const [calificaciones, setCalificaciones] = useState([]);
    const [calificacionesLoading, setCalificacionesLoading] = useState(false);
    const [calificacionesQuery, setCalificacionesQuery] = useState({ q: "", curso: "Todos", evaluacion: "Todos" });

    // Estados para asistencia
    const [asistencias, setAsistencias] = useState([]);
    const [asistenciasLoading, setAsistenciasLoading] = useState(false);
    const [asistenciasQuery, setAsistenciasQuery] = useState({ q: "", curso: "Todos", estado: "Todos" });

    // Estados para horarios
    const [horarios, setHorarios] = useState([]);
    const [horariosLoading, setHorariosLoading] = useState(false);
    const [horariosQuery, setHorariosQuery] = useState({ dia: "Todos", programa: "Todos" });

    // Estados para reportes
    const [reportes, setReportes] = useState([]);
    const [reportesLoading, setReportesLoading] = useState(false);
    const [reportesQuery, setReportesQuery] = useState({ categoria: 'Todos', formato: 'Todos' });

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

    // Mostrar confirmación antes de cerrar sesión
    const handleLogoutClick = async () => {
        const ok = await confirmLogout();
        if (ok) {
            localStorage.removeItem("usuario");
            window.location.href = "/";
        }
    };

    const toggleCollapsed = () => setCollapsed((s) => !s);

    // Obtener counts para dashboard y cards de Gestión de Usuarios
    useEffect(() => {
        let mounted = true;
        async function fetchCounts() {
            try {
                const res = await fetch("http://localhost:5000/counts");
                if (!res.ok) throw new Error("Error counts");
                const data = await res.json();
                if (mounted) setCounts(data);
            } catch (err) {
                console.error("No se pudieron obtener counts:", err);
            }
        }
        fetchCounts();
        return () => { mounted = false; };
    }, []);

    // Obtener lista de usuarios cuando se abre la vista o cambian filtros
    useEffect(() => {
        if (activePage !== "users") return;
        let mounted = true;
        async function fetchUsers() {
            try {
                setUsersLoading(true);
                const params = new URLSearchParams();
                if (usersQuery.q) params.append("q", usersQuery.q);
                if (usersQuery.role) params.append("role", usersQuery.role);
                const res = await fetch(`http://localhost:5000/usuarios?${params.toString()}`);
                if (!res.ok) throw new Error("Error usuarios");
                const data = await res.json();
                if (mounted) setUsers(data);
            } catch (err) {
                console.error("No se pudieron obtener usuarios:", err);
            } finally {
                if (mounted) setUsersLoading(false);
            }
        }
        fetchUsers();
        return () => { mounted = false; };
    }, [activePage, usersQuery.q, usersQuery.role, usersRefresh]);

    // Cargar catálogos de programas y direcciones
    useEffect(() => {
        async function fetchCatalogos() {
            try {
                const [progRes, dirRes] = await Promise.all([
                    fetch('http://localhost:5000/admin/programas'),
                    fetch('http://localhost:5000/admin/direcciones')
                ]);
                if (progRes.ok) {
                    const progs = await progRes.json();
                    setProgramas(Array.isArray(progs) ? progs : []);
                }
                if (dirRes.ok) {
                    const dirs = await dirRes.json();
                    setDirecciones(Array.isArray(dirs) ? dirs : []);
                }
            } catch (e) {
                console.error('Error cargando catálogos:', e);
            }
        }
        fetchCatalogos();
    }, [usersRefresh]);

    // Obtener lista de cursos cuando se abre la vista o cambian filtros
    useEffect(() => {
        if (activePage !== "courses") return;
        let mounted = true;
        async function fetchCourses() {
            try {
                setCoursesLoading(true);
                const res = await fetch(`http://localhost:5000/admin/cursos`);
                if (!res.ok) throw new Error("Error cursos");
                const data = await res.json();
                if (mounted) setCourses(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("No se pudieron obtener cursos:", err);
                if (mounted) setCourses([]);
            } finally {
                if (mounted) setCoursesLoading(false);
            }
        }
        fetchCourses();
        return () => { mounted = false; };
    }, [activePage]);

    // Fetch inscripciones
    useEffect(() => {
        if (activePage !== "inscripciones") return;
        let mounted = true;

        async function fetchInscripciones() {
            try {
                setInscripcionesLoading(true);
                const res = await fetch("http://localhost:5000/admin/inscripciones");
                const data = await res.json();
                // Asegurar que siempre sea un array
                if (mounted) setInscripciones(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error al cargar inscripciones:", error);
                if (mounted) setInscripciones([]);
            } finally {
                if (mounted) setInscripcionesLoading(false);
            }
        }
        fetchInscripciones();
        return () => { mounted = false; };
    }, [activePage]);

    // Fetch calificaciones
    useEffect(() => {
        if (activePage !== "calificaciones") return;
        let mounted = true;

        async function fetchCalificaciones() {
            try {
                setCalificacionesLoading(true);
                const res = await fetch("http://localhost:5000/admin/calificaciones");
                const data = await res.json();
                if (mounted) setCalificaciones(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error al cargar calificaciones:", error);
                if (mounted) setCalificaciones([]);
            } finally {
                if (mounted) setCalificacionesLoading(false);
            }
        }
        fetchCalificaciones();
        return () => { mounted = false; };
    }, [activePage]);

    // Fetch asistencias (admin)
    useEffect(() => {
        if (activePage !== 'asistencia') return;
        let mounted = true;

        async function fetchAsistencias() {
            try {
                setAsistenciasLoading(true);
                const res = await fetch('http://localhost:5000/admin/asistencias');
                const data = await res.json();
                if (mounted) setAsistencias(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error al cargar asistencias:', error);
                if (mounted) setAsistencias([]);
            } finally {
                if (mounted) setAsistenciasLoading(false);
            }
        }
        fetchAsistencias();
        return () => { mounted = false; };
    }, [activePage]);

    // Fetch horarios (admin)
    useEffect(() => {
        if (activePage !== 'horarios') return;
        let mounted = true;

        async function fetchHorarios() {
            try {
                setHorariosLoading(true);
                const res = await fetch('http://localhost:5000/admin/horarios');
                const data = await res.json();
                if (mounted) setHorarios(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error al cargar horarios:', error);
                if (mounted) setHorarios([]);
            } finally {
                if (mounted) setHorariosLoading(false);
            }
        }
        fetchHorarios();
        return () => { mounted = false; };
    }, [activePage]);

    // Fetch reportes (admin)
    useEffect(() => {
        if (activePage !== 'reportes') return;
        let mounted = true;

        async function fetchReportes() {
            try {
                setReportesLoading(true);
                const res = await fetch('http://localhost:5000/admin/reportes');
                const data = await res.json();
                if (mounted) setReportes(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error al cargar reportes:', error);
                if (mounted) setReportes([]);
            } finally {
                if (mounted) setReportesLoading(false);
            }
        }
        fetchReportes();
        return () => { mounted = false; };
    }, [activePage]);

    // Abrir modal de usuario (ver o editar) cargando datos completos (incluida contraseña si backend la envía)
    const openUser = async (u, readOnly = false) => {
        setViewOnly(readOnly);
        setEditFormErrors({});
        try {
            const res = await fetch(`http://localhost:5000/usuarios/${u.id}`);
            if (res.ok) {
                const data = await res.json();
                // Asegura que la propiedad contraseña exista (puede venir como 'contraseña' desde backend)
                if (data && typeof data.contraseña === 'undefined' && typeof data.contrasena !== 'undefined') {
                    data.contraseña = data.contrasena; // normalizar si viene sin tilde
                }
                setEditUser(data);
            } else {
                setEditUser(u); // fallback básico
            }
        } catch (e) {
            console.error('Error cargando usuario', e);
            setEditUser(u);
        }
        setShowEditModal(true);
    };

    // Prefill campo "Otro" de programa al abrir edición si no coincide con catálogo
    useEffect(() => {
        if (showEditModal && editUser && !viewOnly && Array.isArray(programas) && programas.length > 0) {
            const prog = editUser.programa || '';
            if (prog && !programas.includes(prog)) {
                setEditProgramaOtro(prog);
            } else {
                setEditProgramaOtro('');
            }
        }
    }, [showEditModal, editUser?.programa, viewOnly, programas]);

    return (
        <div className="admin-dashboard">
            {toast && (
                <div className="toast-container">
                    <div className={`toast toast-${toast.type}`} role="alert" aria-live="assertive">
                        <span className="toast-icon">{toast.type === 'success' ? '✅' : '⚠️'}</span>
                        <span className="toast-text">{toast.message}</span>
                        <button className="toast-close" onClick={()=>setToast(null)} title="Cerrar">✖</button>
                    </div>
                </div>
            )}
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
                                className={activePage === "dashboard" ? "active" : ""}
                                onClick={() => setActivePage("dashboard")}
                            >
                                <FaHome className="menu-icon" />
                                <span className="menu-text">Inicio</span>
                            </li>
                            <li
                                className={activePage === "users" ? "active" : ""}
                                onClick={() => setActivePage("users")}
                            >
                                <FaUsers className="menu-icon" />
                                <span className="menu-text">Gestión de Usuarios</span>
                            </li>
                            <li
                                className={activePage === "courses" ? "active" : ""}
                                onClick={() => setActivePage("courses")}
                            >
                                <FaBookOpen className="menu-icon" />
                                <span className="menu-text">Gestión de Cursos</span>
                            </li>
                            <li
                                className={activePage === "inscripciones" ? "active" : ""}
                                onClick={() => setActivePage("inscripciones")}
                            >
                                <FaClipboardList className="menu-icon" />
                                <span className="menu-text">Inscripciones</span>
                            </li>
                            <li
                                className={activePage === "calificaciones" ? "active" : ""}
                                onClick={() => setActivePage("calificaciones")}
                            >
                                <FaGraduationCap className="menu-icon" />
                                <span className="menu-text">Calificaciones</span>
                            </li>
                            <li
                                className={activePage === "asistencia" ? "active" : ""}
                                onClick={() => setActivePage("asistencia")}
                            >
                                <FaCalendarAlt className="menu-icon" /><span className="menu-text">Asistencia</span>
                            </li>
                            <li
                                className={activePage === "horarios" ? "active" : ""}
                                onClick={() => setActivePage("horarios")}
                            >
                                <FaClock className="menu-icon" /><span className="menu-text">Horarios</span>
                            </li>
                            <li
                                className={activePage === "reportes" ? "active" : ""}
                                onClick={() => setActivePage("reportes")}
                            >
                                <FaChartBar className="menu-icon" /><span className="menu-text">Reportes</span>
                            </li>

                            {/* 🔹 Botón de cierre de sesión */}
                            <li className="logout" onClick={handleLogoutClick}>
                                <FaSignOutAlt className="menu-icon" /><span className="menu-text">Cerrar sesión</span>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Información del usuario */}
                <div className="user-info">
                    <div className="avatar" aria-hidden="true">
                        {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="user-details">
                        <p className="user-name">{usuario.nombre || "Usuario"}</p>
                        <p className="user-role">{usuario.rol || "Administrador"}</p>
                    </div>
                </div>
            </aside>

            {/* Contenido principal */}
            <main className="main-content">
                {activePage === "users" ? (
                    // Vista: Gestión de Usuarios
                    <section className="users-page">
                        {/* Cabecera / breadcrumb */}
                        <div className="users-header">
                            <div className="users-breadcrumb">
                                <p className="breadcrumb-path">Inicio / Gestión de Usuarios</p>
                                <h2 className="breadcrumb-title">Gestión de Usuarios</h2>
                                <p className="breadcrumb-sub">Administra usuarios del sistema académico</p>
                            </div>
                        </div>

                        {/* Contadores superiores (reutilizan stat-card) */}
                        <div className="users-cards">
                            <div className="stat-card">
                                <div>
                                    <p>Total Usuarios</p>
                                    <h2>{counts.totalUsers?.toLocaleString() ?? "-"}</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaUsers />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Estudiantes</p>
                                    <h2>{counts.estudiantes?.toLocaleString() ?? "-"}</h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaGraduationCap />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Profesores</p>
                                    <h2>{counts.profesores?.toLocaleString() ?? "-"}</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaBookOpen />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Administradores</p>
                                    <h2>{counts.administradores?.toLocaleString() ?? "-"}</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaUsers />
                                </div>
                            </div>
                        </div>

                        {/* Panel con búsqueda, filtro y botón crear */}
                        <div className="users-panel">
                            <div className="users-panel-top">
                                <div style={{flex:1}}>
                                    <h3 style={{margin:0}}>Lista de Usuarios</h3>
                                    <p style={{margin:'4px 0 0 0',fontSize:'0.75rem',color:'#64748b'}}>Administra todos los usuarios del sistema</p>
                                </div>
                                <button className="btn-create" onClick={()=>{ setShowCreateUser(true); setCreateError(''); }}>
                                    <FaUserPlus style={{ marginRight: 8 }} /> Crear Usuario
                                </button>
                            </div>

                            <div className="search-filter-bar">
                                <input
                                    className="search-input"
                                    placeholder="Buscar por nombre o email..."
                                    value={usersQuery.q}
                                    onChange={(e) => setUsersQuery((s) => ({ ...s, q: e.target.value }))}
                                />
                                <select
                                    className="users-filter-select"
                                    value={usersQuery.role}
                                    onChange={(e) => setUsersQuery((s) => ({ ...s, role: e.target.value }))}
                                >
                                    <option>Todos</option>
                                    <option>Estudiante</option>
                                    <option>Profesor</option>
                                    <option>Administrador</option>
                                    <option>Director de Programa Académico</option>
                                </select>
                            </div>

                            {/* Tabla de usuarios (ahora dinámico) */}
                            <div className="users-table-wrapper">
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Rol</th>
                                            <th>Teléfono</th>
                                            <th>Dirección</th>
                                            <th>Programa</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersLoading ? (
                                            <tr><td colSpan={6}>Cargando...</td></tr>
                                        ) : users.length === 0 ? (
                                            <tr><td colSpan={6}>Sin resultados</td></tr>
                                        ) : (
                                            users.map((u) => (
                                                <tr key={u.id}>
                                                    <td>
                                                        <div className="user-cell">
                                                            <strong>{u.nombre}</strong>
                                                            <small>{u.correo}</small>
                                                        </div>
                                                    </td>
                                                    <td><span className={`badge ${u.rol === 'Profesor' ? 'role-profesor' : u.rol === 'Estudiante' ? 'role-estudiante' : 'role-admin'}`}>{u.rol}</span></td>
                                                    <td>{u.telefono || '—'}</td>
                                                    <td>{u.direccion || '—'}</td>
                                                    <td>{u.programa || '—'}</td>
                                                    <td>
                                                        <div className="row-actions">
                                                            <button className="icon-btn" title="Ver" onClick={()=> openUser(u, true)}>
                                                                👁️
                                                            </button>
                                                            <button className="icon-btn" title="Editar" onClick={()=> openUser(u, false)}>
                                                                ✏️
                                                            </button>
                                                            <button
                                                                className={`icon-btn ${ (u.inscripciones_ref>0 || u.cursos_ref>0) ? 'icon-btn-disabled' : ''}`}
                                                                title={ (u.inscripciones_ref>0 || u.cursos_ref>0)
                                                                    ? `No se puede eliminar (Inscripciones: ${u.inscripciones_ref}, Cursos: ${u.cursos_ref})`
                                                                    : 'Eliminar'}
                                                                onClick={()=>{
                                                                    if (u.inscripciones_ref>0 || u.cursos_ref>0) {
                                                                        setToast({ type:'error', message:`Usuario asignado. Inscripciones: ${u.inscripciones_ref}, Cursos: ${u.cursos_ref}` });
                                                                        setTimeout(()=>setToast(null),3500);
                                                                        return;
                                                                    }
                                                                    setDeleteUser(u); setShowDeleteModal(true);
                                                                }}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {showCreateUser && (
                                <div className="modal-overlay" role="dialog" aria-modal="true">
                                    <div className="modal-card">
                                        <div className="modal-header">
                                            <h3 style={{margin:0}}>Crear Usuario</h3>
                                            <button className="icon-btn" onClick={()=>setShowCreateUser(false)} title="Cerrar">✖</button>
                                        </div>
                                        <div className="modal-body">
                                            {createError && <div className="form-error">{createError}</div>}
                                            <div className="form-grid">
                                                <label>
                                                    <span>Nombre <span className="required">*</span></span>
                                                    <input required value={createForm.nombre} onChange={(e)=>{ setCreateForm({...createForm, nombre: e.target.value}); }} placeholder="Nombre completo" />
                                                    {createFieldErrors.nombre && <small className="field-error">{createFieldErrors.nombre}</small>}
                                                </label>
                                                <label>
                                                    <span>Correo <span className="required">*</span></span>
                                                    <input type="email" required value={createForm.correo} onChange={(e)=>{ setCreateForm({...createForm, correo: e.target.value}); }} placeholder="usuario@somospensadores.edu.co" />
                                                    {createFieldErrors.correo && <small className="field-error">{createFieldErrors.correo}</small>}
                                                </label>
                                                <label>
                                                    <span>Rol <span className="required">*</span></span>
                                                    <select required value={createForm.rol} onChange={(e)=>setCreateForm({...createForm, rol: e.target.value})}>
                                                        <option>Estudiante</option>
                                                        <option>Profesor</option>
                                                        <option>Administrador</option>
                                                        <option>Director de Programa Académico</option>
                                                    </select>
                                                    {createFieldErrors.rol && <small className="field-error">{createFieldErrors.rol}</small>}
                                                </label>
                                                <label>
                                                    <span>Contraseña <span className="required">*</span></span>
                                                    <input type="password" required value={createForm.contrasena} onChange={(e)=>setCreateForm({...createForm, contrasena: e.target.value})} placeholder="Mínimo 6 caracteres" />
                                                    {createFieldErrors.contrasena && <small className="field-error">{createFieldErrors.contrasena}</small>}
                                                </label>
                                                <label>
                                                    <span>Teléfono (10 dígitos) <span className="required">*</span></span>
                                                    <input 
                                                        required 
                                                        value={createForm.telefono} 
                                                        onChange={(e)=>setCreateForm({...createForm, telefono: e.target.value.replace(/\D/g,'')})} 
                                                        maxLength={10}
                                                        placeholder="Solo números"
                                                    />
                                                    {createFieldErrors.telefono && <small className="field-error">{createFieldErrors.telefono}</small>}
                                                </label>
                                                <label>
                                                    <span>Dirección <span className="required">*</span></span>
                                                    <input 
                                                        required
                                                        value={createForm.direccion} 
                                                        onChange={(e)=>setCreateForm({...createForm, direccion: e.target.value})} 
                                                        placeholder="Ingresa dirección"
                                                        list="direcciones-list"
                                                    />
                                                    <datalist id="direcciones-list">
                                                        {direcciones.map((d, i) => <option key={i} value={d} />)}
                                                    </datalist>
                                                    {createFieldErrors.direccion && <small className="field-error">{createFieldErrors.direccion}</small>}
                                                </label>
                                                <label>
                                                    <span>Programa <span className="required">*</span></span>
                                                    {programas.length > 0 ? (
                                                        <select required value={createForm.programa} onChange={(e)=>setCreateForm({...createForm, programa: e.target.value})}>
                                                            <option value="">Selecciona...</option>
                                                            {programas.map((p, i) => <option key={i} value={p}>{p}</option>)}
                                                            <option value="__otro__">Otro (escribir nuevo)</option>
                                                        </select>
                                                    ) : (
                                                        <input 
                                                            required
                                                            value={createForm.programa} 
                                                            onChange={(e)=>setCreateForm({...createForm, programa: e.target.value})} 
                                                            placeholder="Ingresa el programa académico"
                                                        />
                                                    )}
                                                    {createForm.programa === '__otro__' && (
                                                        <input 
                                                            required
                                                            value={createForm.programaOtro || ''} 
                                                            onChange={(e)=>setCreateForm({...createForm, programaOtro: e.target.value})} 
                                                            placeholder="Escribe el programa"
                                                            style={{marginTop: '8px'}}
                                                        />
                                                    )}
                                                    {createFieldErrors.programa && <small className="field-error">{createFieldErrors.programa}</small>}
                                                </label>
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button className="btn-secondary" onClick={()=>setShowCreateUser(false)}>Cancelar</button>
                                            <button className="btn-primary" onClick={async ()=>{
                                                setCreateError('');
                                                const errors = {};
                                                const emailRegex = /^[^@\s]+@somospensadores\.edu\.co$/i;
                                                if (!createForm.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
                                                if (!createForm.correo.trim()) errors.correo = 'El correo es obligatorio';
                                                else if (!emailRegex.test(createForm.correo.trim())) errors.correo = 'Debe usar dominio @somospensadores.edu.co';
                                                if (!createForm.rol) errors.rol = 'El rol es obligatorio';
                                                if (!createForm.contrasena) errors.contrasena = 'La contraseña es obligatoria';
                                                else if (createForm.contrasena.length < 6) errors.contrasena = 'Mínimo 6 caracteres';
                                                if (!createForm.telefono) errors.telefono = 'El teléfono es obligatorio';
                                                else if (!/^\d{10}$/.test(createForm.telefono)) errors.telefono = 'Debe tener exactamente 10 dígitos';
                                                if (!createForm.direccion.trim()) errors.direccion = 'La dirección es obligatoria';
                                                
                                                // Validar programa (puede ser seleccionado o escrito si es "otro")
                                                const programaFinal = createForm.programa === '__otro__' ? createForm.programaOtro : createForm.programa;
                                                if (!programaFinal || !programaFinal.trim()) errors.programa = 'El programa es obligatorio';
                                                
                                                setCreateFieldErrors(errors);
                                                if (Object.keys(errors).length) {
                                                    setCreateError('Corrige los errores antes de continuar');
                                                    return;
                                                }
                                                try {
                                                    const programaFinal = createForm.programa === '__otro__' ? createForm.programaOtro.trim() : createForm.programa;
                                                    const res = await fetch('http://localhost:5000/usuarios', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            nombre: createForm.nombre.trim(),
                                                            correo: createForm.correo.trim(),
                                                            contraseña: createForm.contrasena,
                                                            rol: createForm.rol,
                                                            telefono: createForm.telefono,
                                                            direccion: createForm.direccion.trim(),
                                                            programa: programaFinal
                                                        })
                                                    });
                                                    if (!res.ok) {
                                                        const err = await res.json().catch(()=>({error:'Error creando usuario'}));
                                                        throw new Error(err.error || 'Error creando usuario');
                                                    }
                                                    setShowCreateUser(false);
                                                    setCreateForm({ nombre:'', correo:'', rol:'Estudiante', contrasena:'', telefono:'', direccion:'', programa:'', programaOtro:'' });
                                                    setCreateFieldErrors({});
                                                    setUsersRefresh(x=>x+1);
                                                    // Mostrar notificación de éxito
                                                    setToast({ type: 'success', message: 'Usuario creado correctamente' });
                                                    setTimeout(() => setToast(null), 3000);
                                                } catch (e) {
                                                    setCreateError(e.message || 'Error en el servidor');
                                                    setToast({ type: 'error', message: e.message || 'Error creando usuario' });
                                                    setTimeout(() => setToast(null), 4000);
                                                }
                                            }}>Crear</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {showEditModal && editUser && (
                                <div className="modal-overlay" role="dialog" aria-modal="true">
                                    <div className={`modal-card ${viewOnly ? 'view-only-mode' : ''}`}>
                                        <div className="modal-header">
                                            <h3 style={{margin:0}}>{viewOnly ? 'Detalle de Usuario' : 'Editar Usuario'}</h3>
                                            <button className="icon-btn" onClick={()=>{ setShowEditModal(false); setEditUser(null); setViewOnly(false); }} title="Cerrar">✖</button>
                                        </div>
                                        <div className="modal-body">
                                            {toast?.type==='error' && <div className="form-error">{toast.message}</div>}
                                            <div className="form-grid">
                                                <label>
                                                    <span>Nombre <span className="required">*</span></span>
                                                    {viewOnly ? (
                                                        <input value={editUser.nombre} readOnly />
                                                    ) : (
                                                        <input value={editUser.nombre} onChange={(e)=>setEditUser({...editUser, nombre:e.target.value})} />
                                                    )}
                                                    {editFormErrors.nombre && <small className="field-error">{editFormErrors.nombre}</small>}
                                                </label>
                                                <label>
                                                    <span>Correo <span className="required">*</span></span>
                                                    {viewOnly ? (
                                                        <input type="email" value={editUser.correo} readOnly />
                                                    ) : (
                                                        <input type="email" value={editUser.correo} onChange={(e)=>setEditUser({...editUser, correo:e.target.value})} />
                                                    )}
                                                    {editFormErrors.correo && <small className="field-error">{editFormErrors.correo}</small>}
                                                </label>
                                                <label>
                                                    <span>Rol <span className="required">*</span></span>
                                                    {viewOnly ? (
                                                        <input value={editUser.rol} readOnly />
                                                    ) : (
                                                        <select value={editUser.rol} onChange={(e)=>setEditUser({...editUser, rol:e.target.value})}>
                                                            <option>Estudiante</option>
                                                            <option>Profesor</option>
                                                            <option>Administrador</option>
                                                            <option>Director de Programa Académico</option>
                                                        </select>
                                                    )}
                                                    {editFormErrors.rol && <small className="field-error">{editFormErrors.rol}</small>}
                                                </label>
                                                <label>
                                                    <span>Teléfono <span className="required">*</span></span>
                                                    {viewOnly ? (
                                                        <input value={editUser.telefono || ''} readOnly />
                                                    ) : (
                                                        <input value={editUser.telefono || ''} onChange={(e)=>setEditUser({...editUser, telefono:e.target.value.replace(/\D/g,'')})} maxLength={10} />
                                                    )}
                                                    {editFormErrors.telefono && <small className="field-error">{editFormErrors.telefono}</small>}
                                                </label>
                                                <label>
                                                    <span>Dirección <span className="required">*</span></span>
                                                    {viewOnly ? (
                                                        <input value={editUser.direccion || ''} readOnly />
                                                    ) : (
                                                        <input value={editUser.direccion || ''} onChange={(e)=>setEditUser({...editUser, direccion:e.target.value})} />
                                                    )}
                                                    {editFormErrors.direccion && <small className="field-error">{editFormErrors.direccion}</small>}
                                                </label>
                                                <label>
                                                    <span>Programa <span className="required">*</span></span>
                                                    {viewOnly ? (
                                                        <input value={editUser.programa || ''} readOnly />
                                                    ) : (
                                                        programas.length > 0 ? (
                                                            <>
                                                                <select
                                                                    value={programas.includes(editUser.programa || '') ? (editUser.programa || '') : '__otro__'}
                                                                    onChange={(e)=>{
                                                                        const v = e.target.value;
                                                                        if (v === '__otro__') {
                                                                            setEditUser({...editUser, programa: '__otro__'});
                                                                        } else {
                                                                            setEditUser({...editUser, programa: v});
                                                                            setEditProgramaOtro('');
                                                                        }
                                                                    }}
                                                                >
                                                                    <option value="">Selecciona...</option>
                                                                    {programas.map((p,i)=>(<option key={i} value={p}>{p}</option>))}
                                                                    <option value="__otro__">Otro (escribir nuevo)</option>
                                                                </select>
                                                                {(!programas.includes(editUser.programa || '') || (editUser.programa === '__otro__')) && (
                                                                    <input
                                                                        value={editProgramaOtro}
                                                                        onChange={(e)=>setEditProgramaOtro(e.target.value)}
                                                                        placeholder="Escribe el programa"
                                                                        style={{marginTop:'8px'}}
                                                                    />
                                                                )}
                                                            </>
                                                        ) : (
                                                            <input value={editUser.programa || ''} onChange={(e)=>setEditUser({...editUser, programa:e.target.value})} />
                                                        )
                                                    )}
                                                    {editFormErrors.programa && <small className="field-error">{editFormErrors.programa}</small>}
                                                </label>
                                                {!viewOnly && (
                                                    <label style={{gridColumn:'span 2'}}>
                                                        <span>Contraseña (deja vacío si no cambias)</span>
                                                        <input
                                                            type="password"
                                                            value={editUser.contraseña || ''}
                                                            onChange={(e)=>setEditUser({...editUser, contraseña:e.target.value})}
                                                            placeholder="Opcional"
                                                        />
                                                        {editFormErrors.contraseña && <small className="field-error">{editFormErrors.contraseña}</small>}
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button className="btn-secondary" onClick={()=>{ setShowEditModal(false); setEditUser(null); setViewOnly(false); }}>Cerrar</button>
                                            {!viewOnly && (
                                            <button className="btn-primary" onClick={async ()=>{
                                                const errors = {};
                                                const emailRegex = /^[^@\s]+@somospensadores\.edu\.co$/i;
                                                if (!editUser.nombre.trim()) errors.nombre = 'Nombre obligatorio';
                                                if (!editUser.correo.trim()) errors.correo = 'Correo obligatorio';
                                                else if (!emailRegex.test(editUser.correo.trim())) errors.correo = 'Dominio inválido';
                                                if (!editUser.rol) errors.rol = 'Rol obligatorio';
                                                if (!editUser.telefono) errors.telefono = 'Teléfono es obligatorio';
                                                else if (!/^\d{10}$/.test(editUser.telefono)) errors.telefono = 'Teléfono debe tener 10 dígitos';
                                                if (!editUser.direccion || !editUser.direccion.trim()) errors.direccion = 'Dirección obligatoria';
                                                const programaFinalValid = (editUser.programa === '__otro__' || !programas.includes(editUser.programa || '')) ? (editProgramaOtro || '').trim() : (editUser.programa || '').trim();
                                                if (!programaFinalValid) errors.programa = 'Programa obligatorio';
                                                if (editUser.contraseña && editUser.contraseña.length < 6) errors.contraseña = 'Mínimo 6 caracteres';
                                                setEditFormErrors(errors);
                                                if (Object.keys(errors).length) { setToast({ type:'error', message:'Corrige los errores'}); setTimeout(()=>setToast(null),3000); return; }
                                                try {
                                                    const programaFinal = (editUser.programa === '__otro__' || !programas.includes(editUser.programa || ''))
                                                        ? (editProgramaOtro || '').trim()
                                                        : (editUser.programa || '').trim();
                                                    const payload = {
                                                        nombre: editUser.nombre.trim(),
                                                        correo: editUser.correo.trim(),
                                                        rol: editUser.rol,
                                                        telefono: editUser.telefono || null,
                                                        direccion: editUser.direccion || null,
                                                        programa: programaFinal || null
                                                    };
                                                    if (editUser.contraseña) payload.contraseña = editUser.contraseña;
                                                    const res = await fetch(`http://localhost:5000/usuarios/${editUser.id}`, {
                                                        method:'PUT',
                                                        headers:{'Content-Type':'application/json'},
                                                        body: JSON.stringify(payload)
                                                    });
                                                    if (!res.ok) {
                                                        const err = await res.json().catch(()=>({error:'Error actualizando'}));
                                                        throw new Error(err.error || 'Error actualizando');
                                                    }
                                                    setShowEditModal(false);
                                                    setEditUser(null);
                                                    setUsersRefresh(x=>x+1);
                                                    setToast({ type:'success', message:'Usuario actualizado' });
                                                    setTimeout(()=>setToast(null),2500);
                                                } catch(e){
                                                    setToast({ type:'error', message: e.message });
                                                    setTimeout(()=>setToast(null),3500);
                                                }
                                            }}>Guardar Cambios</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {showDeleteModal && deleteUser && (
                                <div className="modal-overlay" role="dialog" aria-modal="true">
                                    <div className="modal-card modal-delete" style={{maxWidth:'560px'}}>
                                        <div className="modal-header">
                                            <h3 style={{margin:0}}>Eliminar Usuario</h3>
                                            <button className="icon-btn" onClick={()=>{ setShowDeleteModal(false); setDeleteUser(null); }} title="Cerrar">✖</button>
                                        </div>
                                        <div className="modal-body">
                                            <p style={{fontSize:'0.85rem',color:'#374151',lineHeight:1.4}}>¿Eliminar a <strong>{deleteUser.nombre}</strong>? Esta acción no se puede deshacer. Si tiene inscripciones o cursos asignados no se podrá eliminar.</p>
                                        </div>
                                        <div className="modal-footer modal-delete-footer">
                                            <button className="btn-secondary btn-wide" onClick={()=>{ setShowDeleteModal(false); setDeleteUser(null); }}>Cancelar</button>
                                            <button className="btn-danger btn-wide" onClick={async ()=>{
                                                try {
                                                    const res = await fetch(`http://localhost:5000/usuarios/${deleteUser.id}`, { method:'DELETE' });
                                                    const data = await res.json().catch(()=>({}));
                                                    if (!res.ok) {
                                                        const base = data.error || 'Error eliminando';
                                                        let msg = base;
                                                        if (data.referencias) {
                                                            const ins = data.referencias.inscripciones ?? 0;
                                                            const cur = data.referencias.cursos ?? 0;
                                                            msg = `${base} (Inscripciones: ${ins}, Cursos: ${cur})`;
                                                        }
                                                        throw new Error(msg);
                                                    }
                                                    setShowDeleteModal(false);
                                                    setDeleteUser(null);
                                                    setUsersRefresh(x=>x+1);
                                                    setToast({ type:'success', message:'Usuario eliminado' });
                                                    setTimeout(()=>setToast(null),2500);
                                                } catch(e){
                                                    setToast({ type:'error', message:e.message });
                                                    setTimeout(()=>setToast(null),3500);
                                                }
                                            }}>Eliminar</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                ) : activePage === "courses" ? (
                    // Vista: Gestión de Cursos
                    <section className="courses-page-admin">
                        {/* Cabecera / breadcrumb */}
                        <div className="users-header">
                            <div className="users-breadcrumb">
                                <p className="breadcrumb-path">Inicio / Gestión de Cursos</p>
                                <h2 className="breadcrumb-title">Gestión de Cursos</h2>
                                <p className="breadcrumb-sub">Administra todos los cursos del sistema</p>
                            </div>
                        </div>

                        {/* Contadores superiores */}
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
                                    <FaCalendarAlt />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Total Estudiantes</p>
                                    <h2>{courses.reduce((acc,c)=>acc + parseInt(c.inscritos || 0),0)}</h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaUsers />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Promedio Créditos</p>
                                    <h2>{courses.length > 0 ? (courses.reduce((a,c)=>a+parseInt(c.creditos||0),0)/courses.length).toFixed(1) : 0}</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaClock />
                                </div>
                            </div>
                        </div>

                        {/* Panel de lista de cursos */}
                        <div className="users-panel">
                            <div className="users-panel-top">
                                <div style={{flex:1}}>
                                    <h3 style={{margin:0}}>Lista de Cursos</h3>
                                    <p style={{margin:'4px 0 0 0',fontSize:'0.75rem',color:'#64748b'}}>Administra todos los cursos del sistema</p>
                                </div>
                                <button className="btn-create">
                                    <FaPlus style={{marginRight:8}} /> Crear Curso
                                </button>
                            </div>

                            <div className="search-filter-bar">
                                <input
                                    className="search-input"
                                    placeholder="Buscar por nombre, código o profesor..."
                                    value={coursesQuery.q}
                                    onChange={(e)=>setCoursesQuery((s)=>({...s, q: e.target.value}))}
                                />
                                <select
                                    className="users-filter-select"
                                    value={coursesQuery.programa}
                                    onChange={(e)=>setCoursesQuery((s)=>({...s, programa: e.target.value}))}
                                >
                                    <option>Todos</option>
                                    {[...new Set(courses.map(c=>c.programa))].filter(Boolean).map(p=> (
                                        <option key={p}>{p}</option>
                                    ))}
                                </select>
                                <select
                                    className="users-filter-select"
                                    value={coursesQuery.periodo || 'Todos'}
                                    onChange={(e)=>setCoursesQuery((s)=>({...s, periodo: e.target.value}))}
                                >
                                    <option>Todos</option>
                                    {[...new Set(courses.flatMap(c => (c.periodos ? c.periodos.split(/,\s*/) : [])))].filter(Boolean).map(per => (
                                        <option key={per}>{per}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="users-table-wrapper">
                                <table className="users-table">
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
                                        {coursesLoading ? (
                                            <tr><td colSpan={7}>Cargando...</td></tr>
                                        ) : courses
                                            .filter(c=> coursesQuery.programa==='Todos' || c.programa===coursesQuery.programa)
                                            .filter(c=> coursesQuery.periodo==='Todos' || (c.periodos || '').split(/,\s*/).includes(coursesQuery.periodo))
                                            .filter(c=> {
                                                const q = coursesQuery.q.toLowerCase();
                                                return !q || c.nombre.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q) || (c.profesor||'').toLowerCase().includes(q);
                                            }).length === 0 ? (
                                            <tr><td colSpan={7}>Sin resultados</td></tr>
                                        ) : (
                                            courses
                                                .filter(c=> coursesQuery.programa==='Todos' || c.programa===coursesQuery.programa)
                                                .filter(c=> coursesQuery.periodo==='Todos' || (c.periodos || '').split(/,\s*/).includes(coursesQuery.periodo))
                                                .filter(c=> {
                                                    const q = coursesQuery.q.toLowerCase();
                                                    return !q || c.nombre.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q) || (c.profesor||'').toLowerCase().includes(q);
                                                })
                                                .map((c)=>{
                                                    const pct = c.cupo ? Math.round((parseInt(c.inscritos||0)/parseInt(c.cupo))*100) : 0;
                                                    return (
                                                        <tr key={c.id}>
                                                            <td>
                                                                <div className="user-cell">
                                                                    <strong>{c.nombre}</strong>
                                                                    <small>{c.codigo}</small>
                                                                </div>
                                                            </td>
                                                            <td>{c.profesor || 'Sin asignar'}</td>
                                                            <td>
                                                                <div className="user-cell">
                                                                    <span>{c.programa}</span>
                                                                    <small>Semestre {c.semestre}</small>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                                                                    <span>{c.inscritos || 0}/{c.cupo}</span>
                                                                    <div className="progress"><div className="progress-bar" style={{width: pct+'%'}} /></div>
                                                                </div>
                                                            </td>
                                                            <td><span className="pill">{c.creditos}</span></td>
                                                            <td><span className={c.estado==='activo' ? 'pill pill-active' : 'pill pill-inactive'}>{c.estado}</span></td>
                                                            <td>
                                                                <div className="row-actions">
                                                                    <button className="icon-btn" title="Ver">👁️</button>
                                                                    <button className="icon-btn" title="Editar">✏️</button>
                                                                    <button className="icon-btn" title="Eliminar">🗑️</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                ) : activePage === "inscripciones" ? (
                    
                    <section className="inscripciones-page-admin">
                        {/* Cabecera / breadcrumb */}
                        <div className="users-header">
                            <div className="users-breadcrumb">
                                <p className="breadcrumb-path">Inicio / Gestión de Inscripciones</p>
                                <h2 className="breadcrumb-title">Gestión de Inscripciones</h2>
                                <p className="breadcrumb-sub">Administra todas las inscripciones del sistema</p>
                            </div>
                        </div>

                        {/* Contadores superiores */}
                        <div className="users-cards">
                            <div className="stat-card">
                                <div>
                                    <p>Total Inscripciones</p>
                                    <h2>{inscripciones.length}</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaClipboardList />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Aprobadas</p>
                                    <h2>{inscripciones.filter(i=>i.estado==='aprobada').length}</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaCheckCircle />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Pendientes</p>
                                    <h2>{inscripciones.filter(i=>i.estado==='pendiente').length}</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaClock />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Rechazadas</p>
                                    <h2>{inscripciones.filter(i=>i.estado==='rechazada').length}</h2>
                                </div>
                                <div className="icon-box red">
                                    <FaTimesCircle />
                                </div>
                            </div>
                        </div>

                        {/* Panel de lista de inscripciones */}
                        <div className="users-panel">
                            <div className="users-panel-top">
                                <div style={{flex:1}}>
                                    <h3 style={{margin:0}}>Lista de Inscripciones</h3>
                                    <p style={{margin:'4px 0 0 0',fontSize:'0.75rem',color:'#64748b'}}>Administra todas las inscripciones del sistema</p>
                                </div>
                                <button className="btn-create"><FaPlus /> Nueva Inscripción</button>
                            </div>

                            <div className="search-filter-bar">
                                <input
                                    className="search-input"
                                    type="text"
                                    placeholder="Buscar por estudiante, curso o código..."
                                    value={inscripcionesQuery.q}
                                    onChange={(e) => setInscripcionesQuery({...inscripcionesQuery, q: e.target.value})}
                                />
                                <select 
                                    className="users-filter-select"
                                    value={inscripcionesQuery.estado} 
                                    onChange={(e)=>setInscripcionesQuery({...inscripcionesQuery, estado: e.target.value})}
                                >
                                    <option>Todos</option>
                                    <option>aprobada</option>
                                    <option>pendiente</option>
                                    <option>rechazada</option>
                                </select>
                                <select 
                                    className="users-filter-select"
                                    value={inscripcionesQuery.programa} 
                                    onChange={(e)=>setInscripcionesQuery({...inscripcionesQuery, programa: e.target.value})}
                                >
                                    <option>Todos</option>
                                    {[...new Set(inscripciones.map(i=>i.programa))].filter(Boolean).map(p => (
                                        <option key={p}>{p}</option>
                                    ))}
                                </select>
                                <select 
                                    className="users-filter-select"
                                    value={inscripcionesQuery.periodo} 
                                    onChange={(e)=>setInscripcionesQuery({...inscripcionesQuery, periodo: e.target.value})}
                                >
                                    <option>Todos</option>
                                    {[...new Set(inscripciones.map(i=>i.periodo))].filter(Boolean).map(per => (
                                        <option key={per}>{per}</option>
                                    ))}
                                </select>
                                <select 
                                    className="users-filter-select"
                                    value={inscripcionesQuery.grupo} 
                                    onChange={(e)=>setInscripcionesQuery({...inscripcionesQuery, grupo: e.target.value})}
                                >
                                    <option>Todos</option>
                                    {[...new Set(inscripciones.map(i=>i.grupo))].filter(Boolean).map(g => (
                                        <option key={g}>{g}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="users-table-wrapper">
                                <table className="users-table">
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
                                        {inscripcionesLoading ? (
                                            <tr><td colSpan="6" style={{textAlign:'center'}}>Cargando...</td></tr>
                                        ) : inscripciones.length === 0 ? (
                                            <tr><td colSpan="6" className="empty-msg">Sin resultados</td></tr>
                                        ) : (
                                            inscripciones
                                                .filter(i => {
                                                    const q = inscripcionesQuery.q.toLowerCase();
                                                    const matchQ = !q || 
                                                        i.estudiante_nombre?.toLowerCase().includes(q) ||
                                                        i.estudiante_email?.toLowerCase().includes(q) ||
                                                        i.curso_nombre?.toLowerCase().includes(q) ||
                                                        i.curso_codigo?.toLowerCase().includes(q);
                                                    const matchEstado = inscripcionesQuery.estado === 'Todos' || i.estado === inscripcionesQuery.estado;
                                                    const matchPrograma = inscripcionesQuery.programa === 'Todos' || i.programa === inscripcionesQuery.programa;
                                                    const matchPeriodo = inscripcionesQuery.periodo === 'Todos' || i.periodo === inscripcionesQuery.periodo;
                                                    const matchGrupo = inscripcionesQuery.grupo === 'Todos' || i.grupo === inscripcionesQuery.grupo;
                                                    return matchQ && matchEstado && matchPrograma && matchPeriodo && matchGrupo;
                                                })
                                                .map(i => {
                                                    const fechaInsc = new Date(i.fecha_inscripcion).toLocaleDateString('es-ES');
                                                    const fechaAprobada = i.fecha_aprobacion ? new Date(i.fecha_aprobacion).toLocaleDateString('es-ES') : null;
                                                    return (
                                                        <tr key={i.id}>
                                                            <td>
                                                                <div className="user-cell">
                                                                    <strong>{i.estudiante_nombre}</strong>
                                                                    <small>{i.estudiante_email}</small>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="user-cell">
                                                                    <strong>{i.curso_nombre}</strong>
                                                                    <small>{i.curso_codigo} - Prof. {i.profesor_nombre || 'N/A'}</small>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="user-cell">
                                                                    <span>{i.programa}</span>
                                                                    <small>Semestre {i.semestre}</small>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="user-cell">
                                                                    <span>{fechaInsc}</span>
                                                                    {fechaAprobada && <small>Aprobada: {fechaAprobada}</small>}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className={
                                                                    i.estado === 'aprobada' ? 'pill pill-estado-aprobada' :
                                                                    i.estado === 'pendiente' ? 'pill pill-estado-pendiente' :
                                                                    'pill pill-estado-rechazada'
                                                                }>
                                                                    {i.estado}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="row-actions">
                                                                    {i.estado === 'pendiente' && (
                                                                        <>
                                                                            <button className="icon-btn" title="Aprobar">✅</button>
                                                                            <button className="icon-btn" title="Rechazar">❌</button>
                                                                        </>
                                                                    )}
                                                                    <button className="icon-btn" title="Ver">👁️</button>
                                                                    <button className="icon-btn" title="Eliminar">🗑️</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                ) : activePage === "calificaciones" ? (
                    
                    <section className="calificaciones-page-admin">
                        {/* Cabecera / breadcrumb */}
                        <div className="users-header">
                            <div className="users-breadcrumb">
                                <p className="breadcrumb-path">Inicio / Gestión de Calificaciones</p>
                                <h2 className="breadcrumb-title">Gestión de Calificaciones</h2>
                                <p className="breadcrumb-sub">Gestiona las calificaciones académicas</p>
                            </div>
                        </div>

                        {/* Contadores superiores */}
                        <div className="users-cards">
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
                                    <h2>
                                        {calificaciones.length > 0 
                                            ? (calificaciones.reduce((acc,c)=>acc+parseFloat(c.porcentaje||0),0)/calificaciones.length).toFixed(1)
                                            : "0"
                                        }
                                    </h2>
                                </div>
                                <div className="icon-box green">
                                    <FaChartLine />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Calificación Más Alta</p>
                                    <h2>
                                        {calificaciones.length > 0
                                            ? Math.max(...calificaciones.map(c=>parseFloat(c.calificacion||0)))
                                            : "0"
                                        }
                                    </h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaChartBar />
                                </div>
                            </div>
                            <div className="stat-card">
                                <div>
                                    <p>Cursos Evaluados</p>
                                    <h2>{[...new Set(calificaciones.map(c=>c.curso))].length}</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaBookOpen />
                                </div>
                            </div>
                        </div>

                        {/* Panel de lista de calificaciones */}
                        <div className="users-panel">
                            <div className="users-panel-top">
                                <div style={{flex:1}}>
                                    <h3 style={{margin:0}}>Registro de Calificaciones</h3>
                                    <p style={{margin:'4px 0 0 0',fontSize:'0.75rem',color:'#64748b'}}>Gestión de evaluaciones y calificaciones</p>
                                </div>
                            </div>

                            <div className="search-filter-bar">
                                <input
                                    className="search-input"
                                    placeholder="Buscar por estudiante o curso..."
                                    value={calificacionesQuery.q}
                                    onChange={(e) => setCalificacionesQuery({...calificacionesQuery, q: e.target.value})}
                                />
                                <select 
                                    className="users-filter-select"
                                    value={calificacionesQuery.curso} 
                                    onChange={(e)=>setCalificacionesQuery({...calificacionesQuery, curso: e.target.value})}
                                >
                                    <option>Todos</option>
                                    {[...new Set(calificaciones.map(c=>c.curso))].filter(Boolean).map(curso => (
                                        <option key={curso}>{curso}</option>
                                    ))}
                                </select>
                                <select 
                                    className="users-filter-select"
                                    value={calificacionesQuery.evaluacion} 
                                    onChange={(e)=>setCalificacionesQuery({...calificacionesQuery, evaluacion: e.target.value})}
                                >
                                    <option>Todos</option>
                                    <option>Parcial 1</option>
                                    <option>Parcial 2</option>
                                    <option>Proyecto</option>
                                    <option>Final</option>
                                </select>
                            </div>

                            <div className="users-table-wrapper">
                                <table className="users-table">
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
                                        {calificacionesLoading ? (
                                            <tr><td colSpan="8" style={{textAlign:'center'}}>Cargando...</td></tr>
                                        ) : calificaciones.length === 0 ? (
                                            <tr><td colSpan="8" style={{textAlign:'center',color:'#64748b'}}>Sin resultados</td></tr>
                                        ) : (
                                            calificaciones
                                                .filter(c => {
                                                    const q = calificacionesQuery.q.toLowerCase();
                                                    const matchQ = !q || 
                                                        c.estudiante?.toLowerCase().includes(q) ||
                                                        c.curso?.toLowerCase().includes(q) ||
                                                        c.codigo?.toLowerCase().includes(q);
                                                    const matchCurso = calificacionesQuery.curso === 'Todos' || c.curso === calificacionesQuery.curso;
                                                    const matchEval = calificacionesQuery.evaluacion === 'Todos' || c.evaluacion === calificacionesQuery.evaluacion;
                                                    return matchQ && matchCurso && matchEval;
                                                })
                                                .map(c => {
                                                    const fecha = new Date(c.fecha).toLocaleDateString('es-ES');
                                                    return (
                                                        <tr key={c.id}>
                                                            <td>{c.estudiante}</td>
                                                            <td>
                                                                <div className="user-cell">
                                                                    <strong>{c.curso}</strong>
                                                                    <small>{c.codigo}</small>
                                                                </div>
                                                            </td>
                                                            <td>{c.evaluacion}</td>
                                                            <td>
                                                                <span style={{color:'#3b82f6',fontWeight:'600'}}>
                                                                    {c.calificacion}/{c.sobre}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span style={{color:'#10b981',fontWeight:'600'}}>
                                                                    {c.porcentaje}%
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`pill-letra pill-letra-${c.letra}`}>
                                                                    {c.letra}
                                                                </span>
                                                            </td>
                                                            <td>{fecha}</td>
                                                            <td>
                                                                <div className="row-actions">
                                                                    <button className="icon-btn" title="Editar">✏️</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                ) : activePage === "asistencia" ? (
                    <section className="asistencia-page-admin">
                        {/* Cabecera / breadcrumb */}
                        <div className="users-header">
                            <div className="users-breadcrumb">
                                <p className="breadcrumb-path">Inicio / Gestión de Asistencia</p>
                                <h2 className="breadcrumb-title">Gestión de Asistencia</h2>
                                <p className="breadcrumb-sub">Gestiona el registro de asistencia</p>
                            </div>
                        </div>

                        {/* Métricas */}
                        {(() => {
                            const total = asistencias.length;
                            const presentes = asistencias.filter(a => a.estado === 'presente').length;
                            const ausentes = asistencias.filter(a => a.estado === 'ausente').length;
                            const asistidos = asistencias.filter(a => a.estado === 'presente' || a.estado === 'tardanza').length;
                            const porcentaje = total > 0 ? ((asistidos / total) * 100).toFixed(1) : '0.0';
                            return (
                                <div className="users-cards">
                                    <div className="stat-card">
                                        <div>
                                            <p>Total Clases</p>
                                            <h2>{total}</h2>
                                        </div>
                                        <div className="icon-box blue"><FaCalendarAlt /></div>
                                    </div>
                                    <div className="stat-card">
                                        <div>
                                            <p>Asistencia (%)</p>
                                            <h2 style={{color:'#059669'}}>{porcentaje}%</h2>
                                        </div>
                                        <div className="icon-box green"><FaChartLine /></div>
                                    </div>
                                    <div className="stat-card">
                                        <div>
                                            <p>Presentes</p>
                                            <h2>{presentes}</h2>
                                        </div>
                                        <div className="icon-box green"><FaCheckCircle /></div>
                                    </div>
                                    <div className="stat-card">
                                        <div>
                                            <p>Ausencias</p>
                                            <h2 style={{color:'#dc2626'}}>{ausentes}</h2>
                                        </div>
                                        <div className="icon-box red"><FaTimesCircle /></div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Panel registro asistencia */}
                        <div className="users-panel">
                            <div className="users-panel-top">
                                <div style={{flex:1}}>
                                    <h3 style={{margin:0}}>Registro de Asistencia</h3>
                                    <p style={{margin:'4px 0 0 0',fontSize:'0.75rem',color:'#64748b'}}>Control de asistencia de estudiantes</p>
                                </div>
                            </div>

                            <div className="search-filter-bar">
                                <input
                                    className="search-input"
                                    placeholder="Buscar por estudiante o curso..."
                                    value={asistenciasQuery.q}
                                    onChange={(e)=>setAsistenciasQuery({...asistenciasQuery, q: e.target.value})}
                                />
                                <select
                                    className="users-filter-select"
                                    value={asistenciasQuery.curso}
                                    onChange={(e)=>setAsistenciasQuery({...asistenciasQuery, curso: e.target.value})}
                                >
                                    <option>Todos</option>
                                    {[...new Set(asistencias.map(a=>a.curso))].filter(Boolean).map(c => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>
                                <select
                                    className="users-filter-select"
                                    value={asistenciasQuery.estado}
                                    onChange={(e)=>setAsistenciasQuery({...asistenciasQuery, estado: e.target.value})}
                                >
                                    <option>Todos</option>
                                    <option>presente</option>
                                    <option>tardanza</option>
                                    <option>ausente</option>
                                </select>
                            </div>

                            <div className="users-table-wrapper">
                                <table className="users-table">
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
                                        {asistenciasLoading ? (
                                            <tr><td colSpan="6" style={{textAlign:'center'}}>Cargando...</td></tr>
                                        ) : asistencias.length === 0 ? (
                                            <tr><td colSpan="6" style={{textAlign:'center',color:'#64748b'}}>Sin resultados</td></tr>
                                        ) : (
                                            asistencias
                                                .filter(a => {
                                                    const q = asistenciasQuery.q.toLowerCase();
                                                    const matchQ = !q || a.estudiante?.toLowerCase().includes(q) || a.curso?.toLowerCase().includes(q) || a.codigo?.toLowerCase().includes(q);
                                                    const matchCurso = asistenciasQuery.curso === 'Todos' || a.curso === asistenciasQuery.curso;
                                                    const matchEstado = asistenciasQuery.estado === 'Todos' || a.estado === asistenciasQuery.estado;
                                                    return matchQ && matchCurso && matchEstado;
                                                })
                                                .map(a => {
                                                    const fecha = new Date(a.fecha).toLocaleDateString('es-ES');
                                                    return (
                                                        <tr key={a.id}>
                                                            <td>{a.estudiante}</td>
                                                            <td>
                                                                <div className="user-cell">
                                                                    <strong>{a.curso}</strong>
                                                                    <small>{a.codigo}</small>
                                                                </div>
                                                            </td>
                                                            <td>{fecha}</td>
                                                            <td>{a.horario}</td>
                                                            <td>
                                                                <span className={
                                                                    a.estado === 'presente' ? 'pill-asistencia-presente' :
                                                                    a.estado === 'tardanza' ? 'pill-asistencia-tardanza' : 'pill-asistencia-ausente'
                                                                }>{a.estado}</span>
                                                            </td>
                                                            <td>{a.profesor || 'N/A'}</td>
                                                        </tr>
                                                    );
                                                })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                ) : activePage === "horarios" ? (
                    <section className="horarios-page-admin">
                        {/* Cabecera / breadcrumb */}
                        <div className="users-header">
                            <div className="users-breadcrumb">
                                <p className="breadcrumb-path">Inicio / Gestión de Horarios</p>
                                <h2 className="breadcrumb-title">Gestión de Horarios</h2>
                                <p className="breadcrumb-sub">Gestión de horarios académicos</p>
                            </div>
                        </div>

                        {/* Métricas */}
                        {(() => {
                            const total = horarios.length;
                            const cursosActivos = new Set(horarios.filter(h=>h.estado==='activo').map(h=>h.curso)).size || new Set(horarios.map(h=>h.curso)).size;
                            const horas = horarios.reduce((acc,h)=>{
                                const m = /^(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/.exec(h.horario || '');
                                if(!m) return acc;
                                const ini = parseInt(m[1])*60 + parseInt(m[2]);
                                const fin = parseInt(m[3])*60 + parseInt(m[4]);
                                return acc + Math.max(0,(fin-ini)/60);
                            },0);
                            const aulas = new Set(horarios.map(h=>h.aula).filter(Boolean)).size;
                            return (
                                <div className="users-cards">
                                    <div className="stat-card"><div><p>Total Clases/Semana</p><h2>{total}</h2></div><div className="icon-box blue"><FaCalendarAlt/></div></div>
                                    <div className="stat-card"><div><p>Cursos Activos</p><h2>{cursosActivos}</h2></div><div className="icon-box green"><FaBookOpen/></div></div>
                                    <div className="stat-card"><div><p>Horas/Semana</p><h2>{Math.round(horas)}h</h2></div><div className="icon-box purple"><FaClock/></div></div>
                                    <div className="stat-card"><div><p>Aulas Diferentes</p><h2>{aulas}</h2></div><div className="icon-box orange"><FaChartBar/></div></div>
                                </div>
                            );
                        })()}

                        {/* Filtros */}
                        <div className="users-panel" style={{marginBottom:18}}>
                            <div className="users-panel-top">
                                <div style={{flex:1}}>
                                    <h3 style={{margin:0}}>Filtros</h3>
                                    <p style={{margin:'4px 0 0 0',fontSize:'0.75rem',color:'#64748b'}}>Refina la visualización del horario semanal</p>
                                </div>
                            </div>
                            <div className="search-filter-bar">
                                <select className="users-filter-select" value={horariosQuery.dia} onChange={(e)=>setHorariosQuery({...horariosQuery,dia:e.target.value})}>
                                    <option>Todos</option>
                                    {['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].map(d=> <option key={d}>{d}</option>)}
                                </select>
                                <select className="users-filter-select" value={horariosQuery.programa} onChange={(e)=>setHorariosQuery({...horariosQuery,programa:e.target.value})}>
                                    <option>Todos</option>
                                    {[...new Set(horarios.map(h=>h.programa))].filter(Boolean).map(p=> <option key={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Grid semanal */}
                        <div className="schedule-grid">
                            {['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].map(dia => {
                                const clasesDia = horarios
                                    .filter(h => (horariosQuery.dia==='Todos' || h.dia===horariosQuery.dia))
                                    .filter(h => (horariosQuery.programa==='Todos' || h.programa===horariosQuery.programa))
                                    .filter(h => h.dia === dia);
                                return (
                                    <div className="schedule-day" key={dia}>
                                        <h4 className="schedule-day-title">{dia}</h4>
                                        <div className="day-cards">
                                            {horariosLoading ? (
                                                <div className="class-empty">Cargando...</div>
                                                ) : clasesDia.length === 0 ? (
                                                <div className="class-empty">Sin resultados</div>
                                            ) : (
                                                clasesDia.map(h => {
                                                    const dayMap = { 'Lunes':'lunes', 'Martes':'martes', 'Miércoles':'miercoles', 'Jueves':'jueves', 'Viernes':'viernes', 'Sábado':'sabado' };
                                                    const dayClass = dayMap[h.dia] || (h.dia || '').toLowerCase();
                                                    return (
                                                    <div className={`class-card day-${dayClass}`} key={h.id}>
                                                        <div className="class-main">
                                                            <span className="code-pill">{h.codigo}</span>
                                                            <div className="user-cell">
                                                                <strong>{h.curso}</strong>
                                                                <small>Prof. {h.profesor || 'N/A'}</small>
                                                                <small>{h.aula}</small>
                                                            </div>
                                                        </div>
                                                        <div className="class-time">{h.horario}</div>
                                                    </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ) : activePage === "reportes" ? (
                    <section className="reportes-page-admin">
                        {/* Cabecera / breadcrumb */}
                        <div className="users-header">
                            <div className="users-breadcrumb">
                                <p className="breadcrumb-path">Inicio / Gestión de Reportes</p>
                                <h2 className="breadcrumb-title">Gestión de Reportes</h2>
                                <p className="breadcrumb-sub">Genera reportes institucionales y análisis de datos</p>
                            </div>
                        </div>

                        {/* Métricas */}
                        {(() => {
                            const total = reportes.length;
                            const academicos = reportes.filter(r=>r.categoria==='académico').length;
                            const administrativos = reportes.filter(r=>r.categoria==='administrativo').length;
                            const financieros = reportes.filter(r=>r.categoria==='financiero').length;
                            return (
                                <div className="users-cards">
                                    <div className="stat-card"><div><p>Reportes Disponibles</p><h2>{total}</h2></div><div className="icon-box blue"><FaClipboardList/></div></div>
                                    <div className="stat-card"><div><p>Académicos</p><h2>{academicos}</h2></div><div className="icon-box green"><FaChartBar/></div></div>
                                    <div className="stat-card"><div><p>Administrativos</p><h2>{administrativos}</h2></div><div className="icon-box purple"><FaUsers/></div></div>
                                    <div className="stat-card"><div><p>Financieros</p><h2>{financieros}</h2></div><div className="icon-box orange"><FaClock/></div></div>
                                </div>
                            );
                        })()}

                        {/* Filtros */}
                        <div className="users-panel" style={{marginBottom:18}}>
                            <div className="users-panel-top">
                                <div style={{flex:1}}>
                                    <h3 style={{margin:0}}>Catálogo de Reportes</h3>
                                    <p style={{margin:'4px 0 0 0',fontSize:'0.75rem',color:'#64748b'}}>Selecciona y genera los reportes que necesitas</p>
                                </div>
                            </div>
                            <div className="reportes-filtros">
                                <select className="users-filter-select" value={reportesQuery.categoria} onChange={(e)=>setReportesQuery({...reportesQuery,categoria:e.target.value})}>
                                    <option>Todos</option>
                                    <option>académico</option>
                                    <option>administrativo</option>
                                    <option>financiero</option>
                                </select>
                                <select className="users-filter-select" value={reportesQuery.formato} onChange={(e)=>setReportesQuery({...reportesQuery,formato:e.target.value})}>
                                    <option>Todos</option>
                                    <option>PDF</option>
                                    <option>Excel</option>
                                </select>
                            </div>
                        </div>

                        {/* Grid catálogo */}
                        <div className="reportes-grid">
                            {reportesLoading ? (
                                <div className="reporte-card" style={{gridColumn:'1 / -1'}}>Cargando catálogo...</div>
                            ) : reportes
                                .filter(r => reportesQuery.categoria==='Todos' || r.categoria===reportesQuery.categoria)
                                .filter(r => reportesQuery.formato==='Todos' || r.formato===reportesQuery.formato)
                                .map(r => (
                                    <div className="reporte-card" key={r.id}>
                                        <div className="reporte-header">
                                            <h4 className="reporte-title">{r.titulo}</h4>
                                            <span className={`badge-formato badge-formato-${r.formato.toLowerCase()}`}>{r.formato}</span>
                                        </div>
                                        <p className="reporte-desc">{r.descripcion}</p>
                                        <div className="reporte-meta">
                                            <span className={`badge-cat ${r.categoria}`}>{r.categoria}</span>
                                            <span className="badge-frecuencia">{r.frecuencia}</span>
                                        </div>
                                        <div className="reporte-footer">
                                            <small style={{color:'#64748b',fontSize:'0.6rem'}}>Frecuencia: {r.frecuencia}</small>
                                            <button className="btn-generar" onClick={()=> console.log('Generar reporte', r.id)}>📥 Generar</button>
                                        </div>
                                    </div>
                                ))}
                            {(!reportesLoading && reportes.length === 0) && (
                                <div className="reporte-card" style={{gridColumn:'1 / -1'}}>Sin resultados</div>
                            )}
                        </div>
                    </section>
                ) : (
                    // Vista: Dashboard (Inicio)
                    <section className="dashboard-page">
                        {/* Cabecera / breadcrumb */}
                        <div className="users-header">
                            <div className="users-breadcrumb">
                                <p className="breadcrumb-path">Panel de Administración</p>
                                <h2 className="breadcrumb-title">¡Hola, {usuario.nombre || "Usuario"}!</h2>
                                <p className="breadcrumb-sub">Bienvenido al sistema académico SOMOSPENSADORES</p>
                            </div>
                        </div>

                        {/* Paneles de estadísticas principales (clickeables) */}
                        <div className="users-cards">
                            <div 
                                className="stat-card" 
                                style={{cursor:'pointer'}}
                                onClick={() => setActivePage("users")}
                            >
                                <div>
                                    <p>Total Usuarios</p>
                                    <h2>{counts.totalUsers?.toLocaleString() ?? "-"}</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaUsers />
                                </div>
                            </div>

                            <div 
                                className="stat-card"
                                style={{cursor:'pointer'}}
                                onClick={() => setActivePage("courses")}
                            >
                                <div>
                                    <p>Cursos Activos</p>
                                    <h2>{courses.filter(c=>c.estado==='activo').length}</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaBookOpen />
                                </div>
                            </div>

                            <div 
                                className="stat-card"
                                style={{cursor:'pointer'}}
                                onClick={() => setActivePage("users")}
                            >
                                <div>
                                    <p>Estudiantes</p>
                                    <h2>{counts.estudiantes?.toLocaleString() ?? "-"}</h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaGraduationCap />
                                </div>
                            </div>

                            <div 
                                className="stat-card"
                                style={{cursor:'pointer'}}
                                onClick={() => setActivePage("users")}
                            >
                                <div>
                                    <p>Profesores</p>
                                    <h2>{counts.profesores?.toLocaleString() ?? "-"}</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaUsers />
                                </div>
                            </div>
                        </div>

                        {/* Panel de Acciones Rápidas */}
                        <div className="users-panel">
                            <div className="users-panel-top">
                                <div style={{flex:1}}>
                                    <h3 style={{margin:0}}>Acciones Rápidas</h3>
                                    <p style={{margin:'4px 0 0 0',fontSize:'0.75rem',color:'#64748b'}}>Gestión del sistema académico</p>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <div className="action-card" onClick={() => setActivePage("users")}>
                                    <FaUserPlus className="action-icon blue" />
                                    <h4>Gestionar Usuarios</h4>
                                    <p>Administrar estudiantes y profesores</p>
                                </div>

                                <div className="action-card" onClick={() => setActivePage("courses")}>
                                    <FaPlus className="action-icon green" />
                                    <h4>Gestionar Cursos</h4>
                                    <p>Crear y administrar cursos</p>
                                </div>

                                <div className="action-card" onClick={() => setActivePage("inscripciones")}>
                                    <FaClipboardList className="action-icon purple" />
                                    <h4>Gestionar Inscripciones</h4>
                                    <p>Administrar matrículas</p>
                                </div>

                                <div className="action-card">
                                    <FaChartLine className="action-icon orange" />
                                    <h4>Generar Reportes</h4>
                                    <p>Informes institucionales</p>
                                </div>
                            </div>
                        </div>

                        {/* Panel de Actividad Reciente */}
                        <div className="users-panel" style={{marginTop:'20px'}}>
                            <div className="users-panel-top">
                                <div style={{flex:1}}>
                                    <h3 style={{margin:0}}>Actividad Reciente</h3>
                                    <p style={{margin:'4px 0 0 0',fontSize:'0.75rem',color:'#64748b'}}>Últimas acciones del sistema</p>
                                </div>
                            </div>

                            <div className="recent-activity-list">
                                <div className="activity-item">
                                    <span className="activity-icon">✅</span>
                                    <div>
                                        <strong>Nueva inscripción aprobada</strong>
                                        <small>Estudiante inscrito en Matemáticas Básicas — hace 2 horas</small>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <span className="activity-icon">📘</span>
                                    <div>
                                        <strong>Curso actualizado</strong>
                                        <small>Física I - Horario modificado — hace 5 horas</small>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <span className="activity-icon">👤</span>
                                    <div>
                                        <strong>Nuevo usuario registrado</strong>
                                        <small>Profesor agregado al sistema — hace 1 día</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
