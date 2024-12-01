import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './css/header.css';

const Carusel = () => {
  const [eventos, setEventos] = useState([]);  // Estado para los eventos
  const [currentImageIndex, setCurrentImageIndex] = useState(0);  // Estado para el índice de la imagen actual

  // Definir la URL de la API
  const API_URL = 'http://127.0.0.1:8000/api';

  // Función para obtener los eventos
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch(`${API_URL}/eventos/`);
        const data = await response.json();
        setEventos(data);
      } catch (error) {
        console.error('Error al obtener los eventos:', error);
      }
    };

    fetchEventos();
  }, []);  // Este useEffect solo se ejecuta una vez al montar el componente

  // Cambiar el índice de la imagen para el carrusel
  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % eventos.length);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + eventos.length) % eventos.length
    );
  };

  // Iniciar un intervalo para cambiar las imágenes cada 5 segundos
  useEffect(() => {
    const intervalId = setInterval(goToNextImage, 5000); // 5 segundos para cambiar la imagen
    return () => clearInterval(intervalId);  // Limpiar el intervalo cuando el componente se desmonte
  }, [eventos.length]);  // El intervalo depende de la longitud de eventos

  return (
    <div className="container my-4">
      <div id="eventosCarousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner">
          {eventos.map((evento, index) => (
            <div
              key={index}
              className={`carousel-item ${index === currentImageIndex ? 'active' : ''}`}
            >
              <Link to={`/evento/${evento.id_evento}/${evento.titulo}`} state={{ eventos }} className="event">
                <img
                  src={evento.imagen}
                  alt={evento.titulo}
                  className="d-block event-image"
                />
                <div className="carousel-caption d-none d-md-block">
                  <h2 className="event-title">{evento.titulo}</h2>
                </div>
              </Link>
            </div>
          ))}
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          onClick={goToPrevImage} // Acción personalizada al hacer clic en "prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          onClick={goToNextImage} // Acción personalizada al hacer clic en "next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  );
};

export default Carusel;