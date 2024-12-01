import React, { useEffect, useState } from "react";
import Header from "../header";
import Home from "../home";
import { useNavigate } from "react-router-dom";
import '../css/perfil.css'; // Asegúrate de tener este archivo CSS

const Perfil = () => {
    const [usuario, setUsuario] = useState(null);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const navigate = useNavigate();
    const emailUsuario = localStorage.getItem("emailUsuario");

    // Validación del token y obtención del nombre de usuario
    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login'); // Redirige a login con un mensaje
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
                    navigate('/login'); // Redirige a login con un mensaje
                }
            } catch (error) {
                console.error('Error al validar el token:', error);
                navigate('/login'); // Redirige a login con un mensaje
            }
        };

        validateToken();

        // Obtener nombre y apellidos del localStorage
        const nombre = localStorage.getItem('nombreUsuario');
        setNombreUsuario(nombre || 'Usuario'); // Muestra 'Usuario' si no hay nombre
    }, [navigate]);

    // Obtención de los datos del usuario
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/users/?email=${emailUsuario}`);
                const users = await response.json();
                
                if (users.length > 0) {
                    setUsuario(users[0]); // Suponemos que el email es único
                } else {
                    console.error("Usuario no encontrado");
                }
            } catch (error) {
                console.error("Error al obtener el usuario:", error);
            }
        };

        fetchUserData();
    }, [emailUsuario]);

    return (
        <div>
            <Header />
            <main className="perfil-section">
                <h1 className="perfil-header">Perfil</h1>
                <div className="perfil-details-container d-flex">
                    <img 
                        src="http://127.0.0.1:8000/media/imagenes/icono_perfil.png" 
                        alt="Icono de Perfil" 
                        className="perfil-image" 
                    />
                    {usuario ? (
                        <div className="perfil-data">
                            <p><strong>RUT:</strong> {usuario.rut}</p>
                            <p><strong>Nombre:</strong> {usuario.nombre}</p>
                            <p><strong>Apellidos:</strong> {usuario.apellidos}</p>
                            <p><strong>Email:</strong> {usuario.email}</p>
                            <p><strong>Dirección:</strong> {usuario.direccion}</p>
                            <p><strong>Teléfono:</strong> {usuario.telefono}</p>
                        </div>
                    ) : (
                        <p>No se encontraron datos del usuario.</p>
                    )}
                </div>
            </main>
            <Home />
        </div>
    );
}

export default Perfil;
