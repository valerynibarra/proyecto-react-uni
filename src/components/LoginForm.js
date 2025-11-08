import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    correo: email,
                    contraseña: password,
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Error al iniciar sesión');
            }

            const data = await response.json();
            console.log('✅ Usuario autenticado:', data);

            // Guardar el usuario en localStorage
            localStorage.setItem('usuario', JSON.stringify({
                nombre: data.nombre,
                correo: data.correo,
                rol: data.rol,
            }));

            // Redirigir según el rol
            switch (data.rol) {
                case 'Administrador':
                    window.location.href = '/admin';
                    break;
                case 'Director de Programa Académico':
                    window.location.href = '/director';
                    break;
                case 'Profesor':
                    window.location.href = '/profesor';
                    break;
                case 'Estudiante':
                    window.location.href = '/estudiante';
                    break;
                default:
                    setError('Rol no reconocido');
            }
        } catch (err) {
            console.error('❌ Error de inicio de sesión:', err);
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-icon">
                    <i className="fa-solid fa-building-columns"></i>
                </div>
                <h2 className="login-title">SOMOS PENSADORES</h2>
                <p className="login-subtitle">Sistema Académico Universitario</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Correo Electrónico</label>
                        <div className="password-wrapper">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="usuario@somospensadores.edu.co"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group password-group">
                        <label>Contraseña</label>
                        <div className="password-wrapper">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ingresa tu contraseña"
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="login-button">
                        Iniciar Sesión
                    </button>

                    <hr className="divider" />

                    <p className="login-footer">
                        ¿No tienes una cuenta? <a href="#">Regístrate aquí</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
