// CSS
import "../styles/AdoptionApplicationsPanel.css";

// Modulos
import { useEffect, useState } from "react";

// Context
import useAuth from "../context/authentication/useAuth";

// Components
import ApplicationCard from "../components/ApplicationCard"

// Constantes
import {APPLICATIONS_STATUS_OPTIONS} from "../constants/dogOptions"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function AdoptionApplicationsPanel() {

    // Estados de UseEffect
    const [applications, setApplications] = useState([]); // Datos del listado de perros
    const [loading, setLoading] = useState(true); // Indica si los datos están cargados o no.
    const [error, setError] = useState(null); // Indica si hay un error o no.
    const { accessToken, user  } = useAuth(); 

    // Filtros
    const [statusApplicationFilter, setStatusStatusApplicationFilter] = useState("");

    const handleStatusApplicationFilterChange = (e) => {
        setStatusStatusApplicationFilter(e.target.value);
    }

    const filteredApplications = applications ? applications.filter((application) => {
        const matchesApplication = !statusApplicationFilter || application.status === statusApplicationFilter;

        return (
            matchesApplication
        );

    }) : [] ;
    /* Al pulsar el botón de ACEPTAR se activa la función */
    const handleAccept = async (applicationId) => {
        try{
            const response = await fetch(
                `${API_BASE}/adopta_tu_canino/solicitud-adopcion/${applicationId}/accept_status/`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.status?.[0] ||
                    data.detail ||
                    "No se pudo aceptar la solicitud."
                );
            }

            /* Se vuelve a obtener el listado porque el backend:
                - Ha aceptado una solicitud.
                - Ha rechazado otras solicitudes del mismo perro. 
                - Ha marcado el perro como "ADOPTADO"
             */
            await fetchApplications();

        }catch(err){
            console.error("Error al aceptar la solicitud", err);
            setError(err.message);
        }
    };


    /* Al pulsar el botón de RECHAZAR se activa la función */
    const handleReject = async (applicationId) => {
        try{
            const response = await fetch(
                `${API_BASE}/adopta_tu_canino/solicitud-adopcion/${applicationId}/reject_status/`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            
            const data = await response.json();
            console.log("Respuesta: ", data);
            if (!response.ok) {
                throw new Error(
                    data.status?.[0] ||
                    data.detail ||
                    "No se pudo aceptar la solicitud."
                );
            }
            
            setApplications((previousApplications) =>
                previousApplications.map((application) =>
                    application.id === applicationId ? {
                        // Si son iguales, se copia la solicitud y se modifica su estado.
                        ...application,
                        status: data.status
                    } : application
                )
            );

        }catch(err){
            console.error("Error al aceptar la solicitud", err);
            setError(err.message);
        }
    };


    // Obtener los datos de la API: solicitudes de adopción
    const fetchApplications = async () => {
        console.log( "Lanzando fetch a la API...");
        setLoading(true);
        setError(null);

        try {
            // 1) Se obtiene el listado de perros  
            const panelUserResponse = await fetch(
                `${API_BASE}/adopta_tu_canino/solicitud-adopcion/`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            if (!panelUserResponse.ok){
                throw new Error(`ERROR HTTP: No se pudo cargar el listado de ${panelUserResponse.status}`);
            }
            const applicationResult = await panelUserResponse.json();

            setApplications(applicationResult);
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

    useEffect(() => {
        const controller = new AbortController()
        if (accessToken){
            fetchApplications();
        }
        
        // Limpiar la llamada fetch si el componente se desmonta antes de recibir la respuesta
        return () => {
            console.log("Limpiando fetch...");
            controller.abort();
        };
    }, [accessToken]);
    
  if (loading) return <p className="hd-info">🔄 Cargando...</p>;
  if (error) return <p className="hd-error">{error}</p>;


    return (
        <>
            <div className="adoption-application-panel">
                <h1>    {user?.is_staff
                            ? "Solicitudes de adopción "
                            : "Mis solicitudes "}
                </h1>

                {/* FILTROS */}
                <div className= "adoption-application-container">
                    <div className="dog-filter-flex">
                        <div className="adoption-application-item">
                            <label 
                                htmlFor="sizeFilter"
                                className="dog-form-label">
                                Estado de la solicitud
                            </label>
                            <select
                                id="sizeFilter"
                                value={statusApplicationFilter}
                                className = "adoption-application-text"
                                onChange={handleStatusApplicationFilterChange}
                                >
                                    <option value="">Todos </option>
            
                                    {APPLICATIONS_STATUS_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="adoption-application-list">
                    {filteredApplications && filteredApplications.length > 0 ? (               
                        filteredApplications.map((application) => (
                            <ApplicationCard
                                key={application.id}
                                application={application}
                                isAdmin={user?.is_staff}
                                onAccept={handleAccept}
                                onReject={handleReject}
                            />
                        ))
                    ) : (
                        <p className="applications-empty-message">
                            No hay solicitudes de adopción.
                        </p>
                    )}
                </div>
                
            </div>
        </>
    )
}export default AdoptionApplicationsPanel;