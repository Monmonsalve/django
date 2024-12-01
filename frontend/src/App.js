import React, { useState, useEffect } from 'react';
import './App.css';
import Home from "./home";
import { Route, BrowserRouter as Router, Routes, useNavigate } from "react-router-dom";
import Header from './header';
import Login from './Screens/login';
import Registro from './Screens/registro';
import Donar from './Screens/donar';
import Animales from './Screens/mascotas';
import FichaMascota from "./Screens/ficha_mascota";
import Adopcion from './Screens/adopcion';
import AgendarVisita from './Screens/visita';
import Add_mascota from './ScreensJob/add_mascota';
import Evento from './Screens/evento';
import Contacto from './Screens/contacto';
import Perfil from './Screens/perfil';
import HistorialDonaciones from './Screens/historial_donaciones';
import HistorialVisitas from './Screens/historial_visitas';
import HistorialAdopciones from './Screens/historial_adopciones';
import Admin_mascota from './ScreensJob/admin_mascotas';
import Ad_visitas from './ScreensJob/ad_visitas';
import Ad_evento from './ScreensJob/ad_eventos';
import Ad_Mascotas from './ScreensJob/ad_mascotas';
import Respuestas from './ScreensJob/respuestas';
import Carusel from './carusel';

// Definir la URL de la API
const API_URL = 'http://127.0.0.1:8000/api';
const API_IMG = 'http://127.0.0.1:8000/';

function App() {
    const [especies, setEspecies] = useState([]);
    const [selectedEspecie, setSelectedEspecie] = useState('');
    const [pets, setPets] = useState([]);
    const navigate = useNavigate();

    // Obtener especies desde la API
    useEffect(() => {
        const fetchEspecies = async () => {
            try {
                const response = await fetch(`${API_URL}/especies/`);
                const data = await response.json();
                setEspecies(data);
            } catch (error) {
                console.error('Error al obtener las especies:', error);
            }
        };

        fetchEspecies();
    }, []);

    // Función para buscar mascotas
    const buscarMascotas = async () => {
        if (selectedEspecie) {
            try {
                const response = await fetch(`${API_URL}/pets/?id_especie=${selectedEspecie}`);
                const data = await response.json();
                setPets(data);
            } catch (error) {
                console.error('Error al obtener las mascotas:', error);
            }
        }
    };

    return (
        <div>
            <Header />
            <Carusel />

            <div className='search-container'>
                <h1 className='search-pets'>Buscador Mascotas</h1>
                <div className='search'>
                    <h2>Especie:</h2>
                    <select
                        id="search"
                        name="search"
                        className="form-control-t"
                        value={selectedEspecie}
                        onChange={(e) => setSelectedEspecie(e.target.value)}
                    >
                        <option value={0}>Seleccione una especie</option>
                        {especies.map((especie) => (
                            <option key={especie.id_especie} value={especie.id_especie}>
                                {especie.especie}
                            </option>
                        ))}
                    </select>
                    <button type="button" onClick={buscarMascotas} className='search-button'>Buscar Mascota</button>
                </div>
            </div>

            {/* Mostrar las mascotas */}
            <div className="row">
                {pets.map((pet) => (
                    <div className="col-md-4" key={pet.id_pets}>
                        <div className="card mb-4 box-shadow">
                            <img
                                className="card-img-top"
                                src={pet.img || 'placeholder_image_url'}
                                alt={`Imagen de ${pet.nombre}`}
                                loading="lazy"
                            />
                            <div className="card-body d-flex flex-column" style={{ height: '100%' }}>
                                <div>
                                    <p className="card-text"><b>Nombre:</b> {pet.nombre}</p>
                                    <p className="card-text"><b>Edad:</b> {pet.edad} años</p>
                                </div>
                                <div className="mt-auto">
                                    <div className="btn-group">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => navigate('/Visita', {
                                                state: { pet }
                                            })}
                                        >
                                            Agendar Visita
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => navigate('/Ficha_Mascota', {
                                                state: { pet }
                                            })}
                                        >
                                            Ver Mascota
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <main className='main'>
                <article className='info'>
                    <img className='home-img' src={`${API_IMG}media/imagenes/nosotros.jpg`} alt="Descripción de la imagen" />
                    <h1 className='titleArticle'>¿Quiénes Somos?</h1>
                    <h1 className='messageText about-we'>Nuestro equipo está formado por voluntarios dedicados y profesionales del cuidado animal que trabajan arduamente para rescatar, rehabilitar y encontrar nuevas familias para perros y gatos abandonados.</h1>
                </article>
                <article className='info'>
                    <h1 className='titleArticle'>Sobre nuestras mascotas</h1>
                    <h1 className='messageText'>Cada uno de nuestros residentes es evaluado por un veterinario y recibe atención médica, vacunas y un entorno seguro donde pueden socializar y recuperarse. Nos aseguramos de que cada animal esté listo para ser adoptado, brindando información sobre su personalidad, necesidades y características para ayudar a las familias a encontrar la mascota perfecta.</h1>
                    <img className='home-img-text' src={`${API_IMG}media/imagenes/sobre_mascotas.jpg`} alt="Mascotas" />
                </article>
            </main>
            <Home />
        </div>
    );
}

const AppWithRouter = () => (
    <Router>
        <Routes>
            <Route path='/Login' element={<Login />} />
            <Route path='/Animales' element={<Animales />} />
            <Route path='/Donar' element={<Donar />} />
            <Route path='/Registro' element={<Registro />} />
            <Route path='/Ficha_Mascota' element={<FichaMascota />} />
            <Route path='/Adopcion' element={<Adopcion />} />
            <Route path='/Visita' element={<AgendarVisita />} />
            <Route path='/evento/:id_evento/:titulo' element={<Evento />} />
            <Route path='contactanos' element={<Contacto/>}/>
            <Route path='/Perfil/mi_perfil' element={<Perfil/>}/>
            <Route path='/Perfil/historial_donaciones' element={<HistorialDonaciones/>}/>
            <Route path='/Perfil/historial_visitas' element={<HistorialVisitas/>}/>
            <Route path='/Perfil/historial_adopciones' element={<HistorialAdopciones/>}/>
            <Route path='/' element={<App />} />

            <Route path='/Add/mascota' element={<Add_mascota />} />
            <Route path='/Administrador/adopciones' element={<Admin_mascota />} />
            <Route path='/Administrador/visitas' element={<Ad_visitas/>}/>
            <Route path='/Administrador/eventos' element={<Ad_evento/>}/>
            <Route path='/Administrardor/mascotas' element={<Ad_Mascotas/>}/>
            <Route path='/Administrador/dudas' element={<Respuestas/>}/>
        </Routes>
    </Router>
);

export default AppWithRouter;