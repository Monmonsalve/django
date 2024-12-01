import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';
import Header from "../header";
import Home from "../home";
import "../css/ad_eventos.css";

const BASE_URL = 'http://127.0.0.1:8000/api/eventos/';
const API_URLS = {
    validarToken: 'http://127.0.0.1:8000/api/validate-token/',
    obtenerUsuario: (email) => `http://127.0.0.1:8000/api/users/?email=${email}`
};

const Ad_evento = () => {
    const [eventos, setEventos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibleEdit, setModalVisibleEdit] = useState(false);
    const [modalVisibleDelete, setModalVisibleDelete] = useState(false);
    const [nuevoEvento, setNuevoEvento] = useState({
        titulo: '',
        descripcion: '',
        imagen: null,
        disponibilidad: true
    });
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    const [contadorDescripcion, setContadorDescripcion] = useState(0);
    const [contadorDescripcionEdit, setContadorDescripcionEdit] = useState(0);
    const [isSuperUser, setIsSuperUser] = useState(false);
    const [nombreUsuario, setNombreUsuario] = useState('Usuario');
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

    useEffect(() => {
        const obtenerEventos = async () => {
            try {
                const response = await axios.get(BASE_URL);
                setEventos(response.data);
            } catch (error) {
                console.error('Error al obtener eventos:', error);
            }
        };

        obtenerEventos();
    }, []);

  const recortarDescripcion = (descripcion) => {
    const palabras = descripcion.split(' ');
    if (palabras.length > 10) {
      return palabras.slice(0, 10).join(' ') + '...';
    }
    return descripcion;
  };

  const agregarEvento = async () => {
    try {
      const formData = new FormData();
      formData.append('titulo', nuevoEvento.titulo);
      formData.append('descripcion', nuevoEvento.descripcion);
      formData.append('imagen', nuevoEvento.imagen);
      formData.append('disponibilidad', nuevoEvento.disponibilidad);

      const response = await axios.post(BASE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setEventos([...eventos, response.data]);
      setModalVisible(false);
      window.location.reload();
    } catch (error) {
      console.error('Error al agregar el evento:', error);
    }
  };

  const actualizarEvento = async () => {
    try {
      const eventoOriginal = eventos.find(evento => evento.id_evento === eventoSeleccionado.id_evento);
  
      if (!eventoOriginal) {
        console.error("Evento no encontrado para actualizar.");
        return;
      }
  
      const formData = new FormData();
  
      if (eventoSeleccionado.titulo !== eventoOriginal.titulo) {
        formData.append('titulo', eventoSeleccionado.titulo);
      }
  
      if (eventoSeleccionado.descripcion !== eventoOriginal.descripcion) {
        formData.append('descripcion', eventoSeleccionado.descripcion);
      }
  
      if (eventoSeleccionado.imagen && eventoSeleccionado.imagen !== eventoOriginal.imagen) {
        formData.append('imagen', eventoSeleccionado.imagen);
      }
  
      if (eventoSeleccionado.disponibilidad !== eventoOriginal.disponibilidad) {
        formData.append('disponibilidad', eventoSeleccionado.disponibilidad);
      }
  
      const response = await axios.patch(`${BASE_URL}${eventoSeleccionado.id_evento}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      setEventos(eventos.map(evento =>
        evento.id_evento === response.data.id_evento ? response.data : evento
      ));
      setModalVisibleEdit(false);
      window.location.reload();
    } catch (error) {
      console.error('Error al actualizar el evento:', error);
    }
  };

  const eliminarEvento = async () => {
    try {
      const formData = new FormData();
      formData.append('disponibilidad', false);

      await axios.patch(`${BASE_URL}${eventoSeleccionado.id_evento}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setModalVisibleDelete(false);
      window.location.reload();
    } catch (error) {
      console.error('Error al actualizar el evento:', error);
    }
  };

  useEffect(() => {
    const obtenerEventos = async () => {
      try {
        const response = await axios.get(BASE_URL);
        setEventos(response.data);
      } catch (error) {
        console.error('Error al obtener eventos:', error);
      }
    };

    obtenerEventos();
  }, []);

  const mostrarModalNuevo = () => {
    setModalVisible(true);
  };

  const mostrarModalEditar = (evento) => {
    setEventoSeleccionado(evento);
    setModalVisibleEdit(true);
  };

  const mostrarModalAceptacion = (evento) => {
    setEventoSeleccionado(evento);
    setModalVisibleDelete(true);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    if (name === 'descripcion') {
      setContadorDescripcionEdit(value.length);
    }
    setNuevoEvento((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejarImagen = (e) => {
    const { name, files } = e.target;
    if (name === 'imagen') {
      setNuevoEvento((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const cerrarModalNuevo = () => {
    setModalVisible(false);
    setNuevoEvento({ titulo: '', descripcion: '', imagen: null, disponibilidad: true });
  };

  const cerrarModalAceptacion = () => {
    setModalVisibleDelete(false);
  };

  const cerrarModalEditar = () => {
    setModalVisibleEdit(false);
  };

  return (
    <div>
      <Header />
      <div className="container mt-4">
        <h1>Administrar Eventos</h1>

        <button className="btn btn-primary mb-3" onClick={mostrarModalNuevo}>
          Nuevo Evento
        </button>

        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Número Evento</th>
                <th>Imagen</th>
                <th>Título</th>
                <th>Descripción</th>
                <th>Editar</th>
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento, index) => (
                <tr key={evento.id_evento}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={evento.imagen}
                      alt={evento.titulo}
                      className="rounded float-left"
                      width="50"
                    />
                  </td>
                  <td>{evento.titulo}</td>
                  <td className="descripcion">
                    {recortarDescripcion(evento.descripcion)}
                  </td>
                  <td>
                    <i className="bi bi-pencil" onClick={() => mostrarModalEditar(evento)}></i>
                  </td>
                  <td>
                    <i
                      className="bi bi-x-square-fill"
                      style={{ color: evento.disponibilidad ? 'green' : 'red' }}
                      onClick={() => mostrarModalAceptacion(evento)}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de nuevo evento */}
        {modalVisible && (
          <div className="modal-overlay">
            <div className="modal-content-e p-4 bg-light rounded">
              <h3 className="mb-3">Nuevo Evento</h3>

              <div className="mb-3">
                <label className="form-label">Título:</label>
                <input
                  type="text"
                  name="titulo"
                  className="form-control"
                  value={nuevoEvento.titulo}
                  onChange={manejarCambio}
                  placeholder="Ingrese el título del evento"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Descripción:</label>
                <p>Max 1790: {contadorDescripcionEdit} caracteres</p>
                <textarea
                  name="descripcion"
                  className="form-control txt-area"
                  value={nuevoEvento.descripcion}
                  onChange={manejarCambio}
                  placeholder="Ingrese la descripción del evento"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Imagen:</label>
                <input
                  type="file"
                  name="imagen"
                  className="form-control"
                  onChange={manejarImagen}
                  required
                />
              </div>

              <div className="d-flex justify-content-between">
                <button className="btn btn-primary" onClick={agregarEvento}>Agregar Evento</button>
                <button className="btn btn-danger" onClick={cerrarModalNuevo}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {modalVisibleDelete && eventoSeleccionado && (
          <div className="modal-overlay">
            <div className="modal-content-e p-4 bg-light rounded">
              <h3 className="mb-3">¿Estás seguro de que deseas eliminar este evento?</h3>
              <p>{eventoSeleccionado.titulo}</p>

              <div className="d-flex justify-content-between">
                <button className="btn btn-danger" onClick={eliminarEvento}>Sí, eliminar</button>
                <button className="btn btn-secondary" onClick={cerrarModalAceptacion}>No, cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de editar evento */}
        {modalVisibleEdit && eventoSeleccionado && (
          <div className="modal-overlay">
            <div className="modal-content-e p-4 bg-light rounded">
              <h3 className="mb-3">Editar Evento</h3>

              <div className="mb-3">
                <label className="form-label">Título:</label>
                <input
                  type="text"
                  name="titulo"
                  className="form-control"
                  value={eventoSeleccionado.titulo}
                  onChange={manejarCambio}
                  placeholder="Ingrese el título del evento"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Descripción:</label>
                <p>Max 1790: {contadorDescripcionEdit} caracteres</p>
                <textarea
                  name="descripcion"
                  className="form-control txt-area"
                  value={eventoSeleccionado.descripcion}
                  onChange={manejarCambio}
                  placeholder="Ingrese la descripción del evento"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Imagen:</label>
                <input
                  type="file"
                  name="imagen"
                  className="form-control"
                  onChange={manejarImagen}
                />
              </div>

              <div className="d-flex justify-content-between">
                <button className="btn btn-primary" onClick={actualizarEvento}>Actualizar Evento</button>
                <button className="btn btn-danger" onClick={cerrarModalEditar}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Home />
    </div>
  );
};

export default Ad_evento;
