import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../header';
import Home from '../home';
import '../css/evento.css';

const EventoDetail = () => {
    const { id_evento } = useParams(); // Obtiene el id de la URL
    const [evento, setEvento] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvento = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/eventos/${id_evento}/`);
                setEvento(response.data);
            } catch (err) {
                console.error("Error al cargar el evento:", err);
                setError(err.message);
            }
        };

        fetchEvento();
    }, [id_evento]);

    if (error) 
        return (
            <div>
                <Header />
                <div>Error: {error}</div>
                <Home />
            </div>
        );

    if (!evento) 
        return (
            <div>
                <Header />
                <div>Cargando...</div>
                <Home />
            </div>
        );

    // Formatear la descripción, agregando un salto de línea después de cada dos puntos
    const formattedDescription = evento.descripcion
        .replace(/(\.[^\.]*\.)/g, "$1\n") // Agrega un salto de línea después de cada dos puntos
        .split('\n') // Divide en párrafos
        .map((text, index) => (
            <p key={index}>{text.trim()}</p>
        ));

    return (
        <div>
            <Header />
            <main>
                <article className='evento-container'>
                    <h1 className='eventoi-titulo'>{evento.titulo}</h1>
                    <img src={evento.imagen} alt={evento.titulo} className='evento-img' />
                    <div className='evento-descripcion'>
                        {formattedDescription}
                    </div>
                </article>
            </main>
            <Home />
        </div>
    );
};

export default EventoDetail;
