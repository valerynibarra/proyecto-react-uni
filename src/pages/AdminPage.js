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
    FaEdit,
    FaTrash,
    FaSearch,
    FaChevronDown,
    FaTimes,
} from "react-icons/fa";
import confirmLogout from "../utils/confirmLogout";
import "./AdminPage.css";

const AdminPage = () => {
    const [usuario, setUsuario] = useState({ nombre: "", rol: "" });
    const [collapsed, setCollapsed] = useState(false);
    const [activePage, setActivePage] = useState("dashboard");

    // Crear usuario
    const [showModal, setShowModal] = useState(false);
    const [programas, setProgramas] = useState([]);
    const [newUser, setNewUser] = useState({
        nombre: "",
        documento: "",
        correo: "",
        programa: "",
        rol: ""
    });
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    //cargar los programas
    useEffect(() => {
        async function fetchProgramas() {
            try {
                const res = await fetch("http://localhost:5000/programas");
                if (!res.ok) throw new Error();
                const data = await res.json();
                setProgramas(data);
            } catch {
                console.error("No se pudieron cargar los programas");
            }
        }
        fetchProgramas();
    }, []);


    // Datos conectados al backend
    const [counts, setCounts] = useState({ totalUsers: 0, estudiantes: 0, profesores: 0, administradores: 0 });
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersQuery, setUsersQuery] = useState({ q: "", role: "Todos" });

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
    }, [activePage, usersQuery.q, usersQuery.role]);

    // Función para crear nuevo usuario
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const res = await fetch("http://localhost:5000/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error al crear usuario");

            setSuccessMsg(`Usuario creado correctamente. Contraseña temporal: ${data.contraseñaTemporal}`);
            setNewUser({ nombre: "", documento: "", correo: "", programa: "", rol: "" });

            // Actualiza la lista de usuarios
            await refreshData();
            setTimeout(() => setShowModal(false), 2500);
        } catch (err) {
            setErrorMsg(err.message);
        }
    };


    // Nuevo estado para el modal de eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Función para abrir el modal con el usuario seleccionado
    const handleDeleteClick = (usuario) => {
        setUserToDelete(usuario);
        setShowDeleteModal(true);
    };

    // Función para confirmar eliminación
    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const res = await fetch(`http://localhost:5000/usuarios/${userToDelete.id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Error al eliminar usuario");

            // Refresca la lista de usuarios
            await refreshData();
            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (error) {
            console.error("❌ Error al eliminar usuario:", error);
            alert("No se pudo eliminar el usuario.");
        }
    };

    const refreshData = async () => {
        try {
            //  Refrescar lista de usuarios
            const params = new URLSearchParams();
            if (usersQuery.q) params.append("q", usersQuery.q);
            if (usersQuery.role) params.append("role", usersQuery.role);
            const resUsers = await fetch(`http://localhost:5000/usuarios?${params.toString()}`);
            const dataUsers = await resUsers.json();
            setUsers(dataUsers);

            //  Refrescar contadores
            const resCounts = await fetch("http://localhost:5000/counts");
            const dataCounts = await resCounts.json();
            setCounts(dataCounts);
        } catch (error) {
            console.error("Error al refrescar datos:", error);
        }
    };

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
                            {/* header del panel: título a la izquierda, botón crear a la derecha */}
                            <div className="users-panel-header">
                                <div className="users-panel-title">
                                    <div className="users-panel-heading">Lista de Usuarios</div>
                                    <div className="users-panel-subheading">Gestiona todos los usuarios del sistema</div>
                                </div>
                                <div className="users-panel-create">
                                    <button className="btn-create" onClick={() => setShowModal(true)}>
                                        <FaUserPlus /> Crear Usuario
                                    </button>
                                </div>
                            </div>

                            {/* controles: búsqueda (izq) y filtro (der) */}
                            <div className="users-panel-controls">
                                <div className="search-wrapper">
                                    <FaSearch className="search-icon" aria-hidden="true" />
                                    <input
                                        className="search-input"
                                        placeholder="Buscar por nombre o email..."
                                        value={usersQuery.q}
                                        onChange={(e) => setUsersQuery((s) => ({ ...s, q: e.target.value }))}
                                    />
                                </div>
                                <div className="select-wrapper">
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
                                    <FaChevronDown className="select-arrow" aria-hidden="true" />
                                </div>
                            </div>

                            {/* Tabla de usuarios */}
                            <div className="users-table-wrapper">
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Documento</th>
                                            <th>Rol</th>
                                            <th>Programa</th>
                                            <th>Fecha de Registro</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersLoading ? (
                                            <tr><td colSpan={4}>Cargando...</td></tr>
                                        ) : users.length === 0 ? (
                                            <tr><td colSpan={4}>No se encontraron usuarios</td></tr>
                                        ) : (
                                            users.map((u) => (
                                                <tr key={u.id}>
                                                    <td>
                                                        <div className="user-cell">
                                                            <strong className="user-name-line">{u.nombre}</strong><br></br>
                                                            <small className="user-email-line">{u.correo}</small>
                                                        </div>
                                                    </td>
                                                    <td>{u.documento}</td>
                                                    <td className="role-cell">{u.rol}</td>
                                                    <td>{u.programa ?? '-'}</td>
                                                    <td>{u.fecha_registro}</td>
                                                    <td className="actions-cell">
                                                        <FaEdit className="table-action-icon edit-icon" aria-label="editar" />
                                                        <FaTrash
                                                            className="table-action-icon delete-icon"
                                                            aria-label="eliminar"
                                                            onClick={() => handleDeleteClick(u)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                ) : (

                    <>
                        <header className="header">
                            <h1>¡Hola, {usuario.nombre || "Usuario"}!</h1>
                            <p>Panel de administración - Universidad SOMOSPENSADORES</p>
                        </header>

                        {/* Paneles de estadísticas */}
                        <section className="stats">
                            <div className="stat-card blue">
                                <div>
                                    <p>Total Usuarios</p>
                                    <h2>{counts.totalUsers?.toLocaleString() ?? "-"}</h2>
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
                                    <h2>{counts.estudiantes?.toLocaleString() ?? "-"}</h2>
                                </div>
                                <div className="icon-box purple">
                                    <FaGraduationCap />
                                </div>
                            </div>

                            <div className="stat-card orange">
                                <div>
                                    <p>Profesores</p>
                                    <h2>{counts.profesores?.toLocaleString() ?? "-"}</h2>
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

            {/* Modal para crear nuevo usuario */}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-btn" onClick={() => setShowModal(false)}>
                            <FaTimes />
                        </button>
                        <h2>Crear Nuevo Usuario</h2>
                        <form onSubmit={handleCreateUser} className="create-user-form">
                            <label>Nombre Completo</label>
                            <input
                                type="text"
                                placeholder="Nombre completo del usuario"
                                value={newUser.nombre}
                                onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                                required
                            />

                            <label>Documento</label>
                            <input
                                type="number"
                                placeholder="Número de documento"
                                value={newUser.documento}
                                onChange={(e) => setNewUser({ ...newUser, documento: e.target.value })}
                                required
                            />

                            <label>Correo Institucional</label>
                            <input
                                type="email"
                                placeholder="correo@somospensadores.edu.co"
                                value={newUser.correo}
                                onChange={(e) => setNewUser({ ...newUser, correo: e.target.value })}
                                required
                            />

                            <label>Programa Académico</label>
                            <select
                                value={newUser.programa}
                                onChange={(e) => setNewUser({ ...newUser, programa: e.target.value })}
                            >
                                <option value="">-- Seleccionar programa --</option>
                                {programas.map((p) => (
                                    <option key={p.id} value={p.nombre}>{p.nombre}</option>
                                ))}
                            </select>

                            <label>Rol</label>
                            <select
                                value={newUser.rol}
                                onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
                                required
                            >
                                <option value="">Seleccionar rol</option>
                                <option>Administrador</option>
                                <option>Director de Programa Académico</option>
                                <option>Profesor</option>
                                <option>Estudiante</option>
                            </select>

                            {errorMsg && <p className="error-msg">{errorMsg}</p>}
                            {successMsg && <p className="success-msg">{successMsg}</p>}

                            <div className="modal-buttons">
                                <button type="submit" className="btn-primary">Crear Usuario</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de eliminación */}
            {showDeleteModal && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-content">
                        <h3>Confirmar eliminación</h3>
                        <p>¿Seguro que deseas eliminar al usuario <strong>{userToDelete?.nombre}</strong>?</p>
                        <div className="delete-modal-buttons">
                            <button className="btn-cancelar" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                            <button className="btn-eliminar" onClick={confirmDeleteUser}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminPage;
