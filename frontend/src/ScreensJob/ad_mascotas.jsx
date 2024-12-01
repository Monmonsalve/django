import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/ad_mascotas.css";

const API_URLS = {
  especies: 'http://127.0.0.1:8000/api/especies/',
  refugios: 'http://127.0.0.1:8000/api/refugios/',
  razas: (idEspecie) => `http://127.0.0.1:8000/api/razas/?id_especie=${idEspecie}/`,
  actualizarMascota: (idMascota) => `http://127.0.0.1:8000/api/pets/${idMascota}/`
};

const Ad_Mascotas = ({ isOpen, cerrarModal, mascota }) => {
  const [mascotaData, setMascotaData] = useState({
    nombre: '',
    edad: '',
    especie: '',
    raza: '',
    sexo: '',
    refugio: '',
    descripcion: '',
    fecha: '',
    img: null,
    comentarioImg: ''
  });
  const [especies, setEspecies] = useState([]);
  const [razas, setRazas] = useState([]);
  const [refugios, setRefugios] = useState([]);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mascota) {
      setMascotaData(mascota);
      setImagePreview(mascota.img);  // Asume que img es una URL o path válido
    }

    // Obtener especies y refugios
    const fetchEspecies = async () => {
      const response = await axios.get(API_URLS.especies);
      setEspecies(response.data);
    };

    const fetchRefugios = async () => {
      const response = await axios.get(API_URLS.refugios);
      setRefugios(response.data);
    };

    fetchEspecies();
    fetchRefugios();
  }, [mascota]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMascotaData(prevData => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'especie') {
      fetchRazas(value);
    }

    if (name === 'img') {
      const file = e.target.files[0];
      setMascotaData(prevData => ({
        ...prevData,
        img: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchRazas = async (idEspecie) => {
    const response = await axios.get(API_URLS.razas(idEspecie));
    setRazas(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Solo creamos un objeto con los cambios que se han realizado
    const formDataToSend = new FormData();
    
    // Comprobamos y agregamos solo los campos modificados
    if (mascotaData.nombre !== mascota.nombre) formDataToSend.append('nombre', mascotaData.nombre);
    if (mascotaData.edad !== mascota.edad) formDataToSend.append('edad', mascotaData.edad);
    if (mascotaData.especie !== mascota.especie) formDataToSend.append('id_especie', mascotaData.especie);
    if (mascotaData.raza !== mascota.raza) formDataToSend.append('id_raza', mascotaData.raza);
    if (mascotaData.refugio !== mascota.refugio) formDataToSend.append('id_refugio', mascotaData.refugio);
    if (mascotaData.sexo !== mascota.sexo) formDataToSend.append('sexo', mascotaData.sexo);
    if (mascotaData.descripcion !== mascota.descripcion) formDataToSend.append('descripcion', mascotaData.descripcion);
    if (mascotaData.fecha !== mascota.fecha) formDataToSend.append('fecha_llegada', mascotaData.fecha);
    if (mascotaData.comentarioImg !== mascota.comentarioImg) formDataToSend.append('comentario', mascotaData.comentarioImg);
    if (mascotaData.img && mascotaData.img !== mascota.img) formDataToSend.append('img', mascotaData.img);

    try {
      const response = await axios.patch(API_URLS.actualizarMascota(mascota.id_pets), formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      cerrarModal();
      window.location.reload();
    } catch (error) {
      console.error('Error al actualizar la mascota:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null; // Si el modal no está abierto, no se muestra

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Editar Mascota</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={mascotaData.nombre}
              onChange={handleChange}
              required
              className="custom-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edad">Edad</label>
            <input
              type="number"
              id="edad"
              name="edad"
              value={mascotaData.edad}
              onChange={handleChange}
              className="custom-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="especie">Especie</label>
            <select
              id="especie"
              name="especie"
              value={mascotaData.especie}
              onChange={handleChange}
              className="custom-select"
            >
              <option value="">Seleccione una especie</option>
              {especies.map(especie => (
                <option key={especie.id_especie} value={especie.id_especie}>{especie.especie}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="raza">Raza</label>
            <select
              id="raza"
              name="raza"
              value={mascotaData.raza}
              onChange={handleChange}
              className="custom-select"
            >
              <option value="">Seleccione una raza</option>
              {razas.map(raza => (
                <option key={raza.id_raza} value={raza.id_raza}>{raza.raza}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sexo">Sexo</label>
            <select
              id="sexo"
              name="sexo"
              value={mascotaData.sexo}
              onChange={handleChange}
              className="custom-select"
            >
              <option value="">Seleccione</option>
              <option value="macho">Macho</option>
              <option value="hembra">Hembra</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="refugio">Refugio</label>
            <select
              id="refugio"
              name="refugio"
              value={mascotaData.refugio}
              onChange={handleChange}
              className="custom-select"
            >
              <option value="">Seleccione un refugio</option>
              {refugios.map(refugio => (
                <option key={refugio.id_refugio} value={refugio.id_refugio}>{refugio.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={mascotaData.descripcion}
              onChange={handleChange}
              className="custom-textarea"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha">Fecha de Llegada</label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={mascotaData.fecha}
              onChange={handleChange}
              className="custom-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="img">Imagen</label>
            <input
              type="file"
              id="img"
              name="img"
              onChange={handleChange}
              className="custom-input-file"
            />
            {imagePreview && <img src={imagePreview} alt="Vista previa" />}
          </div>

          <div className="form-group">
            <label htmlFor="comentarioImg">Comentario de la imagen</label>
            <input
              type="text"
              id="comentarioImg"
              name="comentarioImg"
              value={mascotaData.comentarioImg}
              onChange={handleChange}
              className="custom-input"
            />
          </div>

          <div className="buttons">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Actualizando..." : "Confirmar"}
            </button>
            <button className="btn btn-danger" onClick={cerrarModal}>
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Ad_Mascotas;
