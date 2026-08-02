// CSS
import "../styles/Register.css";

// Modulos
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Link
import { Link , useNavigate } from "react-router-dom";

// Components
import DogSummary from "../components/DogSummary";
import DogInfoDetail from "../components/DogInfoDetail"

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function Register() {


    // 1. Un estado por cada campo del formulario
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [birthday, setBirthday] = useState("");

    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [birthdayError, setBirthdayError] = useState("");

    // Estado relacionados con el envío del formulario de Inicio de sesión.
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);  
    
    const navigate = useNavigate();

    // Handler de cada campo
    
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

    const handleBirthdayChange = (e) => {
        setBirthday(e.target.value);

        if (birthdayError) {
            setBirthdayError(null);
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);

        if (emailError) {
            setEmailError(null);
        }
    };

    // 2. Handler del submit
    const handleSubmit = async (e) => {
        e.preventDefault(); // ← IMPORTANTE: evitar recarga de página
        
        setUsernameError("");
        setPasswordError("");
        setEmailError("");
        setBirthdayError("");
        setSubmitError(null);

        // Validación básica
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

        if (!email.trim()) {
            setEmailError("Debes introducir el email.");
            hasError = true;
        }

        if (!birthday) {
            setBirthdayError("Debes introducir la fecha de nacimiento.");
            hasError = true;
        }

        if (hasError) {
            return;
        }

        setSubmitting(true);
        try {
          const response = await fetch(`${API_BASE}/adopta_tu_canino/usuarios/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },

              // Se envían las credenciales para obtener los tokens JWT
              body: JSON.stringify({
                  username: username.trim(),
                  password: password,
                  email: email.trim(),
                  birth_date: birthday
              })
          });
         
          const data = await response.json();
           if (!response.ok){
                throw new Error(
                    data.username?.[0] ||
                    data.password?.[0] ||
                    data.email?.[0] ||
                    data.birth_date?.[0] ||
                    data.detail ||
                    "No se ha podido crear la cuenta."
                );
            }

          console.log("✅ Se ha registrado correctamente:", data.username);
          setPassword("");
          setUsername("");
          setEmail("");
          setBirthday("");

          // Redirige a la página de login para que inicie sesión.
          navigate("/login");

        } catch (err) {
          console.error("❌ Error en el registro:", err);
          setSubmitError(err.message);

        } finally {
          setSubmitting(false);
        }
    };

    return(
        <>
            <div className="register-container">
                <div className="register-header">
                <h1> <i className="bi bi-person-circle"></i> Registrarse</h1>
                
              </div>
              

                <div className="register-form">
                  <form onSubmit={handleSubmit}>
                    <div>
                      <label 
                        htmlFor="username"
                        className="register-username-label">
                          Usuario
                      </label>
                      <input
                          id="username"
                          type="text"
                          autoComplete="username"
                          value={username}
                          onChange={handleUsernameChange}
                          placeholder="Escribe el nombre de usuario..."
                          className= "register-username-text"
                      />
                    </div>

                    {usernameError && (
                        <p className="register-field-error">
                            {usernameError}
                        </p>
                    )} 

                    <div className="password-container">
                        <label
                            htmlFor="password"
                            className="register-password-label"
                        >
                            Contraseña
                        </label>

                        <div className="password-row">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                value={password}
                                onChange={handlePasswordChange}
                                placeholder="Escribe la contraseña..."
                                className="register-password-text"
                            />

                            <button
                                type="button"
                                className="register-show-button"
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
                
                    {passwordError && (
                        <p className="register-field-error">
                            {passwordError}
                        </p>
                    )}    

                    <div>
                        <label 
                            htmlFor="email"
                            className="register-email-label"
                        >
                          Email 
                      </label>
                      <input
                          id="email"
                          type= "email"
                          autoComplete="email"
                          value={email}
                          onChange={handleEmailChange}
                          placeholder="Escribe el email..."
                          className= "register-password-text"
                      />
                    </div>

                    {emailError && (
                        <p className="register-field-error">
                            {emailError}
                        </p>
                    )}     

                    <div>
                      <label 
                        htmlFor="birthday"
                        className="register-birthday-label">
                          Fecha de nacimiento 
                      </label>
                      <input
                          id ="birthday"
                          type= "date"
                          autoComplete="birthday"
                          value={birthday}
                          onChange={handleBirthdayChange}
                          className= "register-password-text"
                      />
                    </div>

                    {birthdayError && (
                        <p className="register-field-error">
                            {birthdayError}
                        </p>
                    )}     
              
                    <button
                      type="submit"
                      disabled={submitting}
                      className = "register-enter-button"   
                      >
                      {submitting ? "⏳ Creando cuenta..." : "Registrarse"}
                    </button>

                    {submitError && (
                        <div className="register-error">
                            {submitError}
                        </div>
                    )}
                  </form>
                </div>
            </div>
        </>
    )
}export default Register;