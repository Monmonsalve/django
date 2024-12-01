import React, { useState, useEffect } from "react";
import '../css/login.css';
import { useNavigate, useLocation } from 'react-router-dom';
import Home from "../home";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isCliente, setIsCliente] = useState(true); // Estado para saber qué formulario mostrar
    const navigate = useNavigate();
    const location = useLocation();
    const API_Logo = 'http://127.0.0.1:8000/';

    const handleTitleClick = () => {
        navigate('/'); // Redirige a la página de inicio
    };

    const handleRegister = () => {
        navigate('/Registro');
    };

    // Cambiar URL según el tipo de formulario (Cliente o Trabajador)
    const handleSubmit = async (event) => {
        event.preventDefault();

        const url = isCliente
            ? 'http://localhost:8000/api/login/' // Para cliente
            : 'http://localhost:8000/api/login-job/'; // Para trabajador

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log(data); // Muestra la respuesta en la consola

            if (response.ok) {
                // Almacena el token y los datos del usuario en el localStorage
                localStorage.setItem('token', data.token);
                console.log('Token:', data.token); // Muestra el token en la consola

                // Almacena el nombre y apellidos del usuario
                localStorage.setItem('nombreUsuario', `${data.nombre} ${data.apellidos}`);

                // Almacena el email
                localStorage.setItem('emailUsuario', email);

                console.log('Inicio de sesión exitoso:', data);
                // Redirige a la página principal
                navigate('/');
            } else {
                alert(data.message || "Error en el inicio de sesión");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Error en la conexión. Intenta de nuevo.");
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const msg = params.get('message');
        if (msg === 'donation') {
            setMessage('Estimado usuario. Si desea realizar una donación, por favor inicie sesión. En caso de no tener una cuenta, puede crearse una cuenta.');
        }
    }, [location]);

    return (
        <div>
            <header className="top-head">
                <a onClick={handleTitleClick} className="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none">
                    <img className='Logotipo' src={`${API_Logo}media/imagenes/logo.png`} alt="Logotipo" />
                </a>
            </header>

            <main className="main-login">
                <div className="button-container">
                    <button className="btn btn-secondary" onClick={() => setIsCliente(true)}>Cliente</button>
                    <button className="btn btn-secondary" onClick={() => setIsCliente(false)}>Trabajador</button>
                </div>

                {isCliente ? (
                    <div className="login">
                        <form className="formulario" onSubmit={handleSubmit}>
                            <h1 className="title-f">Inicio Sesion - Cliente</h1>
                            {message && <div className="info-message">{message}</div>}
                            <label htmlFor="email" className="label-l">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@gmail.com"
                                className="login-input"
                                required
                            />
                            <label htmlFor="password" className="label-l">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="************"
                                className="login-input"
                                required
                            />
                            <button type="submit" className="button-login">Iniciar Sesión</button>
                            <p className="login-register">No tienes cuenta? <span onClick={handleRegister} style={{ cursor: 'pointer' }}>Registrarse</span></p>
                            <p>Olvidaste tu Contraseña?</p>
                        </form>
                    </div>
                ) : (
                    <div className="login">
                        <form className="formulario" onSubmit={handleSubmit}>
                            <h1 className="title-f">Inicio Sesion - Trabajador</h1>
                            {message && <div className="info-message">{message}</div>}
                            <label htmlFor="email" className="label-l">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@gmail.com"
                                className="login-input"
                                required
                            />
                            <label htmlFor="password" className="label-l">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="************"
                                className="login-input"
                                required
                            />
                            <button type="submit" className="button-login">Iniciar Sesión</button>
                            <p>Olvidaste tu Contraseña?</p>
                        </form>
                    </div>
                )}
            </main>

            <Home />
        </div>
    );
};

export default Login;
