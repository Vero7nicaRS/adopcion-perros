// CSS
import "../styles/AdminDogList.css";

// Modulos
import { useEffect, useState } from "react";
// Componentss
import DogCardAdmin from "../components/DogCardAdmin"

// Link
import { Link , useNavigate } from "react-router-dom";
function AdminDogList() {
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  // Estados de UseEffect
  const [dogList, setDogList] = useState(null); // Datos del listado de perros

  const [loading, setLoading] = useState(true); // Indica si los datos están cargados o no.
  const [error, setError] = useState(null); // Indica si hay un error o no.
 
  
  useEffect(() => {
    const controller = new AbortController()
    console.log( "Lanzando fetch a la API...");
    setLoading(true);
    setError(null);

    // Obtener los datos de la API: listado de perros
    const fetchDog = async () => {
      try {
        // Se obtiene el listado de perros
        const dogResponse = await fetch(`${API_BASE}/adopta_tu_canino/perros/`);
        if (!dogResponse.ok){
          throw new Error(`ERROR HTTP: No se pudo cargar el listado de perros ${dogResponse.status}`);
        }
        const dogListResult = await dogResponse.json();

        setDogList(dogListResult);
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
    <div className="admin-dog-list-container">
      <div className = "dog-admin-header">
        <div>
          <h1>Listado de perros </h1>
        </div>
        <div>
          <Link
              to="/admin/dogs/add"
              className="dog-admin-add-button"
          >
            <i className="bi bi-plus-circle"></i>
              Añadir perro
          </Link>
        </div>
      </div>
      <div className="admin-dog-list">
        {dogList && dogList.length > 0 &&  dogList.map((dog) => (
            <DogCardAdmin
              key = {dog.id} 
              dog = {dog}
            ></DogCardAdmin>
        ))}
      </div>
    </div>
  );
}

export default AdminDogList;