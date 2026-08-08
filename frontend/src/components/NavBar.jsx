import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, useNavigate} from "react-router-dom";
import "../styles/NavBar.css";
import useAuth from "../context/authentication/useAuth";
import logoAdoptaTuCanino from "../assets/logo_navbar_adopta_tu_canino.png"

function NavBar() {

  const navigate = useNavigate();

  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
      logout(); // Llamada a la función de cierre de sesión del contexto de autenticación
      navigate("/");
  };

  return (
    <Navbar
      expand="lg"
      className="navbar-contenedor"
      fixed="top"
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
              className="navbar-logo"
              src={logoAdoptaTuCanino}
              alt="Logo Adopta tu canino"
              style={{
                  width: 120,
                  height: 60,
                  borderRadius: 10
              }}
          />
      </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="navbar-dropdown">
            <Nav.Link as={Link} to="/">
              Inicio
            </Nav.Link>

            <Nav.Link as={Link} to="/dogs">
              Perros en adopción
            </Nav.Link>

            <Nav.Link as={Link} to="/contacto">
              Contacto
            </Nav.Link>

           {isAuthenticated ? (
              <>
              <Nav.Link as={Link} to="/dog-panel">
                      Panel de solicitudes
              </Nav.Link>

                <Nav.Link 
                      as="button"
                      onClick={handleLogout}
                  >
                      Cerrar sesión
                </Nav.Link>                

                <div className="navbar-user">
                  <i className="bi bi-person-circle"> </i>
                  {user?.username.toUpperCase()}
                </div>
              </>
              ) : (
                <Nav.Link as={Link} to="/login">
                    Iniciar sesión
                </Nav.Link>
              )
            }

            {user?.is_staff && (
                <Nav.Link as={Link} to="/admin/dogs">
                    Gestionar perros
                </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;