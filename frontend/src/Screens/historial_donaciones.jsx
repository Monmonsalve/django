import React, { useEffect, useState } from "react";
import Header from "../header";
import Home from "../home";
import { useNavigate } from "react-router-dom";
import '../css/historialDonaciones.css'; // Asegúrate de tener este archivo CSS

const HistorialDonaciones = () => {
    const [donaciones, setDonaciones] = useState([]);
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

    // Obtención de donaciones y sus detalles
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/users/?email=${emailUsuario}`);
                const users = await response.json();

                if (users.length > 0) {
                    const foundUser = users[0];
                    fetchDonaciones(foundUser.id_user);
                } else {
                    console.error("Usuario no encontrado");
                }
            } catch (error) {
                console.error("Error al obtener los usuarios:", error);
            }
        };

        const fetchDonaciones = async (userId) => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/donaciones/?id_user=${userId}`);
                const donacionesData = await response.json();
                const detallesData = await fetchDetallesDonaciones(donacionesData);
                setDonaciones(detallesData);
            } catch (error) {
                console.error("Error al obtener donaciones:", error);
            }
        };

        const fetchDetallesDonaciones = async (donacionesData) => {
            try {
                const detallesPromises = donacionesData.map(async (donacion) => {
                    const response = await fetch(`http://127.0.0.1:8000/api/detalle-donaciones/?id_donacion=${donacion.id_donacion}`);
                    const detalles = await response.json();

                    // Obtener el monto del primer detalle si existe
                    const monto = detalles.length > 0 ? detalles[0].monto : "No disponible";

                    return {
                        ...donacion,
                        monto: monto,
                    };
                });
                return await Promise.all(detallesPromises);
            } catch (error) {
                console.error("Error al obtener detalles de donaciones:", error);
                return donacionesData; // Retorna donaciones sin modificaciones en caso de error
            }
        };

        fetchUserData();
    }, [emailUsuario]);

    return (
        <div className="historial-donaciones">
            <Header />
            <main>
                <div className="container">
                    <h1>Historial de Donaciones</h1>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Mensaje</th>
                                    <th>Fecha</th>
                                    <th>Monto</th>
                                </tr>
                            </thead>
                            {donaciones.length > 0 ? (
                                <tbody>
                                    {donaciones.map((donacion, index) => (
                                        <tr key={index}>
                                            <td>{nombreUsuario}</td>
                                            <td>{donacion.message}</td>
                                            <td>{donacion.fecha_donacion}</td>
                                            <td>{donacion.monto}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            ) : (
                                <tbody>
                                    <tr>
                                        <td colSpan="4">No hay donaciones registradas para este usuario.</td>
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

export default HistorialDonaciones;
