import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';  // Importa useNavigate y Link
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './css/header.css';

const Header = () => {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const API_Logo = 'http://127.0.0.1:8000/';

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isAuthenticated) {
        const emailUsuario = localStorage.getItem('emailUsuario');
        if (emailUsuario) {
          try {
            const response = await fetch(`http://127.0.0.1:8000/api/users/?email=${emailUsuario}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            });
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              setIsSuperUser(data[0].is_superuser);  // Verificar si el usuario es superusuario
            } else {
              setIsSuperUser(false);
            }
          } catch (error) {
            console.error('Error al obtener los detalles del usuario:', error);
          }
        }
      }
    };

    fetchUserDetails();
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('emailUsuario');
    setIsAuthenticated(false);
    navigate('/');
    window.location.reload();
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <div>
      <header className="p-3 text-bg-dark">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-between">
            <a onClick={() => navigate('/')} className="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none">
              <img className='Logotipo' src={`${API_Logo}media/imagenes/logo.png`} alt="Logotipo" />
            </a>

            <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
              {/* Navbar para usuarios normales */}
            </ul>

            <div className="text-end">
              {isAuthenticated ? (
                <div className="header-container d-flex flex-column align-items-center align-items-md-end">
                  {/* Mensaje de Bienvenida */}
                  <h1 className="userWelcome text-white text-center mb-2 d-none d-md-block" style={{ fontSize: 'medium' }}>
                    Bienvenido
                  </h1>

                  {/* Dropdown */}
                  <div className="dropdown">
                    <a
                      className="d-block text-decoration-none dropdown-toggle"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleDropdown();
                      }}
                    >
                      <i className="bi bi-person-circle" style={{ fontSize: '32px', color: 'white' }}></i>
                    </a>
                    {dropdownOpen && (
                      <ul className="dropdown-menu text-small show">
                        {isSuperUser ? (
                          <>
                            <li>
                              <Link to={'/Perfil/mi_perfil'} className="dropdown-item">
                                Perfil
                              </Link>
                            </li>
                            <li>
                              <hr className="dropdown-divider" />
                            </li>
                            <li>
                              <a className="dropdown-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                                Cerrar Sesión
                              </a>
                            </li>
                          </>
                        ) : (
                          <>
                            <li>
                              <Link to={'/Perfil/historial_adopciones'} className="dropdown-item">
                                Mis Adopciones
                              </Link>
                            </li>
                            <li>
                              <Link to={'/Perfil/historial_donaciones'} className="dropdown-item">
                                Mis Donaciones
                              </Link>
                            </li>
                            <li>
                              <Link to={'/Perfil/historial_visitas'} className="dropdown-item">
                                Mis Visitas
                              </Link>
                            </li>
                            <li>
                              <Link to={'/Perfil/mi_perfil'} className="dropdown-item">
                                Perfil
                              </Link>
                            </li>
                            <li>
                              <hr className="dropdown-divider" />
                            </li>
                            <li>
                              <a className="dropdown-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                                Cerrar Sesión
                              </a>
                            </li>
                          </>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column flex-md-row align-items-center gap-2">
                  {/* Botones Iniciar Sesión y Registro */}
                  <button
                    type="button"
                    className="btn btn-outline-success w-100 w-md-auto"
                    onClick={() => navigate('/Login')}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    type="button"
                    className="btn btn-warning w-100 w-md-auto"
                    onClick={() => navigate('/Registro')}
                  >
                    Registro
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navbar según tipo de usuario */}
      <div className="text-end">
        {!isSuperUser ? (
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
              <a className="navbar-brand">Agrupacion Colitas Felices</a>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarResponsive"
                aria-controls="navbarResponsive"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse" id="navbarResponsive">
                <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <button className="btn btn-link nav-link text-center" onClick={() => navigate('/')}>
                      Inicio <i className="bi bi-house"></i>
                    </button>
                  </li>
                  <li className="nav-item">
                  <button className="btn btn-link nav-link text-center" onClick={() => window.location.href = 'https://esponsor.com/colitasfelices'}>
                      Donar
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-link nav-link text-center" onClick={() => navigate('/Animales')}>
                      Mascotas
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-link nav-link text-center" onClick={() => navigate('/SobreNosotros')}>
                      Sobre Nosotros <i className="bi bi-person-arms-up"></i>
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-link nav-link text-center" onClick={() => navigate('/contactanos')}>
                      Contáctanos <i className="bi bi-book-half"></i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        ) : (
          <nav className="navbar navbar-dark bg-dark" aria-label="Navbar">
            <div className="container-fluid">
              <a className="navbar-brand">Panel Administrador</a>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav me-auto mb-2">
                  <li className="nav-item">
                    <button className="btn btn-link nav-link text-light" onClick={() => navigate('/Administrador/adopciones')}>
                      Ad. Adopciones <i className="bi bi-house"></i>
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-link nav-link text-light" onClick={() => navigate('/Administrador/visitas')}>
                      Ad. Visitas
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-link nav-link text-light" onClick={() => navigate('/Animales')}>
                      Ad. Mascotas
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-link nav-link text-light" onClick={() => navigate('/Administrador/eventos')}>
                      Ad. Eventos <i className="bi bi-newspaper"></i>
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-link nav-link text-light" onClick={() => navigate('/Add/mascota')}>
                      Ag. Mascotas
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-link nav-link text-light" onClick={() => navigate('/Administrador/dudas')}>
                      Dudas Usuarios <i className="bi bi-book-half"></i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Header;