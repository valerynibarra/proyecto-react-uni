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
import "./AdminPage.css";

const AdminPage = () => {
    const [usuario, setUsuario] = useState({ nombre: "", rol: "" });
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

    // 🔹 Mostrar confirmación antes de cerrar sesión
    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    // 🔹 Confirmar cierre de sesión
    const confirmLogout = () => {
        localStorage.removeItem("usuario");
        window.location.href = "/";
    };

    // 🔹 Cancelar cierre de sesión
    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar lateral */}
            <aside className="sidebar">
                <div>
                    <div className="sidebar-header">
                        <i className="fa-solid fa-building-columns sidebar-icon"></i>
                        <div className="sidebar-texts">
                            <h2>SOMOS PENSADORES</h2>
                            <p>Sistema Académico</p>
                        </div>
                    </div>

                    <hr className="sidebar-divider" />

                    <nav className="menu">
                        <ul>
                            <li className="active"><FaHome /> Inicio</li>
                            <li><FaUsers /> Gestión de Usuarios</li>
                            <li><FaBookOpen /> Gestión de Cursos</li>
                            <li><FaClipboardList /> Inscripciones</li>
                            <li><FaGraduationCap /> Calificaciones</li>
                            <li><FaCalendarAlt /> Asistencia</li>
                            <li><FaClock /> Horarios</li>
                            <li><FaChartBar /> Reportes</li>

                            {/* 🔹 Botón de cierre de sesión */}
                            <li className="logout" onClick={handleLogoutClick}>
                                <FaSignOutAlt /> Cerrar sesión
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Información del usuario */}
                <div className="user-info">
                    <div className="avatar">
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
                <header className="header">
                    <h1>¡Bienvenido, {usuario.nombre || "Usuario"}!</h1>
                    <p>Panel de administración - Universidad SOMOSPENSADORES</p>
                </header>

                {/* 🔹 Paneles de estadísticas */}
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

                {/* 🔹 Acciones rápidas */}
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

                {/* 🔹 Actividad reciente */}
                <section className="recent-activity">
                    <h3>Actividad Reciente</h3>
                    <ul>
                        <li>✅ Nueva calificación registrada en Matemáticas Avanzadas — hace 2 horas</li>
                        <li>📘 Asistencia registrada para la clase de Física</li>
                    </ul>
                </section>
            </main>

            {/* 🔹 Modal de confirmación de cierre de sesión */}
            {showLogoutConfirm && (
                <div className="logout-modal">
                    <div className="logout-modal-content">
                        <h3>¿Deseas cerrar sesión?</h3>
                        <p>Tu sesión actual se cerrará y volverás al inicio de sesión.</p>
                        <div className="logout-modal-buttons">
                            <button className="btn-cancel" onClick={cancelLogout}>Cancelar</button>
                            <button className="btn-confirm" onClick={confirmLogout}>Cerrar sesión</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
