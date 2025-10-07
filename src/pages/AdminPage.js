import React from "react";
import "./AdminPage.css";

const AdminPage = () => {
    return (
        <div className="admin-dashboard">
            {/* Panel lateral */}
            <aside className="sidebar">
                <div className="logo">
                    <i className="fa-solid fa-building-columns"></i>
                    <h2>SOMOS PENSADORES</h2>
                    <p>Sistema Académico</p>
                </div>

                <nav className="menu">
                    <ul>
                        <li className="active">🏠 Inicio</li>
                        <li>👥 Gestión de Usuarios</li>
                        <li>📚 Gestión de Cursos</li>
                        <li>📝 Inscripciones</li>
                        <li>🎓 Calificaciones</li>
                        <li>📅 Asistencia</li>
                        <li>🕒 Horarios</li>
                        <li>📑 Reportes</li>
                    </ul>
                </nav>

                <div className="user-info">
                    <div className="avatar">JCR</div>
                    <div>
                        <p className="user-name">Juan Carlos Rodríguez</p>
                        <p className="user-role">Administrador</p>
                    </div>
                </div>
            </aside>

            {/* Contenido principal */}
            <main className="main-content">
                <header className="header">
                    <h1>¡Bienvenido, Juan Carlos Rodríguez!</h1>
                    <p>Panel de administración - Universidad SOMOSPENSADORES</p>
                </header>

                <section className="stats">
                    <div className="stat-card">
                        <p>Total Usuarios</p>
                        <h2>1,247</h2>
                    </div>
                    <div className="stat-card green">
                        <p>Cursos Activos</p>
                        <h2>156</h2>
                    </div>
                    <div className="stat-card purple">
                        <p>Estudiantes</p>
                        <h2>1,089</h2>
                    </div>
                    <div className="stat-card orange">
                        <p>Profesores</p>
                        <h2>87</h2>
                    </div>
                </section>

                <section className="quick-actions">
                    <h3>Acciones Rápidas</h3>
                    <p>Gestión del sistema académico</p>

                    <div className="action-buttons">
                        <div className="action-card">
                            <span>👤</span>
                            <p>Crear Usuario</p>
                        </div>
                        <div className="action-card">
                            <span>➕</span>
                            <p>Nuevo Curso</p>
                        </div>
                        <div className="action-card">
                            <span>📋</span>
                            <p>Gestionar Inscripciones</p>
                        </div>
                        <div className="action-card">
                            <span>📊</span>
                            <p>Generar Reportes</p>
                        </div>
                    </div>
                </section>

                <section className="recent-activity">
                    <h3>Actividad Reciente</h3>
                    <ul>
                        <li>
                            ✅ Nueva calificación registrada en Matemáticas Avanzadas — hace 2
                            horas
                        </li>
                        <li>📘 Asistencia registrada para la clase de Física</li>
                    </ul>
                </section>
            </main>
        </div>
    );
};

export default AdminPage;
