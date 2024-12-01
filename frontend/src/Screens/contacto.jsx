import React, { useState } from "react";
import axios from 'axios';
import Header from "../header";
import Home from "../home";
import '../css/contacto.css'; // Asegúrate de tener estilos en este archivo

const Contacto = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: '',
        telefono: '',
    });
    const [showMessage, setShowMessage] = useState(false); // Estado para controlar la visibilidad del mensaje

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/contactos/', formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Formulario enviado exitosamente:', response.data);
            setShowMessage(true); // Muestra el mensaje de confirmación

            // Limpia el formulario después de enviar
            setFormData({
                nombre: '',
                email: '',
                asunto: '',
                mensaje: '',
                telefono: '',
            });

        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            // Aquí puedes manejar errores, como mostrar un mensaje de error al usuario
        }
    };

    return (
        <div className="contacto-container">
            <Header />
            <main className="contacto-main">
                <div className="form-contact">
                    <form className="contacto-form" onSubmit={handleSubmit}>
                    <h1 className="contacto-title">Formulario de Contacto</h1>
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre:</label>
                            <input 
                                type="text" 
                                id="nombre" 
                                name="nombre" 
                                value={formData.nombre} 
                                onChange={handleChange} 
                                required 
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="asunto">Asunto:</label>
                            <input 
                                type="text" 
                                id="asunto" 
                                name="asunto" 
                                value={formData.asunto} 
                                onChange={handleChange} 
                                required 
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="mensaje">Mensaje:</label>
                            <textarea 
                                id="mensaje" 
                                name="mensaje" 
                                value={formData.mensaje} 
                                onChange={handleChange} 
                                required 
                                className="form-textarea"
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono:</label>
                            <input 
                                type="tel" 
                                id="telefono" 
                                name="telefono" 
                                value={formData.telefono} 
                                onChange={handleChange} 
                                required 
                                className="form-input"
                            />
                        </div>

                        <button type="submit" className="form-button">Enviar</button>
                    </form>

                    {/* Mensaje de confirmación */}
                    {showMessage && (
                        <div className="modal-overlay">
                            <div className="confirmation-message">
                                <p>Estimado Usuario,</p>
                                <p className="msg-to-user">Agradecemos su consulta, nos encargaremos de responderte en el menor tiempo posible y su consulta estará en estos momentos en Proceso.</p>
                                <button onClick={() => setShowMessage(false)}>Cerrar</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Home />
        </div>
    );
};

export default Contacto;
