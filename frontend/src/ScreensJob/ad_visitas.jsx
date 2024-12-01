import React, { useState, useEffect } from "react";
import Header from "../header";
import Home from "../home";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';  // Icono de Bootstrap
import { useNavigate } from "react-router-dom";

const Ad_visitas = () => {
  // Constantes con los enlaces de la API
  const API_FECHAS_VISITA = "http://127.0.0.1:8000/api/fechas-visita/";
  const API_PETS = "http://127.0.0.1:8000/api/pets/";
  const API_USERS = "http://127.0.0.1:8000/api/users/";

  const [visitas, setVisitas] = useState([]);  // Datos de visitas
  const [cantidadMostrar, setCantidadMostrar] = useState(10);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [modalVisible, setModalVisible] = useState(false);  // Estado del modal
  const [visitaSeleccionada, setVisitaSeleccionada] = useState(null);  // Visita seleccionada para mostrar en el modal
  const [horaSeleccionada, setHoraSeleccionada] = useState(""); // Hora seleccionada en el calendario
  const [loading, setLoading] = useState(false); // Estado de carga para evitar múltiples envíos
  const [cambiarHora, setCambiarHora] = useState(false); // Estado para saber si el usuario quiere cambiar la hora
  const [nombreUsuario, setNombreUsuario] = useState('');  // Nombre del usuario
  const [isSuperUser, setIsSuperUser] = useState(false);  // Estado para saber si el usuario es superusuario

  const navigate = useNavigate();

  // Función para formatear la hora (eliminando los segundos)
  const formatearHora = (hora) => {
    if (hora) {
      return hora.slice(0, 5);  // Cortamos la cadena para que solo quede "HH:MM"
    }
    return hora;  // Si no hay hora, devolver vacío o nulo
  };

  // Obtener los datos de las visitas, usuarios y mascotas
  const fetchData = async () => {
    try {
      // Obtener datos de las visitas
      const responseVisitas = await axios.get(API_FECHAS_VISITA);
      const visitasData = responseVisitas.data;

      // Obtener datos de las mascotas
      const responseMascotas = await axios.get(API_PETS);
      const mascotasData = responseMascotas.data;

      // Obtener datos de los usuarios
      const responseUsers = await axios.get(API_USERS);
      const usersData = responseUsers.data;

      // Crear un mapa de mascotas con su id
      const mascotasMap = {};
      mascotasData.forEach(mascota => {
        mascotasMap[mascota.id_pets] = mascota.nombre;
      });

      // Crear un mapa de usuarios con su id
      const usersMap = {};
      usersData.forEach(user => {
        usersMap[user.id_user] = { nombre: user.nombre + " " + user.apellidos, email: user.email };
      });

      // Combinar los datos de visitas con la información de los usuarios y mascotas
      const visitasConInfo = visitasData.map(visita => ({
        ...visita,
        nombremascota: mascotasMap[visita.id_pets] || "No disponible",
        usuario: usersMap[visita.id_user] || { nombre: "No disponible", email: "No disponible" }
      }));

      setVisitas(visitasConInfo);  // Guardar los datos combinados en el estado
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  // Ejecutar fetchData cuando el componente se monte
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
        const tokenResponse = await fetch("http://127.0.0.1:8000/api/validarToken", {
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
          const userResponse = await fetch(`http://127.0.0.1:8000/api/users/${emailUsuario}`, {
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

  // Filtrar visitas por estado (si es necesario)
  const visitasFiltradas = visitas.filter((visita) =>
    estadoFiltro ? visita.estado === estadoFiltro : true
  );

  // Función para mostrar el modal
  const mostrarModal = (visita) => {
    setVisitaSeleccionada(visita);
    setHoraSeleccionada(visita.hora_visita || "");  // Si ya tiene una hora asignada, ponerla como hora seleccionada
    setCambiarHora(false);  // Resetear el estado de cambiar hora
    setModalVisible(true);
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setModalVisible(false);
    setCambiarHora(false);  // Resetear estado de cambiar hora cuando se cierra el modal
  };

  // Función para generar las horas del calendario
  const generarHoras = () => {
    const horas = [];
    for (let i = 8; i <= 17; i++) {
      const hora = `${i < 10 ? '0' : ''}${i}:00`;
      horas.push(hora);
    }
    return horas;
  };

  // Verificar si una hora está ocupada para la mascota seleccionada
  const estaHoraOcupada = (hora) => {
    const horaSeleccionadaFormateada = hora.slice(0, 5);  // Solo HH:MM
    return visitasFiltradas.some(
      (visita) =>
        visita.fecha_visita === visitaSeleccionada.fecha_visita &&
        visita.id_pets === visitaSeleccionada.id_pets &&
        formatearHora(visita.hora_visita) === horaSeleccionadaFormateada
    );
  };

  // Función para actualizar la hora de la visita en la API
  const actualizarHora = async () => {
    if (!horaSeleccionada || loading) return;

    setLoading(true); // Activar el estado de carga para evitar múltiples envíos

    try {
      const response = await axios.patch(`${API_FECHAS_VISITA}${visitaSeleccionada.id_visita}/`, {
        hora_visita: horaSeleccionada,
      });

      // Actualizar el estado de las visitas con la nueva hora
      const updatedVisitas = visitas.map((visita) =>
        visita.id_visita === visitaSeleccionada.id_visita
          ? { ...visita, hora_visita: horaSeleccionada }
          : visita
      );

      setVisitas(updatedVisitas);
      setModalVisible(false); // Cerrar el modal después de la actualización
    } catch (error) {
      console.error("Error al actualizar la hora de la visita:", error);
    } finally {
      setLoading(false); // Desactivar el estado de carga
    }
  };

  return (
    <div>
      <Header />
      <div className="Container-visitas">
        <h1 className="title-visita">Administrar Visitas</h1>

        <div className="datatable">
          {/* Filtros y selección de cantidad */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="form-group">
              <label className="me-2">Cantidad:</label>
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
              </select>
            </div>
          </div>

          {/* Tabla de visitas */}
          <div className="table-responsive"> 
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Mascota</th>
                  <th>Fecha Visita</th>
                  <th>Hora Visita</th>
                  <th>Agendar</th>
                </tr>
              </thead>
              <tbody>
                {visitasFiltradas.slice(0, cantidadMostrar).map((visita) => (
                  <tr key={visita.id_visita}>
                    <td>{visita.usuario.nombre}</td>
                    <td>{visita.usuario.email}</td>
                    <td>{visita.nombremascota}</td>
                    <td>{visita.fecha_visita}</td>
                    <td>{formatearHora(visita.hora_visita)}</td> {/* Formateamos la hora aquí */}
                    <td>
                      <i className="bi bi-hourglass-bottom" onClick={() => mostrarModal(visita)}></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalVisible && visitaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Calendario</h3>
            <p><strong>Usuario:</strong> {visitaSeleccionada.usuario.nombre}</p>
            <p><strong>Fecha Visita:</strong> {visitaSeleccionada.fecha_visita}</p>

            {/* Mostrar hora de visita si existe */}
            <p><strong>Hora Visita:</strong> {formatearHora(visitaSeleccionada.hora_visita) || "No asignada"}</p>

            {/* Si ya tiene hora asignada, mostrar el botón "Cambiar Hora" */}
            {visitaSeleccionada.hora_visita && !cambiarHora && (
              <button className="btn btn-warning" onClick={() => setCambiarHora(true)}>
                Cambiar Hora
              </button>
            )}

            {/* Mostrar las horas disponibles si el usuario desea cambiar la hora */}
            {(cambiarHora || !visitaSeleccionada.hora_visita) && (
              <div>
                <h5>Seleccionar hora:</h5>
                {generarHoras().map((hora) => (
                  <button
                    key={hora}
                    className={`btn ${hora === horaSeleccionada ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setHoraSeleccionada(hora)}
                    disabled={estaHoraOcupada(hora)} // Deshabilitar si está ocupada
                  >
                    {hora} {estaHoraOcupada(hora) && "(Ocupada)"}
                  </button>
                ))}
              </div>
            )}

            {/* Botones para confirmar la selección o cerrar */}
            <div className="buttons">
              <button className="btn btn-primary" onClick={actualizarHora} disabled={loading}>
                {loading ? "Actualizando..." : "Confirmar Hora"}
              </button>
              <button className="btn btn-danger" onClick={cerrarModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <Home />
    </div>
  );
};

export default Ad_visitas;
