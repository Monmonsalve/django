import React, { useEffect, useState } from "react";
import Header from "../header";
import Home from "../home";
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/visita.css'; // Asegúrate de crear este archivo CSS

const AgendarVisita = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { pet } = location.state;
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [nombreRefugio, setNombreRefugio] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [direccion, setDireccion] = useState('');
    const [fechaVisita, setFechaVisita] = useState('');
    const [mensajeAdvertencia, setMensajeAdvertencia] = useState('');
    const [confirmacionAsistencia, setConfirmacionAsistencia] = useState(false);

    // Validación del token y obtener el nombre del usuario
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

    // Obtener datos del refugio y la ciudad
    useEffect(() => {
        const fetchRefugioData = async () => {
            try {
                const refugioResponse = await fetch(`http://127.0.0.1:8000/api/refugios/${pet.id_refugio}/`);
                const refugioData = await refugioResponse.json();
                setNombreRefugio(refugioData.nombre);
                setDireccion(refugioData.direccion);

                const ciudadResponse = await fetch(`http://127.0.0.1:8000/api/ciudades/${refugioData.id_ciudad}/`);
                const ciudadData = await ciudadResponse.json();
                setCiudad(ciudadData.ciudad);
            } catch (error) {
                console.error("Error al obtener datos del refugio o la ciudad:", error);
            }
        };

        fetchRefugioData();
    }, [pet.id_refugio]);

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        if (selectedDate) {
            if (isWeekend(selectedDate)) {
                setMensajeAdvertencia("La selección de fechas solo está permitida de lunes a viernes.");
                setFechaVisita(''); // Restablecer el campo de fecha
            } else {
                setMensajeAdvertencia('');
                setFechaVisita(selectedDate);
            }
        }
    };

    const isWeekend = (dateString) => {
        const date = new Date(dateString);
        const day = date.getUTCDay(); // 0: domingo, 6: sábado
        return day === 0 || day === 6;
    };

    const handleCheckboxChange = (e) => {
        setConfirmacionAsistencia(e.target.checked);
    };

    const handleSubmit = async () => {
        const emailUsuario = localStorage.getItem("emailUsuario");
        if (!emailUsuario) {
            alert("No se encontró el email del usuario en el almacenamiento.");
            return;
        }

        try {
            const userResponse = await fetch(`http://127.0.0.1:8000/api/users/?email=${emailUsuario}`);
            const userData = await userResponse.json();

            if (userData.length === 0) {
                alert("No se encontró el usuario con ese email.");
                return;
            }

            const id_user = userData[0].id_user;

            const visitaData = {
                id_pets: pet.id_pets,
                id_user: id_user,
                fecha_visita: fechaVisita,
                hora_visita: null,
            };

            const response = await fetch('http://127.0.0.1:8000/api/fechas-visita/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(visitaData),
            });

            if (response.ok) {
                alert("Visita solicitada con éxito.");
                navigate('/');
            } else {
                alert("Error al solicitar la visita.");
            }
        } catch (error) {
            console.error("Error al enviar la solicitud:", error);
        }
    };

    return (
        <div className="agendar-visita">
            <Header />
            <main className="main-content">
                <h1>Solicitud Visita</h1>
                <div className="card-visita">
                    <p><strong>Usuario:</strong> {nombreUsuario}</p>
                    <p>
                        Yo <strong>{nombreUsuario}</strong> me comprometo a asistir el día 
                        <input 
                            type="date" 
                            className="date-input" 
                            onChange={handleDateChange}
                            value={fechaVisita} 
                            min={new Date().toISOString().split("T")[0]} // No permitir fechas pasadas
                        />
                        al refugio <strong>{nombreRefugio}</strong>, dirección 
                        <strong> {direccion}</strong>, en la comuna <strong>{ciudad}</strong>, para realizar una visita a la mascota nombrada 
                        "<strong>{pet.nombre}</strong>" para ver la posibilidad de adopción de la mascota.
                    </p>
                    {mensajeAdvertencia && <p className="advertencia">{mensajeAdvertencia}</p>}
                    <div className="checkbox-container">
                        <input 
                            type="checkbox" 
                            className="confirm-checkbox" 
                            onChange={handleCheckboxChange} 
                        /> 
                        <label>Confirmo mi asistencia</label>
                    </div>
                    <button 
                        className="request-button" 
                        disabled={fechaVisita === '' || !confirmacionAsistencia}
                        onClick={handleSubmit}
                    >
                        Solicitar visita
                    </button>
                </div>
            </main>
            <Home />
        </div>
    );
};

export default AgendarVisita;
