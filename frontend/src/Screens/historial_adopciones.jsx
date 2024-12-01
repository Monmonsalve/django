import React, { useEffect, useState } from "react";
import Header from "../header";
import Home from "../home";
import { useNavigate } from "react-router-dom";
import '../css/historialAdopciones.css'; // Asegúrate de crear este archivo CSS

const HistorialAdopciones = () => {
    const [adopciones, setAdopciones] = useState([]);
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

    // Obtención de datos de adopciones y detalles de mascotas
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/users/?email=${emailUsuario}`);
                const users = await response.json();

                if (users.length > 0) {
                    const foundUser = users[0];
                    const userId = foundUser.id_user;
                    fetchAdopciones(userId);
                } else {
                    console.error("Usuario no encontrado");
                }
            } catch (error) {
                console.error("Error al obtener los usuarios:", error);
            }
        };

        const fetchAdopciones = async (userId) => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/adoptantes/?id_user=${userId}`);
                const adopcionesData = await response.json();
                const petsData = await fetchPets(adopcionesData);
                setAdopciones(petsData);
            } catch (error) {
                console.error("Error al obtener adopciones:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchPets = async (userAdopciones) => {
            const petsWithDetails = await Promise.all(userAdopciones.map(async (adopcion) => {
                if (!adopcion.id_pets) {
                    console.warn("id_pets no encontrado para adopción:", adopcion);
                    return {
                        ...adopcion,
                        mascotaNombre: "ID de mascota no encontrado",
                    };
                }

                try {
                    console.log("ID de mascota:", adopcion.id_pets); // Verifica el ID de la mascota
                    const petResponse = await fetch(`http://127.0.0.1:8000/api/pets/${adopcion.id_pets}/`);
                    const petData = await petResponse.json();
                    return {
                        ...adopcion,
                        mascotaNombre: petData.nombre || "Nombre no encontrado",
                    };
                } catch (error) {
                    console.error("Error al obtener detalles de la mascota:", error);
                    return {
                        ...adopcion,
                        mascotaNombre: "Nombre no encontrado",
                    };
                }
            }));
            return petsWithDetails;
        };

        fetchUserData();
    }, [emailUsuario]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="historial-adopciones">
            <Header />
            <main>
                <div className="container">
                    <h1>Historial de Adopciones</h1>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Mascota</th>
                                    <th>Estado</th>
                                    <th>Fecha de Adopción</th>
                                </tr>
                            </thead>
                            {adopciones.length > 0 ? (
                                <tbody>
                                    {adopciones.map((adopcion, index) => (
                                        <tr key={index}>
                                            <td>{nombreUsuario}</td>
                                            <td>{adopcion.mascotaNombre}</td>
                                            <td>{adopcion.estados}</td>
                                            <td>{adopcion.fecha_adopcion}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            ) : (
                                <tbody>
                                    <tr>
                                        <td colSpan="4">No hay adopciones registradas para este usuario.</td>
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

export default HistorialAdopciones;
