import React, { useEffect, useState } from "react";
import Header from "../header";
import Home from "../home";
import { useNavigate } from "react-router-dom";
import '../css/historialVisita.css'; // Asegúrate de tener este archivo CSS

const HistorialVisitas = () => {
    const [visitas, setVisitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const emailUsuario = localStorage.getItem("emailUsuario");
    const navigate = useNavigate();

    // Validación del token y obtención del nombre del usuario
    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login'); // Redirige a login si no hay token
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
                    navigate('/login'); // Redirige a login si el token no es válido
                }
            } catch (error) {
                console.error('Error al validar el token:', error);
                navigate('/login'); // Redirige a login en caso de error
            }
        };

        validateToken();

        // Obtener nombre del usuario del localStorage
        const nombre = localStorage.getItem('nombreUsuario');
        setNombreUsuario(nombre || 'Usuario'); // Muestra 'Usuario' si no hay nombre
    }, [navigate]);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/users/?email=${emailUsuario}`);
                const users = await response.json();
                
                if (users.length > 0) {
                    const userId = users[0].id_user; // Obtener el id_user
                    fetchVisitas(userId);
                } else {
                    console.error("Usuario no encontrado");
                }
            } catch (error) {
                console.error("Error al obtener los usuarios:", error);
            }
        };

        const fetchVisitas = async (userId) => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/fechas-visita/?id_user=${userId}`);
                const visitasData = await response.json();
                const petsData = await fetchPets(visitasData);
                setVisitas(petsData);
            } catch (error) {
                console.error("Error al obtener visitas:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchPets = async (visitasData) => {
            try {
                const petsResponse = await fetch("http://127.0.0.1:8000/api/pets/");
                const petsData = await petsResponse.json();

                return visitasData.map(visita => {
                    const pet = petsData.find(pet => pet.id_pets === visita.id_pets);
                    return {
                        ...visita,
                        mascotaNombre: pet ? pet.nombre : "Nombre no encontrado",
                    };
                });
            } catch (error) {
                console.error("Error al obtener mascotas:", error);
                return visitasData; // Retorna visitas sin modificaciones en caso de error
            }
        };

        fetchUserId();
    }, [emailUsuario]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div>
            <Header />
            <main>
                <div>
                    <h1>Historial de Visitas</h1>
                    <div className="table-responsive">
                        <table className="visitas-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Mascota</th>
                                    <th>Fecha de Visita</th>
                                    <th>Hora Visita</th>
                                </tr>
                            </thead>
                            {visitas.length > 0 ? (
                                <tbody>
                                    {visitas.map((visita, index) => (
                                        <tr key={index}>
                                            <td>{nombreUsuario}</td>
                                            <td>{visita.mascotaNombre}</td>
                                            <td>{visita.fecha_visita}</td>
                                            <td>{visita.hora_visita ? visita.hora_visita : "(Pendiente de aprobación)"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            ) : (
                                <tbody>
                                    <tr>
                                        <td colSpan="4" className="message-table">No hay visitas registradas para este usuario.</td>
                                    </tr>
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>
            </main>
            <Home />
        </div>
    );
};

export default HistorialVisitas;
