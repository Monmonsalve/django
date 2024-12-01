import React, { useState } from "react";
import '../css/registro.css'; // Asegúrate de que esta ruta es correcta
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importa axios
import Home from "../home";

const Registro = () => {
    const navigate = useNavigate();
    const API_Logo = 'http://127.0.0.1:8000/';

    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        telefono: '',
        direccion: '',
        rut: '',
        email: '',
        password: '',
        repeatPassword: '',
    });

    const [rutMessage, setRutMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        
        // Validar RUT en tiempo real
        if (name === 'rut') {
            if (validateRUT(value)) {
                if (isValidRUT(value)) {
                    setRutMessage("RUT válido.");
                } else {
                    setRutMessage("RUT inválido.");
                }
            } else {
                setRutMessage("Coloque un RUT sin puntos y con guion.");
            }
        }
    };

    const handleLogin = () => {
        navigate('/Login');
    };

    const handleTitleClick = () => {
        navigate('/'); // Redirige a la página de inicio
    };

    const validateRUT = (rut) => {
        // Comprobar que el RUT no tiene puntos y tiene guion
        const rutPattern = /^\d{7,8}-[0-9K]$/;
        return rutPattern.test(rut);
    };

    const isValidRUT = (rut) => {
        const [number, verifier] = rut.split('-');
        
        if (!verifier) {
            return false; // Si no hay verificador, el RUT es inválido
        }

        let sum = 0;
        let multiplier = 2;

        for (let i = number.length - 1; i >= 0; i--) {
            sum += parseInt(number[i], 10) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }

        const calculatedVerifier = 11 - (sum % 11);
        const finalVerifier = calculatedVerifier === 10 ? 'K' : calculatedVerifier === 11 ? '0' : calculatedVerifier.toString();

        return finalVerifier === verifier.toUpperCase();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateRUT(formData.rut) || !isValidRUT(formData.rut)) {
            setRutMessage("Coloque un RUT válido sin puntos y con guion.");
            return;
        }

        if (formData.password !== formData.repeatPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/register/', formData); // Asegúrate de que la URL es correcta
            console.log('Registro exitoso:', response.data);
            // Redirigir a la página de inicio de sesión
            navigate('/Login');
        } catch (error) {
            console.error('Error en el registro:', error);
            alert("Error en el registro. Intenta de nuevo.");
        }
    };

    return (
        <div>
            <header className="top-head">
            <a onClick={() => navigate('/')} className="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none">
              <img className='Logotipo' src={`${API_Logo}media/imagenes/logo.png`} alt="Logotipo" />
            </a>
            </header>
            <main className="main-register" >
            <div className="registro">
            <form className="formulario" onSubmit={handleSubmit}>
                <h1 className="title" style={{ color: "white"}} >Registro</h1>
                
                <label htmlFor="rut">Rut</label>
                <input id="rut" name="rut" type="text" placeholder="21286625-3" className="login-input" onChange={handleChange} required />
                {rutMessage && <span className="rut-message" style={{ color: isValidRUT(formData.rut) ? 'green' : 'red' }}>{rutMessage}</span>}

                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" name="nombre" type="text" placeholder="Nombre" className="login-input" onChange={handleChange} required />

                <label htmlFor="apellidos">Apellido</label>
                <input id="apellidos" name="apellidos" type="text" placeholder="Apellido" className="login-input" onChange={handleChange} required />

                <label htmlFor="telefono">Teléfono</label>
                <input id="telefono" name="telefono" type="text" placeholder="Ej: 123456789" className="login-input" onChange={handleChange} required />

                <label htmlFor="direccion">Dirección</label>
                <input id="direccion" name="direccion" type="text" placeholder="Dirección" className="login-input" onChange={handleChange} required />

                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="example@domain.com" className="login-input" onChange={handleChange} required />

                <label htmlFor="password">Contraseña</label>
                <input id="password" name="password" type="password" placeholder="************" className="login-input" onChange={handleChange} required />

                <label htmlFor="repeat-password">Repetir Contraseña</label>
                <input id="repeat-password" name="repeatPassword" type="password" placeholder="************" className="login-input" onChange={handleChange} required />

                <label>
                    <input type="checkbox" required />
                    Acepto los términos y condiciones
                </label>

                <button type="submit" className="button-login">Registrarse</button>
                <p className="login-register">Ya tienes cuenta? <span onClick={handleLogin} style={{ cursor: 'pointer' }}>Iniciar Sesión</span></p>
            </form>
            </div>
            </main>
            <Home />
        </div>
    );
};

export default Registro;
