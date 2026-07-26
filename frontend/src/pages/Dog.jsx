// CSS
import "../styles/Dog.css";

// Modulos
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { API_BASE_URL } from '../api/url_api'

// Components
import DogCard from "../components/DogCard"

function Dog() {
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  // Estados de UseFEtch
  const [dogList, setDogList] = useState(null); // Datos del listado de perros

  const [loading, setLoading] = useState(true); // Indica si los datos están cargados o no.
  const [error, setError] = useState(null); // Indica si hay un error o no.
 

  useEffect(() => {
    console.log( "Lanzando fetch a la API...");
    setLoading(true);
    setError(null);

    // Obtener los datos de la API: listado de perros
    const fetchDog = async () => {
      try {
        // 1) Se obtiene el listado de perros
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
    <div className="dog-container">
      <h1>Listado de perritos en adopción 🐶</h1>
      <div className="dog-list">
        {dogList && dogList.length > 0 &&  dogList.map((dog) => (
            <DogCard
              key = {dog.id} 
              dog = {dog}
            ></DogCard>
        ))}
      </div>
    </div>
  );
}

export default Dog;