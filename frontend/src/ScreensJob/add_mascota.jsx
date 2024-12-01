import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importa el hook navigate
import Header from "../header";
import '../css/nueva_mascota.css';
import axios from "axios";
import Home from "../home";

// Definir las URLs de la API
const API_URLS = {
    especies: 'http://127.0.0.1:8000/api/especies/',
    refugios: 'http://127.0.0.1:8000/api/refugios/',
    razas: (idEspecie) => `http://127.0.0.1:8000/api/razas/?id_especie=${idEspecie}`,
    agregarMascota: 'http://127.0.0.1:8000/api/pets/',
    obtenerUsuario: (emailUsuario) => `http://127.0.0.1:8000/api/users/?email=${emailUsuario}`,
    validarToken: 'http://127.0.0.1:8000/api/validate-token/', // Endpoint para validar token
  };
  
  const Add_mascota = () => {
      const [formData, setFormData] = useState({
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
      const [isSuperUser, setIsSuperUser] = useState(null); // Inicialmente null
      const [nombreUsuario, setNombreUsuario] = useState('Usuario'); // Nombre por defecto
      const navigate = useNavigate(); // Hook de navegación
  
      // Validar token y verificar si el usuario es superusuario
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
  
      // Obtener especies y refugios
      useEffect(() => {
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
      }, []);
  
      const handleChange = (e) => {
          const { name, value } = e.target;
          setFormData(prevData => ({
              ...prevData,
              [name]: value
          }));
  
          if (name === 'especie') {
              fetchRazas(value);
          }
  
          if (name === 'img') {
              const file = e.target.files[0];
              setFormData(prevData => ({
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
  
          const formDataToSend = new FormData();
          formDataToSend.append('nombre', formData.nombre);
          formDataToSend.append('edad', formData.edad);
          formDataToSend.append('id_especie', formData.especie);
          formDataToSend.append('id_raza', formData.raza);
          formDataToSend.append('id_refugio', formData.refugio);
          formDataToSend.append('sexo', formData.sexo);
          formDataToSend.append('descripcion', formData.descripcion);
          formDataToSend.append('disponibilidad', true); 
          formDataToSend.append('fecha_llegada', formData.fecha);
          formDataToSend.append('comentario', formData.comentarioImg);
          formDataToSend.append('img', formData.img);
  
          try {
              const response = await axios.post(API_URLS.agregarMascota, formDataToSend, {
                  headers: {
                      'Content-Type': 'multipart/form-data',
                  },
              });
              console.log('Mascota agregada:', response.data);
              
              // Reiniciar el formulario
              setFormData({
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
              setImagePreview(''); // Reiniciar vista previa de imagen
  
              // Recargar la página
              window.location.reload();
          } catch (error) {
              console.error('Error al agregar mascota:', error);
          }
      };

    return (
        <div>
            <Header />
            <main className="formulario-nueva-mascota">
                <div className="form">
                    <form className="formulario-mascota" onSubmit={handleSubmit}>
                    <h1 className="Titulo-nueva-mascota">Agregar Nueva Mascota</h1>
                        <div className="form-group">
                            <label htmlFor="nombre" className="nombre">Nombre</label>
                            <input type="text" id="nombre" name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="edad" className="edad">Edad</label>
                            <input type="number" id="edad" name="edad" className="form-control" value={formData.edad} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="especie" className="especie">Especie</label>
                            <select id="especie" name="especie" className="form-control" value={formData.especie} onChange={handleChange} required>
                                <option value="">Seleccione una especie</option>
                                {especies.map(especie => (
                                    <option key={especie.id_especie} value={especie.id_especie}>{especie.especie}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="raza" className="raza">Raza</label>
                            <select id="raza" name="raza" className="form-control" value={formData.raza} onChange={handleChange} required>
                                <option value="">Seleccione una raza</option>
                                {razas.map(raza => (
                                    <option key={raza.id_raza} value={raza.id_raza}>{raza.raza}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="sexo" className="sexo">Sexo</label>
                            <select id="sexo" name="sexo" className="form-control" value={formData.sexo} onChange={handleChange} required>
                                <option value="">Seleccione</option>
                                <option value="macho">Macho</option>
                                <option value="hembra">Hembra</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="refugio" className="refugio">Refugio</label>
                            <select id="refugio" name="refugio" className="form-control" value={formData.refugio} onChange={handleChange} required>
                                <option value="">Seleccione un refugio</option>
                                {refugios.map(refugio => (
                                    <option key={refugio.id_refugio} value={refugio.id_refugio}>{refugio.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="descripcion" className="descripcion">Descripción</label>
                            <textarea id="descripcion" name="descripcion" className="form-control" value={formData.descripcion} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="fecha" className="fecha">Fecha de Llegada</label>
                            <input type="date" id="fecha" name="fecha" className="form-control" value={formData.fecha} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="img" className="imagen">Imagen</label>
                            <input 
                                type="file" 
                                id="img" 
                                name="img" 
                                className="form-control" 
                                onChange={handleChange} 
                                required 
                                accept=".jpg,.jpeg,.png,.gif" 
                            />
                        </div>
                        {imagePreview && (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Vista previa" />
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="comentarioImg" className="comentarioImg">Comentario de la imagen</label>
                            <input type="text" id="comentarioImg" name="comentarioImg" className="form-control" value={formData.comentarioImg} onChange={handleChange} />
                        </div>
                        <button type="submit" className="submit-btn">Agregar Mascota</button>
                    </form>
                </div>
            </main>
            <Home/>
        </div>
    );
};

export default Add_mascota;