// Modulos
import { useEffect, useState } from "react";

// Context
import useAuth from "../context/authentication/useAuth";

// Components
import ApplicationCard from "../components/ApplicationCard"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function UserPanel() {

    // Estados de UseEffect
    const [applications, setApplications] = useState(null); // Datos del listado de perros
    const [loading, setLoading] = useState(true); // Indica si los datos están cargados o no.
    const [error, setError] = useState(null); // Indica si hay un error o no.


    const { accessToken } = useAuth(); 
    const controller = new AbortController()

    useEffect(() => {
        console.log( "Lanzando fetch a la API...");
        setLoading(true);
        setError(null);

        // Obtener los datos de la API: listado de perros
        const fetchUserPanel = async () => {
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
        fetchUserPanel();
        
        // Limpiar la llamada fetch si el componente se desmonta antes de recibir la respuesta
        return () => {
            console.log("Limpiando fetch...");
            controller.abort();
        };
    }, []);
    

    return (
        <>
            <div className="dog-container">
                <h1>Mis solicitudes 📋</h1>
                <div className="dog-list">
                    {applications && applications.length > 0 &&  applications.map((application) => (
                        <ApplicationCard
                        key = {application.id} 
                        application = {application}
                        ></ApplicationCard>
                    ))}
                </div>
            </div>
        </>
    )
}export default UserPanel;