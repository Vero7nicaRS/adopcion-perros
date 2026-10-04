// CSS
import "../styles/DogTemperament.css";

// Modulos
import { useEffect, useState } from "react";
// Context
import useAuth from "../context/authentication/useAuth";

import { API_BASE_URL } from '../api/url_api'


function DogTemperament() {
    const { accessToken } = useAuth();

    // Campos del formulario.
    const [name, setName] = useState("");

     // Estados de UseEffect
    const [temperaments, setTemperaments] = useState([]);

    // Estados relacionados con la carga de la página.
    const [loading, setLoading] = useState(true); // Indica si los datos están cargados o no.
    const [error, setError] = useState(null); // Indica si hay un error o no.
    
    // Error Messages 
    const [nameError, setNameError] = useState("");

    // Estados relacionados con el envío del formulario de Inicio de sesión.
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);    

    // Handlers de los campos del formulario
    const handleNameChange = (e) => {
        setName(e.target.value);

        if (nameError) {
            setNameError("");
        }
    };


    //  Handler del submit
    const handleSubmit = async (e) => {
        e.preventDefault(); // IMPORTANTE: evitar recarga de página
        setSubmitError(null);
        setNameError("");

        let hasError = false;
        if (!name.trim()) {
            setNameError("Debes introducir el nombre del temperamento.");
            hasError = true;
        }
        if (hasError) {
            return;
        }

        setSubmitting(true);
        try {
            const requestUrl = `${API_BASE_URL}/adopta_tu_canino/temperamentos/`; // Agregar
            const requestMethod =  "POST";

            const dogTemperamentData = {
                    name: name.trim()
                }

            const response = await fetch(requestUrl, {
                method: requestMethod,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                // Aquí se envía el nombre del temperamento
                body: JSON.stringify (dogTemperamentData)
            });

            const data = await response.json();
            if (!response.ok){
                 if (data.name) {
                    setNameError(data.name[0]);
                    return;
                }
                throw new Error(
                data.detail || "No se pudieron guardar los cambios"
              );
            }

            // Una vez agregado el temperamento, no se redirigué a ninguna página.
            // Se queda en la misma
            console.log("Temperamento agregado ", data);
            setTemperaments((currentTemperaments) => [
                ...currentTemperaments,
                data
            ]);
            setName("");
        } catch (err) {
          console.error("❌ Error al añadir el temperamento:", err);
          setSubmitError(err.message);

        } finally {
          setSubmitting(false);
        }
    };

    useEffect(() => {

        const controller = new AbortController()

        // Obtener los datos de la API: detalles del perro.
        const fetchDogTemperamentForm = async () => {
            console.log( "Lanzando fetch a la API...");
            setLoading(true);
            setError(null);

            try {
                
                // Se obtienen los temperamentos
                const temperamentResponse = await fetch(
                    `${API_BASE_URL}/adopta_tu_canino/temperamentos/`,
                    {
                        signal: controller.signal
                    }
                );
                
                if (!temperamentResponse.ok) {
                    throw new Error(
                        `No se pudieron cargar los temperamentos (${temperamentResponse.status}).`
                    );
                }
                
                const temperamentResult = await temperamentResponse.json();
                setTemperaments(temperamentResult);
                console.log("Temperamentos recibidos:", temperamentResult);

            } catch (err) {
                /* Ignorar si el error de abort (no es un error real, 
                sino que es una señal de que el componente se desmontó antes
                de recibir la respuesta ) */
                if(err.name === "AbortError") {
                    console.log("Fetch abortado, el componente se desmontó antes de recibir la respuesta.");
                    return;
                }

                console.error("Error al obtener los temperamentos:", err.message);
                setError(err.message);

            } finally {
                console.log("Fetch finalizado.");
                setLoading(false); // Se pone a false "loading", ya que se han cargado los datos.
            }
        }
            fetchDogTemperamentForm();

            // Limpiar la llamada fetch si el componente se desmonta antes de recibir la respuesta
            return () => {
                console.log("Limpiando fetch...");
                controller.abort();
            };
    }, []);

    /* Renderizados condicionales:
        - Loading.
        - Error.
        Muestra un mensaje si está cargando la aplicación o si hay un error.
        En caso contrario, aparecerá el contenido de la aplicación 
    */
    if (loading) return <p className="hd-info">🔄 Cargando...</p>;
    if (error) return <p className="hd-error">{error}</p>;

    return(
        <>
            <div className="dogtemperament-form-container">
                <div className="dogtemperament-form-header">
                <h1>
                    { "Añadir temperamento"}
                </h1>
              </div>
              
                <div className="dogtemperament-form">
                  <form onSubmit={handleSubmit}>
                    <div className="dogtemperament-form-field">
                        <label 
                            htmlFor="name"
                            className="dogtemperament-form-label">
                            Nombre
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            placeholder="Escribe el nombre del temperamento..."
                            className="dogtemperament-form-name-text"
                        />
                        {nameError && (
                            <p className="dogtemperament-form-field-error">
                                {nameError}
                            </p>
                        )}


                        <button
                            type="submit"
                            disabled={submitting}
                            className = "dogtemperament-form-save-button"   
                            >
                            {submitting ? (
                                    <>
                                        <i className="bi bi-hourglass-split"></i>
                                        Guardando...
                                    </>
                                ) : (
                                    "Añadir temperamento"
                                )}
                            </button>

                        {submitError && (
                                <p className="dogtemperament-form-field-error">
                                    {submitError}
                                </p>  
                                )
                            }   
                    </div>

                  </form>
                </div>
                
                <div className="dogtemperament-existing">
                    <h2>
                        <i className={`bi bi-suit-heart`}></i>{" "}
                        Temperamentos existentes
                    </h2>   

                <div className="dogtemperament-list">
                    {temperaments?.map((temperament) => (
                        <p
                            key={temperament.id}
                            className="dogtemperament-temperament"
                        >
                            {temperament.name}
                        </p>
                    ))}
                </div>
                    
                </div>
            </div>
        </>       
    )
}export default DogTemperament;