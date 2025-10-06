import React from 'react';
import './LoginForm.css';

const LoginForm = () => {
    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-icon">
                    <i className="fa-solid fa-building-columns"></i>
                </div>
                <h2 className="login-title">SOMOS PENSADORES</h2>
                <p className="login-subtitle">Sistema Académico Universitario</p>

                <form className="login-form">
                    <div className="input-group">
                        <label>Correo Electrónico</label>
                        <div className="password-wrapper">
                            <input
                                type="email"
                                placeholder="usuario@somospensadores.edu.co"
                            />
                        </div>
                    </div>

                    <div className="input-group password-group">
                        <label>Contraseña</label>
                        <div className="password-wrapper">
                            <input
                                type="password"
                                placeholder="Ingresa tu contraseña"
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-button">
                        Iniciar Sesión
                    </button>

                    <hr className="divider" />

                    <p className="login-footer">
                        ¿No tienes una cuenta? <a href="#">Regístrate</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
