// CSS
import "../styles/Login.css";

// Modulos
import { useEffect, useState } from "react";
import { useParams  } from "react-router-dom";

// Link
import { Link , useNavigate } from "react-router-dom";

// Context
import useAuth from "../context/authentication/useAuth";

// Components
import DogSummary from "../components/DogSummary";
import DogInfoDetail from "../components/DogInfoDetail"

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

    
function Login() {
    
    const navigate = useNavigate();
    const { login } = useAuth(); // Hook personalizado para acceder al contexto de autenticación

    // 1. Un estado por cada campo del formulario
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Estado relacionados con el envío del formulario de Inicio de sesión.
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);     

    // Handlers de los campos del formulario
    const handleUsernameChange = (e) => {
        setUsername(e.target.value);

        if (usernameError) {
            setUsernameError(null);
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);

        if (passwordError) {
            setPasswordError(null);
        }
    };

        // 2. Handler del submit
    const handleSubmit = async (e) => {
        e.preventDefault(); // ← IMPORTANTE: evitar recarga de página
        
        setUsernameError("");
        setPasswordError("");
        setSubmitError(null);

        let hasError = false;
        // Validación básica
        if (!username.trim()) {
            setUsernameError("Debes introducir el nombre de usuario.");
            hasError = true;
        }

        if (!password) {
            setPasswordError("Debes introducir la contraseña.");
            hasError = true;
        }

        if (hasError) {
            return;
        }

        setSubmitting(true);
        try {
          const response = await fetch(`${API_BASE}/api/token/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },

              // Se envían las credenciales para obtener los tokens JWT
              body: JSON.stringify({
                  username: username.trim(),
                  password: password,
              })
          });
         
          const data = await response.json();
           if (!response.ok){
                throw new Error(
                data.detail || "El nombre de usuario y/o la contraseña no son correctos"
              );
            }
          // Guardar los tokens devueltos por Simple JWT
          login(data.access, data.refresh);

          console.log("✅ Inicio de sesión correcto:");
          setPassword("");
          setUsername("");
          navigate("/");

        } catch (err) {
          console.error("❌ Error al iniciar sesión:", err);
          setSubmitError(err.message);

        } finally {
          setSubmitting(false);
        }
    };

    return(
        <>
            <div className="login-container">
                <div className="login-header">
                <h1> <i className="bi bi-person-fill"></i> Iniciar sesión</h1>
              </div>
              

                <div className="login-form">
                  <form onSubmit={handleSubmit}>
                    <div>
                      <label 
                        htmlFor="username"
                        className="login-username-label">
                          Usuario
                      </label>
                      <input
                          id="username"
                          type="text"
                          autoComplete="username"
                          value={username}
                          onChange={handleUsernameChange}
                          placeholder="Escribe el nombre de usuario..."
                          className= "login-username-text"
                      />
                    </div>

                    {usernameError && (
                        <p className="login-field-error">
                            {usernameError}
                        </p>
                    )}

                    <div className="password-container">
                        <label
                            htmlFor="password"
                            className="login-password-label"
                        >
                            Contraseña
                        </label>

                        <div className="password-row">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                value={password}
                                onChange={handlePasswordChange}
                                placeholder="Escribe la contraseña..."
                                className="login-password-text"
                            />

                            <button
                                type="button"
                                className="login-show-button"
                                aria-label={
                                    showPassword
                                        ? "Ocultar contraseña"
                                        : "Mostrar contraseña"
                                }
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <i className="bi bi-eye-slash"></i>
                                ) : (
                                    <i className="bi bi-eye"></i>
                                )}
                            </button>
                        </div>
                    </div>

                    {submitError && (
                        <p className="login-field-error">
                            Usuario y/o contraseña no son válidos.
                        </p>  
                        )
                    }     

                    <button
                      type="submit"
                      disabled={submitting}
                      className = "login-enter-button"   
                      >
                      {submitting ? "⏳ Enviando..." : "Entrar"}
                    </button>
                  </form>
                </div>

                <div className="create-account">
                    ¿No tienes cuenta?
                    <Link to="/register" className="register-link">
                        Regístrate
                    </Link>
                </div>
            </div>
        </>
    )
}export default Login;