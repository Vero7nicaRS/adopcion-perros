// CSS
import "../styles/DogForm.css";

// Constants
import {
    SEX_OPTIONS,
    SIZE_OPTIONS,
    AGE_UNIT_OPTIONS,
    COMPATIBLE_OPTIONS,
    ADOPTION_STATUS_OPTIONS
} from "../constants/dogOptions";

// Modulos
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// Context
import useAuth from "../context/authentication/useAuth";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Link
import { Link , useNavigate } from "react-router-dom";

function DogForm() {

    // Id de la URL
    const { id } = useParams();
    const isEditing = Boolean(id); // Edit = true ; Add = false

    const navigate = useNavigate();

    const { accessToken, user  } = useAuth(); 

    // Estados de UseEffect
    const [dogForm, setDogForm] = useState(null); // Datos del listado de perros

    const [name, setName] = useState("");
    const [estimatedAge, setEstimatedAge] = useState("");
    const [estimatedAgeUnit, setEstimatedAgeUnit] = useState("");
    const [sex, setSex] = useState("");
    const [size, setSize] = useState("");
    const [breed, setBreed] = useState("");
    const [description,setDescription] = useState("");
    const [dogCompatibility, setDogCompatibility] = useState("");
    const [catCompatibility, setCatCompatibility] = useState("");
    const [childrenCompatibility, setChildrenCompatibility] = useState("");
    const [hasSpecialNeeds, setHasSpecialNeeds]  = useState(false);
    const [specialNeedsDescription, setSpecialNeedsDescription] = useState("");
    const [isSterilized, setIsSterialized] = useState(false);
    const [isVaccinated, setIsVaccinated] = useState(false);
    const [lookingForHomeSince, setLookingForHomeSince] = useState("");
    const [location, setLocation] = useState("");
    const [locations, setLocations] = useState([]);
    const [adoptionStatus, setAdoptionStatus] = useState("");
    const [mainPhotograph, setMainPhotograph] = useState("");

    const [temperaments, setTemperaments] = useState([]);
    const [selectedTemperaments, setSelectedTemperaments] = useState([]);

    const [loading, setLoading] = useState(true); // Indica si los datos están cargados o no.
    const [error, setError] = useState(null); // Indica si hay un error o no.
    
    // Error Messages 
    const [nameError, setNameError] = useState("");
    const [sexError, setSexError] = useState("");
    const [sizeError, setSizeError] = useState("");
    const [estimatedAgeUnitError, setEstimatedAgeUnitError] = useState("");
    const [adoptionStatusError, setAdoptionStatusError] = useState("");
    const [descriptionError, setDescriptionError] = useState("");
    const [temperamentError, setTemperamentError] = useState("");
    const [dogCompatibilityError, setDogCompatibilityError] = useState("");
    const [catCompatibilityError, setCatCompatibilityError] = useState("");
    const [childrenCompatibilityError, setChildrenCompatibilityError] = useState("");

    // Estado relacionados con el envío del formulario de Inicio de sesión.
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);    


    
    // Handlers de los campos del formulario
    const handleNameChange = (e) => {
        setName(e.target.value);

        if (nameError) {
            setNameError("");
        }
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);

        if (descriptionError) {
            setDescriptionError("");
        }
    };
    const handleBreedChange = (e) => {
        setBreed(e.target.value);
    };

    const handleEstimatedAgeChange = (e) => {
        setEstimatedAge(e.target.value);
    };

    const handleEstimatedAgeUnitChange = (e) => {
        setEstimatedAgeUnit(e.target.value);
        if (estimatedAgeUnitError) {
            setEstimatedAgeUnitError("");
        }
    };

    const handleTemperamentChange = (temperamentId) => {
        setSelectedTemperaments((currentTemperaments) =>
            currentTemperaments.includes(temperamentId)
                ? currentTemperaments.filter(
                    (id) => id !== temperamentId
                )
                : [...currentTemperaments, temperamentId]
            );
            console.log(selectedTemperaments);
            if (temperamentError) {
                setTemperamentError("");
            }
    };
    

    const handleDogCompatibility = (e) => {
        setDogCompatibility(e.target.value);

        if (dogCompatibilityError) {
            setDogCompatibilityError("");
        }
    };

    const handleCatCompatibility = (e) => {
        setCatCompatibility(e.target.value);

        if (catCompatibilityError) {
            setCatCompatibilityError("");
        }
    };

    const handleChildrenCompatibility = (e) => {
        setChildrenCompatibility(e.target.value);

        if (childrenCompatibilityError) {
            setChildrenCompatibilityError("");
        }
    };

    const handleHasSpecialNeedsChange = (e) => {
        const checked = e.target.checked;

        setHasSpecialNeeds(checked);

        if (!checked) {
            setSpecialNeedsDescription("");
        }
    };
    const handleSpecialNeedsDescriptionChange = (e) => {
        setSpecialNeedsDescription(e.target.value);
    };

    const handleIsSterilizedChange = (e) => {
        setIsSterialized(e.target.value);
    };

    const handleIsVaccinatedChange = (e) => {
        setIsVaccinated(e.target.value);
    };
    
    const handleLookingForHomeSinceChange = (e) => {
        setLookingForHomeSince(e.target.value);
    };

    const handleSexChange = (e) => {
        setSex(e.target.value);
        if(sexError){
            setSexError("");
        }
    }

    const handleAdoptionStatusChange = (e) => {
        setAdoptionStatus(e.target.value);

        if (adoptionStatusError) {
            setAdoptionStatusError("");
        }
    };

    const handleLocationChange = (e) => {
        setLocation(e.target.value);
    }

    const handleSizeChange = (e) => {
        setSize(e.target.value);
        if(sizeError){
            setSizeError("");
        }
    }

    //  Handler del submit
    const handleSubmit = async (e) => {
        e.preventDefault(); // ← IMPORTANTE: evitar recarga de página
        
        setSubmitError(null);

        setNameError("");
        let hasError = false;
        if (!name.trim()) {
            setNameError("Debes introducir el nombre del perro.");
            hasError = true;
        }
        if (!sex) {
            setSexError(
                "Debes seleccionar el sexo del perro."
            );
            hasError = true;
        }
        if (!dogCompatibility) {
            setDogCompatibilityError(
                "Debes seleccionar la compatibilidad del perro."
            );
            hasError = true;
        }

        if (!catCompatibility) {
            setCatCompatibilityError(
                "Debes seleccionar la compatibilidad del perro."
            );
            hasError = true;
        }

        if (!childrenCompatibility) {
            setChildrenCompatibilityError(
                "Debes seleccionar la compatibilidad del perro."
            );
            hasError = true;
        }
        if (!size) {
            setSizeError(
                "Debes seleccionar el tamaño del perro."
            );
            hasError = true;
        }
        if (!adoptionStatus) {
            setAdoptionStatusError(
                "Debes seleccionar el estado de adopción."
            );
            hasError = true;
        }
        if (selectedTemperaments.length === 0) {
            setTemperamentError(
                "Debes seleccionar al menos un temperamento."
            );
            hasError = true;
        }
        
        if (estimatedAge && !estimatedAgeUnit) {
            setEstimatedAgeUnitError(
                "Debes seleccionar la unidad de la edad."
            );
            hasError = true;
        }

        if (hasError) {
            return;
        }

        setSubmitting(true);
        try {
            const requestUrl = isEditing
                ? `${API_BASE}/adopta_tu_canino/perros/${id}/`
                : `${API_BASE}/adopta_tu_canino/perros/`;

            const requestMethod = isEditing ? "PATCH" : "POST";
            console.log("Metodo: ",requestMethod);

            const dogData = {
                    name: name.trim(),
                    estimated_age: estimatedAge 
                                        ? Number(estimatedAge)
                                        : null,
                    sex: sex,
                    size: size,
                    breed: breed.trim(),
                    description: description.trim(),
                    dog_compatibility: dogCompatibility,
                    cat_compatibility: catCompatibility,
                    children_compatibility: childrenCompatibility,
                    has_special_needs: hasSpecialNeeds,
                    special_needs_description:
                        specialNeedsDescription.trim(),
                    is_sterilized: isSterilized,
                    is_vaccinated: isVaccinated,
                    looking_for_home_since: lookingForHomeSince || null,
                    location_id: location ? Number(location) : null,
                    adoption_status: adoptionStatus,
                    temperament_ids: selectedTemperaments // Serializer
            }
            if (estimatedAge !== "") { // Si tiene edad, incluir la unidad.
                 dogData.estimated_age_unit = estimatedAgeUnit;
            }
            const response = await fetch(requestUrl, {
                method: requestMethod,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                // Aquí se envía el ID del perro y el comentario del usuario
                body: JSON.stringify (dogData)
            });

          const data = await response.json();
           if (!response.ok){
                throw new Error(
                data.detail || "No se pudieron guardar los cambios"
                
              );
            }

          console.log("Perro actualizado:", data);
          setName("");
          navigate("/admin/dogs");

        } catch (err) {
          if (isEditing) console.error("❌ Error al actualizar el perro:", err);
          else console.error("❌ Error al añadir el perro:", err);
          setSubmitError(err.message);

        } finally {
          setSubmitting(false);
        }
    };

    useEffect(() => {

        const controller = new AbortController()

        // Obtener los datos de la API: detalles del perro.
        const fetchDogForm = async () => {
            console.log( "Lanzando fetch a la API...");
            setLoading(true);
            setError(null);

            try {
                
                // Se obienen los temperamentos
                const temperamentResponse = await fetch(
                    `${API_BASE}/adopta_tu_canino/temperamentos`,
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

                // Se obtienen las localizaciones
                const locationResponse = await fetch(
                    `${API_BASE}/adopta_tu_canino/ubicaciones/`,
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
                console.log("Ubicaciones recibidas:", locationResult);



                let dogFormResult = null;
                if(isEditing){
                    // Se obtiene los datos del perro "id"
                    const dogResponse = await fetch(`${API_BASE}/adopta_tu_canino/perros/${id}/`,
                        {
                            signal: controller.signal
                        }
                    );
                    
                    if (!dogResponse.ok){
                        throw new Error(`ERROR HTTP: No se pudo cargar los detalles del perro ${id} - ${dogResponse.status}`);
                    }
                    dogFormResult = await dogResponse.json();
                    setDogForm(dogFormResult);
                }

                if(dogFormResult){
                    // Campos del formulario
                    setName(dogFormResult.name || "");
                    setEstimatedAge(
                        dogFormResult.estimated_age ?? ""
                    );
                    setEstimatedAgeUnit(
                        dogFormResult.estimated_age_unit || ""
                    );
                    setSex(dogFormResult.sex || "");
                    setSize(dogFormResult.size || "");
                    setBreed(dogFormResult.breed || "");
                    setDescription(dogFormResult.description || "");
                    
                    // Selecciona el caracter del perro
                    setSelectedTemperaments(
                        dogFormResult.temperament?.map(
                            (temperament) => temperament.id
                        )
                    );
                    setAdoptionStatus(dogFormResult.adoption_status || "");
                    setDogCompatibility(dogFormResult.dog_compatibility || "");
                    setCatCompatibility(dogFormResult.cat_compatibility || "");
                    setChildrenCompatibility(
                        dogFormResult.children_compatibility || ""
                    );
                    setHasSpecialNeeds(
                        dogFormResult.has_special_needs ?? false
                    );
                    setSpecialNeedsDescription(
                        dogFormResult.special_needs_description || ""
                    );
                    setIsSterialized(
                        dogFormResult.is_sterilized ?? false
                    );
                    setIsVaccinated(
                        dogFormResult.is_vaccinated ?? false
                    );
                    setLookingForHomeSince(
                        dogFormResult.looking_for_home_since || ""
                    );
                    setLocation(dogFormResult.location?.id || "");
                    console.log("Ubicación del perro:", dogFormResult.location);
                }
               
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
            fetchDogForm();

            // Limpiar la llamada fetch si el componente se desmonta antes de recibir la respuesta
            return () => {
                console.log("Limpiando fetch...");
                controller.abort();
            };
    }, [id, isEditing]);
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
            <div className="dog-form-container">
                <div className="dog-form-header">
                <h1>
                    {isEditing
                        ? `Modificar datos de ${dogForm?.name || ""}`
                        : "Añadir perro"}
                </h1>
              </div>
              

                <div className="dog-form">
                  <form onSubmit={handleSubmit}>
                    {/* Estado de adopción */}
                        <div>
                            <label
                                htmlFor="adoptionStatus"
                                className="dog-form-label"
                            >
                                Estado de adopción
                            </label>

                            <select
                                id="adoptionStatus"
                                value={adoptionStatus}
                                onChange={handleAdoptionStatusChange}
                                className="dog-form-name-text"
                            >
                                <option value="">Selecciona una opción</option>

                                {ADOPTION_STATUS_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            
                        </div>
                            {adoptionStatusError  && (
                                <p className="dog-form-field-error">
                                    {adoptionStatusError }
                                </p>
                            )}

                        <div>
                            <label
                                htmlFor="location"
                                className="dog-form-label"
                            >
                                Ubicación
                            </label>

                            <select
                                id="location"
                                value={location}
                                onChange={handleLocationChange}
                                className="dog-form-name-text"
                            >
                                <option 
                                    value= "">
                                        Selecciona una ubicación
                                </option>

                                {locations.map((locationItem) => (
                                    <option
                                        key={locationItem.id}
                                        value={locationItem.id}
                                    >
                                        {locationItem.name} - {locationItem.locality}, {locationItem.province}
                                    </option>
                                ))}
                            </select>
                            
                        </div>
                    { /* Nombre - Sexo - Tamaño - Raza */}
                    <div className="dog-form-grid">

                            <div>
                                <label 
                                    htmlFor="name"
                                    className="dog-form-label">
                                    Nombre
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={handleNameChange}
                                    placeholder="Escribe el nombre del perro..."
                                    className="dog-form-name-text"
                                />
                                {nameError && (
                                    <p className="dog-form-field-error">
                                        {nameError}
                                    </p>
                                )}
                            </div>
                            
                                
                            <div>
                                <label 
                                    htmlFor="sex"
                                    className="dog-form-label">
                                    Sexo
                                </label>
                                <select
                                    id="sex"
                                    value={sex}
                                    className = "dog-form-name-text"
                                    onChange={handleSexChange}
                                    >
                                        <option value="">Selecciona una opción</option>

                                        {SEX_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                </select>

                                {sexError && (
                                    <p className="dog-form-field-error">
                                        {sexError}
                                    </p>
                                )}
                            </div>
                                
                            <div>
                                <label 
                                    htmlFor="size"
                                    className="dog-form-label">
                                    Tamaño
                                </label>
                                <select
                                    id="size"
                                    value={size}
                                    className = "dog-form-name-text"
                                    onChange={handleSizeChange}
                                    >
                                        <option value="">Selecciona una opción</option>

                                        {SIZE_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                </select>

                                {sizeError && (
                                    <p className="dog-form-field-error">
                                        {sizeError}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label 
                                    htmlFor="breed"
                                    className="dog-form-label">
                                    Raza
                                </label>
                                <input
                                    id="breed"
                                    type="text"
                                    value={breed}
                                    onChange={handleBreedChange}
                                    placeholder="Escribe la raza del perro..."
                                    className="dog-form-name-text"
                                />
                            </div>
                    </div>
                    { /* Edad estimada - Unidad estimada*/}
                    <div className="dog-form-grid">
                        <div>
                            <label 
                                htmlFor="estimatedAge"
                                className="dog-form-label">
                                Edad estimada
                            </label>
                            <input
                                id="estimatedAge"
                                type="number"
                                value={estimatedAge}
                                onChange={handleEstimatedAgeChange}
                                placeholder="Indique si conoce la edad estimada del perro..."
                                min = {0}
                                max= {25}
                                className="dog-form-name-text"
                            />
                        </div>

                        <div>
                            <label 
                                htmlFor="estimatedAgeUnit"
                                className="dog-form-label">
                                Unidad estimada
                            </label>
                            <select
                                id="estimatedAgeUnit"
                                value={estimatedAgeUnit}
                                onChange={handleEstimatedAgeUnitChange}
                                className="dog-form-name-text"
                                disabled={estimatedAge === ""}
                            >
                                <option value="">Selecciona una opción</option>

                                {AGE_UNIT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {estimatedAgeUnitError  && (
                                <p className="dog-form-field-error">
                                    {estimatedAgeUnitError }
                                </p>
                            )}
                        </div>
                    </div>
                    <div>
                        <fieldset className="dog-form-fieldset">
                            <legend className="dog-form-legend">
                                Temperamentos
                            </legend>

                            <div className="dog-form-checkbox-group">
                                {temperaments.map((temperament) => (
                                    <label
                                        key={temperament.id}
                                        className="dog-form-checkbox"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedTemperaments.includes(temperament.id)}
                                            onChange={() =>
                                                handleTemperamentChange(temperament.id)
                                            }
                                        />
                                        {temperament.name}
                                    </label>
                                ))}

                                
                            </div>
                            {temperamentError  && (
                                <p className="dog-form-field-error">
                                    {temperamentError }
                                </p>
                            )}
                        </fieldset>
                    </div>


                    <div>
                      <label 
                        htmlFor="description"
                        className="dog-form-label">
                          Descripción
                      </label>
                      <textarea
                        id="description"
                        type="text"
                        value={description}
                        rows ={4}
                        onChange={handleDescriptionChange}
                        placeholder="Escribe acerca de la historia y descripción del perro..."
                        className="dog-form-name-text"
                      />
                    </div>
                    
                    { /* Compatibilidad con perros - gatos - niños - busca hogar desde */}
                    <div className="dog-form-grid">
                        <div>
                        <label 
                            htmlFor="dogCompatibility"
                            className="dog-form-label">
                            Compatibilidad con perros
                        </label>
                            <select
                                id="dogCompatibility"
                                value={dogCompatibility}
                                onChange={handleDogCompatibility}
                                className = "dog-form-name-text"
                                >
                                <option value="">Selecciona una opción</option>

                                {COMPATIBLE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {dogCompatibilityError && (
                                <p className="dog-form-field-error">
                                    {dogCompatibilityError}
                                </p>
                            )}
                        </div>

                        <div>
                        <label 
                            htmlFor="catCompatibility"
                            className="dog-form-label">
                            Compatibilidad con gatos
                        </label>
                            <select
                                id="catCompatibility"
                                value={catCompatibility}
                                onChange={handleCatCompatibility}
                                className = "dog-form-name-text"
                                >
                                <option value="">Selecciona una opción</option>

                                {COMPATIBLE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {catCompatibilityError && (
                                <p className="dog-form-field-error">
                                    {catCompatibilityError}
                                </p>
                            )}
                        </div>
                    
                        <div>
                        <label 
                            htmlFor="childrenCompatibility"
                            className="dog-form-label">
                            Compatibilidad con niños
                        </label>
                            <select
                                id="childrenCompatibility"
                                value={childrenCompatibility}
                                onChange={handleChildrenCompatibility}
                                className = "dog-form-name-text"
                                >
                                <option value="">Selecciona una opción</option>

                                {COMPATIBLE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {childrenCompatibilityError && (
                                <p className="dog-form-field-error">
                                    {childrenCompatibilityError}
                                </p>
                            )}
                        </div>
                        
                        <div>
                            <label 
                                htmlFor="lookingForHomeSince"
                                className="dog-form-label">
                                Busca hogar desde 
                            </label>
                            <input
                                id="lookingForHomeSince"
                                type="date"
                                value={lookingForHomeSince}
                                onChange={handleLookingForHomeSinceChange}
                                className="dog-form-name-text"
                            />
                        </div>

                    </div>


                    {/* NECESIDADES ESPECIALES */}
                    <fieldset className="dog-form-fieldset">
                        <legend className="dog-form-legend">
                            Necesidades especiales
                        </legend>

                        <label className="dog-form-boolean-option">
                            <input
                                id="hasSpecialNeeds"
                                type="checkbox"
                                checked={hasSpecialNeeds}
                                onChange={handleHasSpecialNeedsChange}
                            />
                            Tiene necesidades especiales
                        </label>

                        <textarea
                            id="specialNeedsDescription"
                            value={specialNeedsDescription}
                            onChange={handleSpecialNeedsDescriptionChange}
                            placeholder="Describe las necesidades especiales del perro..."
                            className="dog-form-name-text"
                            disabled={!hasSpecialNeeds}
                        />
                    </fieldset>

                    {/* INFORMACIÓN SANITARIA*/}
                    <fieldset className="dog-form-fieldset">
                        <legend className="dog-form-legend">
                            Información sanitaria
                        </legend>

                        <div className="dog-form-boolean-group">
                            <label className="dog-form-boolean-option">
                                <input
                                    type="checkbox"
                                    checked={isSterilized}
                                    onChange={(e) =>
                                        setIsSterialized(e.target.checked)
                                    }
                                />
                                Esterilizado
                            </label>

                            <label className="dog-form-boolean-option">
                                <input
                                    type="checkbox"
                                    checked={isVaccinated}
                                    onChange={(e) =>
                                        setIsVaccinated(e.target.checked)
                                    }
                                />
                                Vacunado
                            </label>
                        </div>
                    </fieldset>

            
                    <button
                      type="submit"
                      disabled={submitting}
                      className = "dog-form-save-button"   
                      >
                       {submitting ? (
                            <>
                                <i className="bi bi-hourglass-split"></i>
                                Guardando...
                            </>
                        ) : (
                            isEditing ? "Guardar cambios" : "Añadir perro"
                        )}
                    </button>

                   {submitError && (
                        <p className="dog-form-field-error">
                            {submitError}
                        </p>  
                        )
                    }     

                    
                  </form>
                
                </div>
            </div>
        </>
    )

} export default DogForm;