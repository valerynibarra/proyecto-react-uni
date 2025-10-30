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
} from "react-icons/fa";
import confirmLogout from "../utils/confirmLogout";
import "./AdminPage.css";

const AdminPage = () => {
    const [usuario, setUsuario] = useState({ nombre: "", rol: "" });
    const [collapsed, setCollapsed] = useState(false);
    const [activePage, setActivePage] = useState("dashboard"); // "dashboard" | "users"

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

    return (
        <div className="admin-dashboard">
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
                            <li><FaBookOpen className="menu-icon" /><span className="menu-text">Gestión de Cursos</span></li>
                            <li><FaClipboardList className="menu-icon" /><span className="menu-text">Inscripciones</span></li>
                            <li><FaGraduationCap className="menu-icon" /><span className="menu-text">Calificaciones</span></li>
                            <li><FaCalendarAlt className="menu-icon" /><span className="menu-text">Asistencia</span></li>
                            <li><FaClock className="menu-icon" /><span className="menu-text">Horarios</span></li>
                            <li><FaChartBar className="menu-icon" /><span className="menu-text">Reportes</span></li>

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
                                <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>Inicio / Gestión de Usuarios</p>
                                <h2 style={{ margin: "8px 0 4px 0" }}>Gestión de Usuarios</h2>
                                <p style={{ margin: 0, color: "#6b7280" }}>Administra usuarios del sistema académico</p>
                            </div>
                        </div>

                        {/* Contadores superiores (reutilizan stat-card) */}
                        <div className="users-cards" style={{ display: "flex", gap: 14, margin: "18px 0 20px 0" }}>
                            <div className="stat-card" style={{ flex: "1 1 0" }}>
                                <div>
                                    <p>Total Usuarios</p>
                                    <h2>5</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaUsers />
                                </div>
                            </div>
                            <div className="stat-card" style={{ flex: "1 1 0" }}>
                                <div>
                                    <p>Estudiantes</p>
                                    <h2>2</h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaGraduationCap />
                                </div>
                            </div>
                            <div className="stat-card" style={{ flex: "1 1 0" }}>
                                <div>
                                    <p>Profesores</p>
                                    <h2>2</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaBookOpen />
                                </div>
                            </div>
                            <div className="stat-card" style={{ flex: "1 1 0" }}>
                                <div>
                                    <p>Administradores</p>
                                    <h2>1</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaUsers />
                                </div>
                            </div>
                        </div>

                        {/* Panel con búsqueda, filtro y botón crear */}
                        <div className="users-panel" style={{ background: "white", padding: 18, borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                            <div className="users-panel-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <input className="search-input" placeholder="Buscar por nombre o email..." style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }} />
                                </div>
                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <select style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                                        <option>Filtrar por rol</option>
                                        <option>Todos</option>
                                        <option>Estudiante</option>
                                        <option>Profesor</option>
                                        <option>Administrador</option>
                                    </select>
                                    <button className="btn-create" style={{ background: "#0a285d", color: "#fff", padding: "10px 14px", borderRadius: 8, border: "none" }}>
                                        <FaUserPlus style={{ marginRight: 8 }} /> Crear Usuario
                                    </button>
                                </div>
                            </div>

                            {/* Tabla de usuarios (ejemplo estático) */}
                            <div style={{ marginTop: 18 }}>
                                <table className="users-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Rol</th>
                                            <th>Programa/Especialización</th>
                                            <th>Estado</th>
                                            <th>Fecha de Registro</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <strong>María García López</strong>
                                                    <small style={{ color: "#6b7280" }}>m.garcia@somospensadores.edu.co</small>
                                                </div>
                                            </td>
                                            <td><span className="badge role-profesor">Profesor</span></td>
                                            <td>Matemáticas</td>
                                            <td><span className="badge status-active">activo</span></td>
                                            <td>14/1/2024</td>
                                            <td>👁️ ✏️ 🗑️</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <strong>Carlos Rodríguez Pérez</strong>
                                                    <small style={{ color: "#6b7280" }}>c.rodriguez@somospensadores.edu.co</small>
                                                </div>
                                            </td>
                                            <td><span className="badge role-estudiante">Estudiante</span></td>
                                            <td>Ingeniería de Sistemas</td>
                                            <td><span className="badge status-active">activo</span></td>
                                            <td>19/2/2024</td>
                                            <td>👁️ ✏️ 🗑️</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <strong>Patricia Morales Vega</strong>
                                                    <small style={{ color: "#6b7280" }}>p.morales@somospensadores.edu.co</small>
                                                </div>
                                            </td>
                                            <td><span className="badge role-admin">Administrador</span></td>
                                            <td>-</td>
                                            <td><span className="badge status-active">activo</span></td>
                                            <td>30/11/2023</td>
                                            <td>👁️ ✏️ 🗑️</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                ) : (
                    /* Inicio: contenido ORIGINAL sin cambios */
                    <>
                        <header className="header">
                            <h1>¡Bienvenido, {usuario.nombre || "Usuario"}!</h1>
                            <p>Panel de administración - Universidad SOMOSPENSADORES</p>
                        </header>

                        {/* Paneles de estadísticas */}
                        <section className="stats">
                            <div className="stat-card blue">
                                <div>
                                    <p>Total Usuarios</p>
                                    <h2>1,247</h2>
                                </div>
                                <div className="icon-box blue">
                                    <FaUsers />
                                </div>
                            </div>

                            <div className="stat-card green">
                                <div>
                                    <p>Cursos Activos</p>
                                    <h2>156</h2>
                                </div>
                                <div className="icon-box green">
                                    <FaBookOpen />
                                </div>
                            </div>

                            <div className="stat-card purple">
                                <div>
                                    <p>Estudiantes</p>
                                    <h2>1,089</h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaGraduationCap />
                                </div>
                            </div>

                            <div className="stat-card orange">
                                <div>
                                    <p>Profesores</p>
                                    <h2>87</h2>
                                </div>
                                <div className="icon-box orange">
                                    <FaUsers />
                                </div>
                            </div>
                        </section>

                        <hr className="divider" />

                        {/* Acciones rápidas */}
                        <section className="quick-actions">
                            <h3>Acciones Rápidas</h3>
                            <p>Gestión del sistema académico</p>

                            <div className="action-buttons">
                                <div className="action-card">
                                    <FaUserPlus className="action-icon blue" />
                                    <h4>Crear Usuario</h4>
                                    <p>Nuevo estudiante o profesor</p>
                                </div>

                                <div className="action-card">
                                    <FaPlus className="action-icon green" />
                                    <h4>Nuevo Curso</h4>
                                    <p>Crear curso académico</p>
                                </div>

                                <div className="action-card">
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
                        </section>

                        <hr className="divider" />

                        {/* Actividad reciente */}
                        <section className="recent-activity">
                            <h3>Actividad Reciente</h3>
                            <ul>
                                <li>✅ Nueva calificación registrada en Matemáticas Avanzadas — hace 2 horas</li>
                                <li>📘 Asistencia registrada para la clase de Física</li>
                            </ul>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
