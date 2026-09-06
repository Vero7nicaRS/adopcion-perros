// CSS
import "../styles/AdminDogList.css";

// Modulos
import { useEffect, useState } from "react";
// Componentss
import DogCardAdmin from "../components/DogCardAdmin"
// Constantes
import {AGE_OPTIONS, SEX_OPTIONS, SIZE_OPTIONS} from "../constants/dogOptions"

// Link
import { Link , useNavigate } from "react-router-dom";

function AdminDogList() {
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  // Estados de UseEffect
  const [dogList, setDogList] = useState(null); // Datos del listado de perros

  const [loading, setLoading] = useState(true); // Indica si los datos están cargados o no.
  const [error, setError] = useState(null); // Indica si hay un error o no.
   
  // Filtros
  const [sexFilter, setSexFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [breedFilter, setBreedFilter] = useState("");
  const [rangeAgeFilter, setRangeAgeFilter] = useState("");
  
  const handleSexFilterChange = (e) => {
    setSexFilter(e.target.value);
  }
  
  const handleSizeFilterChange = (e) => {
    setSizeFilter(e.target.value);
  }

  const handleBreedFilterChange = (e) => {
    setBreedFilter(e.target.value);
  }

  const handleRangeAgeFilterChange = (e) => {
    setRangeAgeFilter(e.target.value);
  }
  
  // Convierte la edad del animal en meses
  const getAgeInMonths = (dog) => {
    if (dog.estimated_age === null ||
        dog.estimated_age === undefined) {
        return null;
    }

    if (dog.estimated_age_unit === "MONTHS") {
        return dog.estimated_age;
    }

    if (dog.estimated_age_unit === "YEARS") {
        return dog.estimated_age * 12;
    }

    return null;
  };
  

  const filteredDogs = dogList ? dogList.filter((dog) => {
    const matchesSex = !sexFilter || dog.sex === sexFilter;
    const matchesSize = !sizeFilter || dog.size === sizeFilter;
    const matchesBreed = !breedFilter || 
                          dog.breed?.toUpperCase().includes(breedFilter.toUpperCase())

    // Edad del perro convertida a meses
    const ageInMonths = getAgeInMonths(dog);
    let matchesAge = true;

    if (rangeAgeFilter === "UNDER_1") {
      matchesAge =
          ageInMonths !== null &&
          ageInMonths < 12;
    }

    if (rangeAgeFilter === "1_3") {
      matchesAge =
          ageInMonths !== null &&
          ageInMonths >= 12 &&
          ageInMonths < 48;
    }

    if (rangeAgeFilter === "4_7") {
      matchesAge =
          ageInMonths !== null &&
          ageInMonths >= 48 &&
          ageInMonths < 96;
    }

    if (rangeAgeFilter === "8_PLUS") {
      matchesAge =
          ageInMonths !== null &&
          ageInMonths >= 96;
    }
    return (
      matchesSex && 
      matchesSize &&
      matchesBreed  &&
      matchesAge
    );

  }) : [] ;

  // Obtener todas las razas disponibles
  const breeds = [
    ...new Set(
      dogList
          ?.map((dog) => dog.breed)
          .filter((breed) => breed?.trim() !== "")
    )
  ];

  
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

      {/* FILTROS */}
      <div className= "admin-dog-filter-container">
        {/*
          <p className="dog-filter-title">
            <i className="bi bi-funnel"></i>{" "} 
            Filtrar por 
          </p>
        */}
        <div className="admin-dog-filter-flex">
          
          <div className="admin-dog-filter-item">
              <label 
                  htmlFor="sexFilter"
                  className="dog-form-label">
                  Sexo
              </label>
              <select
                  id="sexFilter"
                  value={sexFilter}
                  className = "dog-filter-text"
                  onChange={handleSexFilterChange}
                  >
                      <option value="">Todos</option>

                      {SEX_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                              {option.label}
                          </option>
                      ))}
            </select>
          </div>
            
          <div className="admin-dog-filter-item">
              <label 
                  htmlFor="sizeFilter"
                  className="dog-form-label">
                  Tamaño
              </label>
              <select
                  id="sizeFilter"
                  value={sizeFilter}
                  className = "dog-filter-text"
                  onChange={handleSizeFilterChange}
                  >
                      <option value="">Todos </option>

                      {SIZE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                              {option.label}
                          </option>
                      ))}
              </select>
          </div>

          <div className="admin-dog-filter-breed">
              <label 
                  htmlFor="breedFilter"
                  className="dog-form-label">
                  Raza
              </label>
              <select
                  id="breedFilter"
                  value={breedFilter}
                  className = "dog-filter-text"
                  onChange={handleBreedFilterChange}
                  >
                      <option value="">Todos </option>

                      {breeds.map((breed) => (
                          <option key={breed} value={breed}>
                              {breed}
                          </option>
                      ))}
              </select>
          </div>

          <div className="admin-dog-filter-item">
              <label 
                  htmlFor="rangeAgeFilter"
                  className="dog-form-label">
                  Edad
              </label>
              <select
                  id="rangeAgeFilter"
                  value={rangeAgeFilter}
                  className = "dog-filter-text"
                  onChange={handleRangeAgeFilterChange}
                  >
                      <option value="">Todas </option>

                      {AGE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                              {option.label}
                          </option>
                      ))}
              </select>
          </div>
        </div>
      </div>

      <div className="admin-dog-list">
        {filteredDogs && filteredDogs.length > 0 &&  filteredDogs.map((dog) => (
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