import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../header";
import "../css/donacion.css";
import Home from "../home";

const Donar = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login?message=donation'); // Redirige a login con un mensaje
                return;
            }

            try {
                const response = await fetch('http://localhost:8000/api/validate-token/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    navigate('/login?message=donation'); // Redirige a login con un mensaje
                }
            } catch (error) {
                console.error('Error al validar el token:', error);
                navigate('/login?message=donation'); // Redirige a login con un mensaje
            }
        };

        validateToken();

        // Obtener nombre y apellidos del localStorage
        const nombre = localStorage.getItem('nombreUsuario');
        setNombreUsuario(nombre || 'Usuario'); // Muestra 'Usuario' si no hay nombre
    }, [navigate]);

    return (
        <div>
            <Header />
            <main>
                <article className="Donacion">
                    <h1 className="title">Donación</h1>
                    <label className="info-donacion">Usuario</label>
                    <h6>{nombreUsuario}</h6>
                    <label className="info-message-donacion">Mensaje:</label>
                    <input className="input" type="text" placeholder="Ingresa tu mensaje" />
                    
                    <label className="info-cantidad">Cantidad:</label>
                    <input 
                        type="number" 
                        className="input" 
                        min="1000" 
                        step="1000" 
                        placeholder="$1000" 
                    />
                    
                    <button className="button-donacion"><span>Continuar</span></button>
                </article>
            </main>
            <Home />
        </div>
    );
};

export default Donar;
