import React, { useEffect, useState } from "react";
import Header from "../header";
import "./../css/mascota.css";
import Home from "../home";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import Ad_Mascotas from "../ScreensJob/ad_mascotas";  // Asegúrate de importar el componente

const Animales = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);  // Estado para controlar la apertura del modal
  const [selectedPet, setSelectedPet] = useState(null);  // Estado para almacenar la mascota seleccionada
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);  // Estado para abrir el modal de eliminar

  // Obtener mascotas al cargar el componente
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/pets/');
        setPets(response.data);
      } catch (err) {
        console.error("Error fetching pets:", err);
        setError("Error al cargar las mascotas.");
      } finally {
        setLoading(false);
      }
    };

    // Verificar si el usuario está autenticado y es superuser
    const fetchUserDetails = async () => {
      const emailUsuario = localStorage.getItem('emailUsuario');
      const token = localStorage.getItem('token');

      if (emailUsuario && token) {
        setIsAuthenticated(true);
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/users/?email=${emailUsuario}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setIsSuperUser(data[0].is_superuser);
          } else {
            setIsSuperUser(false);
          }
        } catch (error) {
          console.error('Error al obtener los detalles del usuario:', error);
        }
      }
    };

    fetchPets();
    fetchUserDetails();
  }, []);

  // Función para abrir el modal de edición con los datos de la mascota seleccionada
  const handleEditClick = (pet) => {
    if (pet) {
      setSelectedPet(pet);
      setIsModalOpen(true);
    } else {
      console.error("No se ha seleccionado una mascota válida.");
    }
  };

  // Función para abrir el modal de eliminación
  const handleDeleteClick = (pet) => {
    setSelectedPet(pet);
    setIsDeleteModalOpen(true); // Abrir modal de eliminación
  };

  // Función para eliminar la mascota
  const handleDeletePet = async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/pets/${selectedPet.id_pets}/`);
      setPets(pets.filter((pet) => pet.id_pets !== selectedPet.id_pets)); // Eliminar mascota del estado
      setIsDeleteModalOpen(false); // Cerrar modal de eliminación
      setSelectedPet(null);
      window.location.reload();
    } catch (err) {
      console.error("Error al eliminar la mascota:", err);
      setError("Error al eliminar la mascota.");
      setIsDeleteModalOpen(false); // Cerrar modal en caso de error
    }
  };

  // Función para cerrar el modal de eliminación
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedPet(null);
  };

  // Función para cerrar el modal de edición
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPet(null);
  };

  return (
    <div>
      <Header />
      <main className="mascotas">
        <h1 className="title-pet">Mascotas Disponibles</h1>
        {loading ? (
          <div>Cargando...</div>
        ) : error ? (
          <div>{error}</div>
        ) : (
          <div className="row">
  {pets.length === 0 ? (
    <div>No hay mascotas disponibles.</div>
  ) : (
    pets.map((pet) => (
      <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={pet.id_pets}>
        <div className="card mb-4 box-shadow">
          <img
            className="card-img-top w-100"  // Asegura que la imagen ocupe todo el ancho
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
              {isSuperUser && (
                <div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleEditClick(pet)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteClick(pet)}
                  >
                    Eliminar
                  </button>
                </div>
              )}
              {!isSuperUser && (
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
              )}
            </div>
          </div>
        </div>
      </div>
    ))
  )}
</div>

        )}
      </main>

      {/* Modal para editar mascota */}
      <Ad_Mascotas
        isOpen={isModalOpen}
        cerrarModal={handleCloseModal}
        mascota={selectedPet}
      />

      {/* Modal de confirmación de eliminación */}
      {isDeleteModalOpen && (
        <div className="modal show" style={{ display: 'block' }} aria-modal="true" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Deseas eliminar a {selectedPet?.nombre}?</h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={handleCloseDeleteModal}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>Esta acción no puede deshacerse.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseDeleteModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeletePet}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Home />
    </div>
  );
};

export default Animales;
