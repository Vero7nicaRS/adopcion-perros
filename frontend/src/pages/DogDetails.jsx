import "../styles/DogDetails.css";

// Modulos
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";

// Context
import useAuth from "../context/authentication/useAuth";

// Components
import DogInfoDetail from "../components/DogInfoDetail"
import DogPhotographs from "../components/DogPhotographs";

import { API_BASE_URL } from '../api/url_api'

// Link, Navigate
import { Link , useNavigate } from "react-router-dom";

function formatBoolean(value) {
    return value ? (
        <>
            <i className="bi bi-check2 text-success"></i> Sí
        </>
    ) : (
        <>
            <i className="bi bi-x text-danger"></i> No
        </>
    );
}

function formatAge(age, unit) {
    if (age === null || age === undefined) {
        return "Desconocida";
    }

    if (unit === "MONTHS") {
        return `${age} ${age === 1 ? "mes" : "meses"}`;
    }

    return `${age} ${age === 1 ? "año" : "años"}`;
}

function formatDate(date) {

    if (!date) {
        return "Desconocido";
    }

    return new Date(date).toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
    });
}


function DogDetails() {

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

 
  // Id de la URL
  const { id } = useParams();

  // Estados de UseEffect
  const [dogDetail, setDogDetail] = useState(null); // Datos del listado de perros

  const [loading, setLoading] = useState(true); // Indica si los datos están cargados o no.
  const [error, setError] = useState(null); // Indica si hay un error o no.
 
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { isAuthenticated, logout } = useAuth();

  // handler
  const handleAdoptionClick = () => {
    if (isAuthenticated) {
        navigate(`/dogs/${dogDetail.id}/adoption`);
        return;
    }

    setShowLoginModal(true);
    };

  useEffect(() => {

    const controller = new AbortController()

    // Obtener los datos de la API: detalles del perro.
    const fetchDog = async () => {

        console.log( "Lanzando fetch a la API...");
        setLoading(true);
        setError(null);

        try {
            // 1) Se obtiene los datos del perro "id"
            const dogResponse = await fetch(`${API_BASE}/adopta_tu_canino/perros/${id}/`);
            if (!dogResponse.ok){
                throw new Error(`ERROR HTTP: No se pudo cargar los detalles del perro ${id} - ${dogResponse.status}`);
            }
            const dogDetailResult = await dogResponse.json();

            setDogDetail(dogDetailResult);
        } catch (err) {
            /* Ignorar si el error de abort (no es un error real, 
            sino que es una señal de que el componente se desmontó antes
            de recibir la respuesta ) */
            if(err.name === "AbortError") {
                console.log("Fetch abortado, el componente se desmontó antes de recibir la respuesta.");
                return;
            }

            console.error("Error al obtener los datos del listado de perros:", err.message);
            setError(err.message);

        } finally {
            console.log("Fetch finalizado.");
            setLoading(false); // Se pone a false "loading", ya que se han cargado los datos.
        }
        }
        fetchDog();

        // Limpiar la llamada fetch si el componente se desmonta antes de recibir la respuesta
        return () => {
        console.log("Limpiando fetch...");
        controller.abort();
        };
    }, [id]);
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
            <div className="dog-detail-container">

                <div className = "dog-detail-main">
        
                    <div className="card mb-3" >
                        <div className="row g-0">
                            <div className="col-md-4">
                                {dogDetail.main_photograph ? (
                                    <img
                                        src={`${API_BASE}${dogDetail.main_photograph}`}
                                        className="dog-detail-photo"
                                        alt={`Fotografía de ${dogDetail.name}`}
                                    />
                                ) : (
                                    <div className="dog-detail-without-photo">
                                        Sin fotografía
                                    </div>
                                )}
                            </div>
                            <div className="col-md-8">
                                <div className="card-body">
                                    <h1 className="card-title">{dogDetail.name}</h1>
                                    <div className= "dog-card-header-container"> 
                                        <div className={`dog-status ${
                                            dogDetail.adoption_status === "AVAILABLE"
                                                ? "dog-status-available"
                                                : dogDetail.adoption_status === "ADOPTED"
                                                ? "dog-status-adopted"
                                                : "dog-status-unavailable"
                                                }`}
                                        >
                                            <i className={
                                                    dogDetail.adoption_status === "AVAILABLE"
                                                        ? "bi bi-heart"
                                                        : dogDetail.adoption_status === "ADOPTED"
                                                        ? "bi bi-house-heart"
                                                        : "bi bi-pause-circle"
                                                }
                                            ></i>{" "}
                                            {dogDetail.adoption_status === "AVAILABLE"
                                                ? "Disponible"
                                                : dogDetail.adoption_status === "ADOPTED"
                                                ? "Adoptado"
                                                : "No disponible"}
                                        </div>
                                        <div >
                                            {dogDetail.adoption_status === "AVAILABLE" && (
                                                <button
                                                    type="button"
                                                    className="dog-adoption-button"
                                                    onClick={handleAdoptionClick}
                                                >
                                                    <i className="bi bi-heart"></i>
                                                    Solicitar adopción
                                                </button>
                                            )}

                                        </div>


                                    </div>
                                    
                                    <div className="dog-data">
                                        <div>
                                            <DogInfoDetail
                                                    title= "Sexo"
                                                    icon = { dogDetail.sex === "MALE" ? "bi-gender-male"
                                                                : dogDetail.sex === "FEMALE" ? "bi-gender-female" 
                                                                : " Desconocido"
                                                            }
                                                    value = { dogDetail.sex === "MALE" ? " Macho" 
                                                                : dogDetail.sex === "FEMALE" ? " Hembra" 
                                                                : " Desconocido"
                                                            }
                                            ></DogInfoDetail>

                                        </div>

                                        <div>
                                            <DogInfoDetail
                                                    title= "Raza"
                                                    icon = "bi bi-bookmark-heart"
                                                    value = {dogDetail.breed}
                                            ></DogInfoDetail>
                                        </div>

                                        <div>
                                            <DogInfoDetail
                                                    title= "Edad"
                                                    icon = "bi bi-cake"
                                                    value = {formatAge(
                                                        dogDetail.estimated_age,
                                                        dogDetail.estimated_age_unit
                                                    )}
                                            ></DogInfoDetail> 
                                        </div>

                                        <div>
                                            <DogInfoDetail
                                                    title= "Tamaño"
                                                    icon = "bi bi-rulers"
                                                    value =
                                                        {dogDetail.size === "SMALL" ? " Pequeño" 
                                                            : dogDetail.size === "MEDIUM" ? " Mediano" 
                                                            : dogDetail.size === "LARGE" ? " Grande" 
                                                            : " Desconocido"
                                                        }
                                            ></DogInfoDetail>
                                        </div>
                                        <div>
                                            <DogInfoDetail
                                                    title= "Compatibilidad con perros"
                                                    icon = ""
                                                    value = {formatBoolean(dogDetail.dog_compatibility)} 
                                            ></DogInfoDetail>
                                        </div>

                                        <div>
                                            <DogInfoDetail
                                                    title= "Compatibilidad con gatos"
                                                    icon = ""
                                                    value = {formatBoolean(dogDetail.cat_compatibility)} 
                                            ></DogInfoDetail>
                                        </div>

                                        <div>
                                            <DogInfoDetail
                                                    title= "Compatibilidad con niños"
                                                    icon = ""
                                                    value = {formatBoolean(dogDetail.children_compatibility)} 
                                            ></DogInfoDetail>
                                        </div>

                                        <div>
                                            <DogInfoDetail
                                                    title= "Busca hogar desde"
                                                    icon = "bi bi-calendar2-heart"
                                                    value = {formatDate(dogDetail.looking_for_home_since)}
                                            ></DogInfoDetail>
                                        </div>

                                        <div>
                                            <DogInfoDetail
                                                    title= "Esterelizado"
                                                    icon = ""
                                                    value={formatBoolean(dogDetail.is_sterilized)} 
                                            ></DogInfoDetail>
                                        </div>

                                        <div>
                                            <DogInfoDetail
                                                    title= "Vacunado"
                                                    icon = ""
                                                    value = {formatBoolean(dogDetail.is_vaccinated)}
                                            ></DogInfoDetail>
                                        </div>

                                        <div>
                                            <DogInfoDetail
                                                    title= "Ubicación"
                                                    icon = "bi bi-geo-alt"
                                                    value = {dogDetail.location?.name}
                                            ></DogInfoDetail>
                                        </div>
                                    </div>
                                    <hr></hr>
                                        <h2>
                                            <i className="bi bi-search-heart"> </i>   
                                             Sobre {dogDetail.name}
                                        </h2>

                                        <p className="card-text">
                                            {dogDetail.description}
                                        </p>
                                    <hr></hr>
                                        <h2>
                                            <i className={`bi bi-suit-heart`}></i>{" "}
                                            Temperamento
                                        </h2>                                    
                                        <div className="dog-temperaments">
                                            { dogDetail.temperament?.map((t) =>
                                                <span
                                                    className="dog-temperament"
                                                    key = {t.id}
                                                >
                                                    {t.name}
                                                </span>
                                            )}
                                        </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                                                  
                <div className="dog-videos-container">
                    <div className= "dog-video-title">
                        <h2>
                            <i className="bi bi-camera-reels"></i>{" "}
                            Vídeo
                        </h2> 
                    </div>
                    <div className="dog-videos"> 
                        {dogDetail.videos?.map((video)=>                           
                            <video 
                                key={video.id}
                                controls 
                                className="dog-video"
                                >
                                <source
                                    src={`${video.file}`}
                                    type="video/mp4"
                                />
                                    Tu navegador no puede reproducir este vídeo.
                                </video>
                        )}
                    </div>
                </div>
                
                <hr></hr>
                <div className="dog-photos-container">
                    <div className= "dog-video-title">
                        <h2>
                            <i className="bi bi-camera"></i>{" "}
                                Fotografías
                        </h2>
                    </div>
                    
                    <DogPhotographs photographs={dogDetail.photographs} />
                </div>
                <hr></hr>
                <div className= "dog-adoption-down-container">
                    <h2>¿Te gustaría darle un hogar a {dogDetail.name}?</h2>
                        <div className= "text-dog-adoption-down">
                            Completa el formulario de adopción y la asociación se pondrá en contacto contigo
                            en la mayor brevedad posible.
                        </div>

                    <div className= "dog-adoption-down-button">
                        {dogDetail.adoption_status === "AVAILABLE" && (
                            <button
                                type="button"
                                className="dog-adoption-button"
                                onClick={handleAdoptionClick}
                            >
                                <i className="bi bi-heart"></i>
                                Solicitar adopción
                            </button>
                        )}
                    </div>
                    
                </div>
                
            </div>

            <Modal
                show={showLoginModal}
                onHide={() => setShowLoginModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Inicio de sesión necesario</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    Para enviar una solicitud de adopción debes iniciar sesión
                    con tu cuenta.
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowLoginModal(false)}
                    >
                        Cancelar
                    </Button>

                    <Button
                        className="dog-modal-login-button"
                        onClick={() => {
                            setShowLoginModal(false);
                            navigate("/login");
                        }}
                    >
                        Iniciar sesión
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}export default DogDetails;