import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../header";
import Home from "../home";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../css/respuestas.css";
import { useNavigate } from "react-router-dom";

// Definir las URLs de la API
const API_URLS = {
    contactos: 'http://127.0.0.1:8000/api/contactos/',
    contactoUpdate: (id) => `http://127.0.0.1:8000/api/contactos/${id}/`,
    validarToken: 'http://127.0.0.1:8000/api/validar-token',
    obtenerUsuario: (email) => `http://127.0.0.1:8000/api/users/${email}`
};

const Respuestas = () => {
    const [contactos, setContactos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedContacto, setSelectedContacto] = useState(null);
    const [responseText, setResponseText] = useState("");
    const [isSuperUser, setIsSuperUser] = useState(false);
    const [nombreUsuario, setNombreUsuario] = useState("Usuario");

    const navigate = useNavigate();

    useEffect(() => {
        const validateTokenAndUser = async () => {
            const token = localStorage.getItem('token');
            const emailUsuario = localStorage.getItem('emailUsuario');

            // Si no hay token, redirige al login
            if (!token) {
                navigate('/');
                return;
            }

            try {
                // Validar el token
                const tokenResponse = await fetch(API_URLS.validarToken, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!tokenResponse.ok) {
                    navigate('/');
                    return;
                }

                // Obtener detalles del usuario
                if (emailUsuario) {
                    const userResponse = await fetch(API_URLS.obtenerUsuario(emailUsuario), {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    const userData = await userResponse.json();
                    console.log(userData);

                    if (Array.isArray(userData) && userData.length > 0 && userData[0].is_superuser) {
                        setIsSuperUser(true); // Usuario superusuario
                    } else {
                        setIsSuperUser(false); // No es superusuario
                        navigate('/'); // Redirige al home si no es superusuario
                    }
                } else {
                    navigate('/'); // Redirige al login si no hay email
                }
            } catch (error) {
                console.error('Error durante la validación:', error);
                navigate('/'); // Redirige si ocurre un error
            }
        };

        validateTokenAndUser();

        // Obtener nombre del usuario desde el localStorage
        const nombre = localStorage.getItem('nombreUsuario');
        setNombreUsuario(nombre || 'Usuario'); // Si no hay nombre, usa "Usuario"
    }, [navigate]);

    const fetchContactos = async () => {
        try {
            const response = await axios.get(API_URLS.contactos);
            setContactos(response.data);
            setLoading(false);
        } catch (err) {
            setError("Error al obtener los datos.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContactos();
    }, []);

    const handleOpenResponseModal = (contacto) => {
        setSelectedContacto(contacto);
        setResponseText("");
        setShowResponseModal(true);
    };

    const handleConfirmResponse = () => {
        if (responseText.trim() !== '') {
            setShowConfirmModal(true);
        } else {
            alert("Por favor, escribe una respuesta antes de enviar.");
        }
    };

    const handleOut = () => {
        setShowResponseModal(false);
    };

    const handlePatchRequest = async () => {
        if (selectedContacto) {
            try {
                // Realiza la solicitud PATCH para actualizar el estado y enviar la respuesta
                await axios.patch(API_URLS.contactoUpdate(selectedContacto.id_contacto), {
                    estado: true,
                    nombre: selectedContacto.nombre, // Enviamos el nombre
                    email: selectedContacto.email,   // Enviamos el email
                    message: responseText            // Enviamos el mensaje ingresado en el input
                });
    
                // Actualiza la lista de contactos en el frontend
                setContactos(contactos.map(contacto =>
                    contacto.id_contacto === selectedContacto.id_contacto
                        ? { ...contacto, estado: true }
                        : contacto
                ));
    
                // Limpiar el estado del modal y cerrar
                setShowConfirmModal(false);
                setShowResponseModal(false);
                setResponseText(""); // Limpiar el input
                window.location.reload();
            } catch (error) {
                console.error("Error al actualizar el estado o enviar el mensaje:", error);
            }
        }
    };

    return (
        <>
            <Header />
            <div className="container mt-4">
                <h1 className="text-center">Dudas de Usuarios</h1>
                <div className="table-responsive mt-4">
                    {loading ? (
                        <div className="text-center">Cargando datos...</div>
                    ) : error ? (
                        <div className="alert alert-danger text-center">{error}</div>
                    ) : (
                        <table className="table table-bordered">
                            <thead >
                                <tr>
                                    <th>#</th>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Teléfono</th>
                                    <th>Asunto</th>
                                    <th>Mensaje</th>
                                    <th>Responder</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contactos.map((contacto, index) => (
                                    <tr key={contacto.id_contacto}>
                                        <td>{index + 1}</td>
                                        <td>{contacto.nombre}</td>
                                        <td>{contacto.email}</td>
                                        <td>{contacto.telefono}</td>
                                        <td>{contacto.asunto}</td>
                                        <td>{contacto.mensaje}</td>
                                        <td>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleOpenResponseModal(contacto)}
                                            >
                                                <i className="bi bi-chat-left-dots"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            <Home />

            {/* Modal de Respuesta */}
            {showResponseModal && (
                <div className="custom-modal-backdrop">
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Respuesta</h5>
                                    <button
                                        className="btn-close"
                                        onClick={() => setShowResponseModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p><strong>Estimado:</strong> {selectedContacto?.nombre}</p>
                                    <textarea
                                        className="form-modal-respuestas"
                                        placeholder="Escribe tu respuesta..."
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                        rows="5"
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-primary" onClick={handleConfirmResponse}>
                                        Enviar
                                    </button>
                                    <button className="btn btn-danger" onClick={handleOut}>
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación */}
            {showConfirmModal && (
                <div className="custom-modal-backdrop confirm-modal">
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">¿Estás seguro?</h5>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-danger" onClick={() => setShowConfirmModal(false)}>
                                        No
                                    </button>
                                    <button className="btn btn-success" onClick={handlePatchRequest}>
                                        Sí
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Respuestas;