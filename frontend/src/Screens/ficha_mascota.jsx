import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../header';
import './../css/ficha_mascota.css'; 
import axios from 'axios';
import Home from '../home';

const FichaMascota = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { pet } = location.state; // Recibimos los datos de la mascota
    const [refugio, setRefugio] = useState(null);
    const [raza, setRaza] = useState(null);
    const [image, setImage] = useState('placeholder_image_url'); // Placeholder por defecto

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener la información del refugio
                const responseRefugio = await axios.get(`http://127.0.0.1:8000/api/refugios/${pet.id_refugio}/`);
                setRefugio(responseRefugio.data);

                // Obtener la información de la raza
                const responseRaza = await axios.get(`http://127.0.0.1:8000/api/razas/${pet.id_raza}/`);
                setRaza(responseRaza.data);
            } catch (error) {
                console.error(`Error fetching data for pet ID ${pet.id_pets}:`, error);
                setRefugio(null);
                setRaza(null);
            }
        };

        fetchData();
    }, [pet.id_pets, pet.id_refugio, pet.id_raza]); 

    return (
        <div>
            <Header />
            <main className="ficha-mascota">
                <h1>Detalles de {pet.nombre}</h1>
                <div className="mascota-detalle d-flex">
                    <img 
                        src={pet.img || 'placeholder_image_url'} // Usa la URL de la imagen del estado
                        alt={`Imagen de ${pet.nombre}`} 
                        className="mascota-imagen" 
                    />
                    <div className="container my-4">
                    <div className="row p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <div className="col-12">
                        <p><b>Nombre:</b> {pet.nombre}</p>
                        <p><b>Edad:</b> {pet.edad} años</p>
                        <p><b>Raza:</b> {raza ? raza.raza : 'Cargando...'}</p>
                        <p><b>Sexo:</b> {pet.sexo}</p>
                        <p><b>Refugio:</b> {refugio ? refugio.nombre : 'Cargando...'}</p>
                        <p><b>Dirección:</b> {refugio ? refugio.direccion : 'Cargando...'}</p>
                        <p><b>Teléfono:</b> {refugio ? refugio.telefono : 'Cargando...'}</p>
                        <p><b>Descripción:</b> {pet.descripcion}</p>
                        </div>
                    </div>
                    </div>
                    <div className="botones">
                        <button type="button" className="btn btn-light btn-lg btn-block" onClick={() => navigate('/Visita', {state: { pet }})}>Agendar Visita</button>
                        <button type="button" className="btn btn-success btn-lg btn-block" onClick={() => navigate('/Adopcion', { state: { pet } })}>Adoptar</button>
                    </div>
                </div>
            </main>
            <Home />
        </div>
    );
};

export default FichaMascota;
