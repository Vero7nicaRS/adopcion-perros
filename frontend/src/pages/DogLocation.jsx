// CSS
import "../styles/DogLocation.css";

// Modulos
import { useEffect, useState } from "react";

import { API_BASE_URL } from '../api/url_api'

// Context
import useAuth from "../context/authentication/useAuth";

function DogLocation() {

    const { accessToken } = useAuth();

    // Campos del formulario.
    const [name, setName] = useState("");
    const [locality, setLocality] = useState("");
    const [province, setProvince] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

     // Estados de UseEffect
    const [locations, setLocations] = useState([]);

    // Estados relacionados con la carga de la página.
    const [loading, setLoading] = useState(true); // Indica si los datos están cargados o no.
    const [error, setError] = useState(null); // Indica si hay un error o no.
    
    // Error Messages 
    const [nameError, setNameError] = useState("");
    const [localityError, setLocalityError] = useState("");
    const [provinceError, setProvinceError] = useState("");
    const [latitudeError, setLatitudeError] = useState("");
    const [longitudeError, setLongitudeError] = useState("");

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

    const handleLocalityChange = (e) => {
        setLocality(e.target.value);

        if (localityError) {
            setLocalityError("");
        }
    };

    const handleProvinceChange = (e) => {
        setProvince(e.target.value);

        if (provinceError) {
            setProvinceError("");
        }
    };
    const handleLatitudeChange = (e) => {
        setLatitude(e.target.value);

        if (latitudeError) {
            setLatitudeError("");
        }
    };

    const handleLongitudeChange = (e) => {
        setLongitude(e.target.value);

        if (longitudeError) {
            setLongitudeError("");
        }
    };

        //  Handler del submit
    const handleSubmit = async (e) => {
        e.preventDefault(); // IMPORTANTE: evitar recarga de página
        setSubmitError(null);
        setNameError("");
        setLocalityError("");
        setProvinceError("");
        setLatitudeError("");
        setLongitudeError("");

        let hasError = false;
        if (!name.trim()) {
            setNameError("Debes introducir el nombre de la ubicación.");
            hasError = true;
        }

        if (!locality.trim()) {
            setLocalityError("Debes introducir la localidad.");
            hasError = true;
        }

        if (!province.trim()) {
            setProvinceError("Debes introducir la provincia.");
            hasError = true;
        } 
        
        if (!latitude.trim()) {
            setLatitudeError("Debes introducir la latitud.");
            hasError = true;
        } else if (Number(latitude) < -90 || Number(latitude) > 90) {
            setLatitudeError(
                "La latitud debe estar entre -90 y 90."
            );
            hasError = true;
        }

        if (!longitude.trim()) {
            setLongitudeError("Debes introducir la longitud.");
            hasError = true;
        } else if (Number(longitude) < -180 || Number(longitude) > 180) {
            setLongitudeError(
                "La longitud debe estar entre -180 y 180."
            );
            hasError = true;
        }

        if (hasError) {
            return;
        }

        setSubmitting(true);
        try {
            const requestUrl = `${API_BASE_URL}/adopta_tu_canino/ubicaciones/`; // Agregar
            const requestMethod =  "POST";

            const dogLocationData = {
                    name: name.trim(),
                    locality: locality.trim(),
                    province: province.trim(),
                    latitude: latitude 
                                ? Number(latitude)
                                : null,
                    longitude: longitude 
                        ? Number(longitude)
                        : null,
                }

            const response = await fetch(requestUrl, {
                method: requestMethod,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                // Aquí se envía toda la información de la ubicación.
                body: JSON.stringify (dogLocationData)
            });

            const data = await response.json();
            if (!response.ok){
                throw new Error(
                data.detail || "No se pudieron guardar los cambios"
              );
            }

            // Una vez agregada la ubicación, no se redirigué a ninguna página.
            // Se queda en la misma
            console.log("Ubicación agregada ", data);
            setLocations((currentLocation) => [
                ...currentLocation,
                data
            ]);

            // Limpiar los campos del formulario después de enviar la información.
            setName("");
            setLocality("");
            setProvince("");   
            setLatitude("");
            setLongitude("");
        } catch (err) {
          console.error("❌ Error al añadir la ubicación:", err);
          setSubmitError(err.message);

        } finally {
          setSubmitting(false);
        }
    };

    useEffect(() => {

        const controller = new AbortController()

        // Obtener los datos de la API: detalles del perro.
        const fetchDogLocationForm = async () => {
            console.log( "Lanzando fetch a la API...");
            setLoading(true);
            setError(null);

            try {
                
                // Se obtienen las ubicaciones
                const locationResponse = await fetch(
                    `${API_BASE_URL}/adopta_tu_canino/ubicaciones/`,
                    {
                        signal: controller.signal
                    }
                );
                
                if (!locationResponse.ok) {
                    throw new Error(
                        `No se pudieron cargar las ubicaciones (${locationResponse.status}).`
                    );
                }
                
                const locationResult = await locationResponse.json();
                setLocations(locationResult);
                console.log("Ubicationes recibidas:", locationResult);

            } catch (err) {
                /* Ignorar si el error de abort (no es un error real, 
                sino que es una señal de que el componente se desmontó antes
                de recibir la respuesta ) */
                if(err.name === "AbortError") {
                    console.log("Fetch abortado, el componente se desmontó antes de recibir la respuesta.");
                    return;
                }

                console.error("Error al obtener las ubicaciones:", err.message);
                setError(err.message);

            } finally {
                console.log("Fetch finalizado.");
                setLoading(false); // Se pone a false "loading", ya que se han cargado los datos.
            }
        }
            fetchDogLocationForm();

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

    return (
        <>
            <div className="doglocation-form-container">
                <div className="doglocation-form-header">
                <h1>
                    { "Añadir ubicación"}
                </h1>
              </div>
              
                <div className="doglocation-form">
                  <form onSubmit={handleSubmit}>
                    <div className="doglocation-form-field">
                        <label 
                            htmlFor="name"
                            className="doglocation-form-label">
                            Nombre
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            placeholder="Escribe el nombre..."
                            className="doglocation-form-name-text"
                        />
                        {nameError && (
                            <p className="doglocation-form-field-error">
                                {nameError}
                            </p>
                        )}
                    </div>
                    <div className="doglocation-form-field">
                        <label 
                            htmlFor="locality"
                            className="doglocation-form-label">
                            Localidad
                        </label>
                        <input
                            id="locality"
                            type="text"
                            value={locality}
                            onChange={handleLocalityChange}
                            placeholder="Escribe la localidad..."
                            className="doglocation-form-name-text"
                        />
                        {localityError && (
                            <p className="doglocation-form-field-error">
                                {localityError}
                            </p>
                        )}
                    </div>

                    <div className="doglocation-form-field">
                        <label 
                            htmlFor="province"
                            className="doglocation-form-label">
                            Provincia
                        </label>
                        <input
                            id="province"
                            type="text"
                            value={province}
                            onChange={handleProvinceChange}
                            placeholder="Escribe la provincia..."
                            className="doglocation-form-name-text"
                        />
                        {provinceError && (
                            <p className="doglocation-form-field-error">
                                {provinceError}
                            </p>
                        )}
                    </div>

                    <div className="doglocation-form-field">
                        <label 
                            htmlFor="latitude"
                            className="doglocation-form-label">
                            Latitud
                        </label>
                        <input
                            id="latitude"
                            type="number"
                            step ="any"
                            value={latitude}
                            onChange={handleLatitudeChange}
                            placeholder="Indique la latitud..."
                            className="dog-form-name-text"
                        />
                        {latitudeError && (
                            <p className="doglocation-form-field-error">
                                {latitudeError}
                            </p>
                        )}
                    </div>

                    <div className="doglocation-form-field">
                        <label 
                            htmlFor="longitude"
                            className="doglocation-form-label">
                            Longitud
                        </label>
                        <input
                            id="longitude"
                            type="number"
                            step ="any"
                            value={longitude}
                            onChange={handleLongitudeChange}
                            placeholder="Indique la longitud..."
                            className="dog-form-name-text"
                        />
                        {longitudeError && (
                            <p className="doglocation-form-field-error">
                                {longitudeError}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className = "doglocation-form-save-button"   
                        >
                        {submitting ? (
                                <>
                                    <i className="bi bi-hourglass-split"></i>
                                    Guardando...
                                </>
                            ) : (
                                "Añadir ubicación"
                            )}
                        </button>

                    {submitError && (
                        <p className="doglocation-form-field-error">
                            {submitError}
                        </p>  
                        )
                    }   
                  </form>
                </div>
                
                <div className="doglocation-existing">
                    <h2>
                        <i className={`bi bi-suit-heart`}></i>{" "}
                        Ubicaciones existentes
                    </h2>   
                <div className="doglocation-list">
                    {locations?.map((location) => (
                        <div
                            key={location.id}
                            className="doglocation-location"
                        >
                            <h3>{location.name}</h3>

                            <p>
                                {location.locality}, {location.province}
                            </p>

                            <p className="doglocation-coordinates">
                                Latitud: {location.latitude} - Longitud: {location.longitude}
                            </p>
                        </div>
                    ))}
                </div>
                    
                </div>
            </div>
        </>
    )

}export default DogLocation;