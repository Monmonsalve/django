import React, { useEffect, useState } from "react";
import Header from "../header";
import Home from "../home";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './../css/ad_adopcion.css';
import { useNavigate } from "react-router-dom";

// Definir las URLs de la API
const API_URLS = {
  adopciones: 'http://127.0.0.1:8000/api/adoptantes/',
  mascotas: 'http://127.0.0.1:8000/api/pets/',
  usersAdopcion: 'http://127.0.0.1:8000/api/users/adopcion',
  documentos: 'http://127.0.0.1:8000/api/documentos/',
  actualizarAdopcion: (idAdopcion) => `http://127.0.0.1:8000/api/adoptantes/${idAdopcion}/`
};

const Admin_mascota = () => {
  const [adopciones, setAdopciones] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("Seleccione un estado");
  const [cantidadMostrar, setCantidadMostrar] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [adopcionSeleccionada, setAdopcionSeleccionada] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [nuevoEstado, setNuevoEstado] = useState("");
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

  const fetchData = async () => {
    try {
      const responseAdopciones = await axios.get(API_URLS.adopciones);
      const adopcionesData = responseAdopciones.data;
      const responseMascotas = await axios.get(API_URLS.mascotas);
      const mascotasData = responseMascotas.data;
      const responseUsers = await axios.get(API_URLS.usersAdopcion);
      const usersData = responseUsers.data;

      const mascotasMap = {};
      mascotasData.forEach(mascota => {
        mascotasMap[mascota.id_pets] = mascota.nombre;
      });

      const usersMap = {};
      usersData.forEach(user => {
        usersMap[user.id_user] = { nombre: user.nombre + " " + user.apellidos, email: user.email };
      });

      const adopcionesConInfo = adopcionesData.map(adopcion => ({
        ...adopcion,
        nombremascota: mascotasMap[adopcion.id_pets] || "No disponible",
        usuario: usersMap[adopcion.id_user] || { nombre: "No disponible", email: "No disponible" }
      }));

      setAdopciones(adopcionesConInfo);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const adopcionesFiltradas = adopciones
    .filter(adopcion => estadoFiltro === "Seleccione un estado" || adopcion.estados === estadoFiltro)
    .slice(0, cantidadMostrar);

  const fetchDocumentos = async (id_adoptante) => {
    if (!id_adoptante) {
      console.error("El id_adoptante es requerido");
      return;
    }
    try {
      const url = new URL(API_URLS.documentos);
      url.searchParams.append('id_adoptante', id_adoptante);
      const response = await axios.get(url.toString());
      setDocumentos(response.data);
    } catch (error) {
      console.error("Error al obtener los documentos:", error);
    }
  };

  const verDatos = (adopcion) => {
    setAdopcionSeleccionada(adopcion);
    setNuevoEstado(adopcion.estados);
    fetchDocumentos(adopcion.id_adoptante);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setAdopcionSeleccionada(null);
    setDocumentos([]);
  };

  const actualizarEstado = async () => {
    if (adopcionSeleccionada) {
      try {
        const url = API_URLS.actualizarAdopcion(adopcionSeleccionada.id_adoptante);
        const response = await axios.patch(url, {
          estados: nuevoEstado,
        });
        setAdopciones(prev =>
          prev.map(adop => adop.id_adoptante === adopcionSeleccionada.id_adoptante
            ? { ...adop, estados: nuevoEstado }
            : adop
          )
        );
        cerrarModal();
      } catch (error) {
        console.error("Error al actualizar el estado:", error.response?.data || error);
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="container-fluid">
        <div className="card-body-container">
          <div className="datatable">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
              {/* Selector de cantidad */}
              <div className="form-group d-flex align-items-center mb-2">
                <label className="me-2 mb-0">Cantidad:</label>
                <select
                  className="form-select"
                  style={{ maxWidth: '100px' }}
                  value={cantidadMostrar}
                  onChange={(e) => setCantidadMostrar(parseInt(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                </select>
              </div>

              {/* Selector de filtro */}
              <div className="form-group d-flex align-items-center mb-2">
                <label className="me-2 mb-0">Filtro:</label>
                <select
                  className="form-select"
                  style={{ maxWidth: '200px' }}
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value)}
                >
                  <option>Seleccione un estado</option>
                  <option value="Proceso">Procesos</option>
                  <option value="Negado">Denegados</option>
                  <option value="Aprobado">Aprobadas</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Mascota</th>
                    <th>Estado</th>
                    <th>Papeles</th>
                  </tr>
                </thead>
                <tbody>
                  {adopcionesFiltradas.map(adopcion => (
                    <tr key={adopcion.id_adoptante}>
                      <th>{adopcion.fecha_adopcion}</th>
                      <td>{adopcion.usuario.nombre}</td>
                      <td>{adopcion.usuario.email}</td>
                      <td>{adopcion.nombremascota}</td>
                      <td>{adopcion.estados}</td>
                      <td>
                        <i className="bi bi-journal-album" onClick={() => verDatos(adopcion)}></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Detalles de la Adopción</h3>
            <p><strong>Fecha:</strong> {adopcionSeleccionada.fecha_adopcion}</p>
            <p><strong>Usuario:</strong> {adopcionSeleccionada.usuario.nombre}</p>
            <p><strong>Email:</strong> {adopcionSeleccionada.usuario.email}</p>

            <h5>Documentos de Adopción:</h5>
            {documentos.length > 0 ? (
              documentos.map((documento, index) => (
                <div
                  key={index}
                  onClick={() => window.open(documento.documento, "_blank")}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    border: "1px solid #ccc",
                    marginBottom: "10px",
                    textAlign: "center",
                  }}
                >
                  {["Fotos carnet", "Formulario adopción", "Comprobante domicilio", "Contrato adopción"][index] || `Documento ${index + 1}`}
                </div>
              ))
            ) : (
              <p>No hay documentos disponibles.</p>
            )}

            <div className="Estado">
              <label>Estado de adopción: </label>
              <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)} className="select">
                <option value="Proceso">En Proceso</option>
                <option value="Negado">Denegar</option>
                <option value="Aprobado">Aprobar</option>
              </select>
            </div>
            <div className="buttons">
              <button className="btn btn-primary" onClick={actualizarEstado}>Actualizar Estado</button>
              <button className="btn btn-danger" onClick={cerrarModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <Home />
    </div>
  );
};

export default Admin_mascota;