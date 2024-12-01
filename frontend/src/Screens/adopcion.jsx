import React, { useEffect, useState } from "react";
import Header from "../header";
import Home from "../home";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate } from 'react-router-dom';
import "../css/adopcion.css";

const Adopcion = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { pet } = location.state;

    const [fecha, setFecha] = useState('');
    const [files, setFiles] = useState({
        identidad: null,
        formulario: null,
        comprobante: null,
        condiciones: null,
    });

    const validarToken = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
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
                navigate('/login');
            }
        } catch (error) {
            console.error('Error al validar el token:', error);
            navigate('/login');
        }
    };

    useEffect(() => {
        validarToken();
    }, []);

    const handleFechaChange = (e) => {
        const selectedDate = new Date(e.target.value);
        const day = selectedDate.getUTCDay();

        if (day >= 1 && day <= 5) {
            setFecha(e.target.value);
        } else {
            alert('Por favor, selecciona una fecha de lunes a viernes.');
            setFecha('');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const maxSize = 5 * 1024 * 1024; // 5 MB en bytes
        const fileName = e.target.name;

        // Validar el tamaño del archivo
        if (file && file.size > maxSize) {
            alert(`El archivo ${file.name} excede el tamaño máximo permitido de 5 MB.`);
            e.target.value = ''; // Limpiar el input
            return; // No actualizar el estado si el archivo es demasiado grande
        }

        setFiles({
            ...files,
            [fileName]: file, // Almacenar el archivo en el estado
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verificar si todos los archivos están seleccionados
        if (!files.identidad || !files.formulario || !files.comprobante || !files.condiciones) {
            alert('Por favor, asegúrate de que todos los archivos estén seleccionados.');
            return;
        }

        const emailUsuario = localStorage.getItem("emailUsuario");

        try {
            // Obtener id_user
            const userResponse = await fetch(`http://127.0.0.1:8000/api/users/?email=${emailUsuario}`);
            const users = await userResponse.json();

            if (users.length === 0) {
                alert('Usuario no encontrado.');
                return;
            }

            const idUser = users[0].id_user;

            // Preparar datos para el envío a la API de adoptantes
            const formData = new FormData();
            formData.append('fecha_adopcion', fecha);
            formData.append('id_user', idUser);
            formData.append('id_pets', pet.id_pets);
            formData.append('email_usuario', emailUsuario); // Incluye el email aquí
            Object.keys(files).forEach((key) => {
                if (files[key]) {
                    formData.append(key, files[key]);
                }
            });

            // Enviar datos a la API de adoptantes
            const responseAdoptantes = await fetch('http://127.0.0.1:8000/api/adoptantes/', {
                method: 'POST',
                body: formData,
            });

            if (responseAdoptantes.ok) {
                const adoptanteData = await responseAdoptantes.json();
                const idAdoptante = adoptanteData.id_adoptante; // Obtener el id_adoptante

                // Ahora, subimos los documentos
                const documentPromises = Object.keys(files).map(async (key) => {
                    if (files[key]) {
                        const docFormData = new FormData();
                        docFormData.append('id_adoptante', idAdoptante);
                        docFormData.append('documento', files[key]);

                        const responseDocumento = await fetch('http://127.0.0.1:8000/api/documentos/', {
                            method: 'POST',
                            body: docFormData,
                        });

                        if (!responseDocumento.ok) {
                            throw new Error(`Error al subir el documento ${key}`);
                        }
                    }
                });

                // Esperar a que todos los documentos se suban
                await Promise.all(documentPromises);
                navigate('/'); // Redirigir después de una solicitud exitosa
                alert('Adopción solicitada y documentos subidos con éxito.');
            } else {
                alert('Error al solicitar la adopción.');
            }
        } catch (error) {
            console.error('Error al enviar los datos de adopción:', error);
            alert('Ocurrió un error. Por favor, inténtalo de nuevo.');
        }
    };

    const descargarArchivo = (ruta) => {
        const link = document.createElement('a');
        link.href = ruta;
        link.download = ruta.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <Header />
            <main className="main-adopcion">
                <div className="container text-center mt-5">
                    <form className="adopcion-form" onSubmit={handleSubmit}>
                        <h1 className="mb-4">Proceso De Adopción {pet.nombre}</h1>
                        <p>*Los botones de descargar documento contienen un documento de copia para los adoptantes puedan realizar el proceso*</p>
                        
                        <div className="form-group">
                            <label htmlFor="identidad" className="form-label">Cédula de identidad *foto delantera y trasera*</label>
                            <div className="input-container">
                                <input type="file" name="identidad" id="identidad" accept=".jpg,.jpeg,.png,.doc,.docx,.pdf"  className="form-input" onChange={handleFileChange} />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="formulario" className="form-label">Formulario de adopción</label>
                            <div className="input-container">
                                <input type="file" name="formulario" id="formulario" accept=".jpg,.jpeg,.png,.doc,.docx,.pdf"  className="form-input" onChange={handleFileChange} />
                                <button 
                                    type="button" 
                                    className="btn btn-info" 
                                    onClick={() => descargarArchivo('http://127.0.0.1:8000/media/documentos/FORMULARIO-DE-ADOPCION.docx')}
                                >
                                    Descargar Documento
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="comprobante" className="form-label">Comprobante de domicilio</label>
                            <div className="input-container">
                                <input type="file" name="comprobante" id="comprobante" accept=".jpg,.jpeg,.png,.doc,.docx,.pdf"  className="form-input" onChange={handleFileChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="condiciones" className="form-label">Contrato de adopción</label>
                            <div className="input-container">
                                <input type="file" name="condiciones" id="condiciones" accept=".jpg,.jpeg,.png,.doc,.docx,.pdf"  className="form-input" onChange={handleFileChange} />
                                <button type="button" className="btn btn-info" onClick={() => descargarArchivo('http://127.0.0.1:8000/media/documentos/contrato-adopcion.pdf')}>
                                    Descargar Documento
                                </button>
                            </div>
                        </div>

                        <div className="form-group date-picker-container">
                            <label htmlFor="fecha" className="form-label">Elige una fecha (lunes a viernes) para la entrevista</label>
                            <input 
                                type="date" 
                                id="fecha" 
                                name="fecha" 
                                value={fecha} 
                                onChange={handleFechaChange} 
                                min={new Date().toISOString().split('T')[0]} 
                                className="form-input" 
                            />
                        </div>

                        <button type="submit" className="btn btn-warning">Enviar</button>
                    </form>
                </div>
            </main>
            <Home />
        </div>
    );
};

export default Adopcion;
