import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import "../styles/NavBar.css";

function NavBar() {
  return (
    <Navbar
      expand="lg"
      className="navbar-contenedor"
      fixed="top"
    >
      <Container>
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

            <Nav.Link as={Link} to="/admin">
              Iniciar Sesión
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;