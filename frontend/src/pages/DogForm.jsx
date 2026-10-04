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

import { API_BASE_URL } from '../api/url_api'

// Context
import useAuth from "../context/authentication/useAuth";

// Link
import {useNavigate } from "react-router-dom";

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

    // Photographs
    const [mainPhotographFile, setMainPhotographFile] = useState(""); // Fotografía principal nueva
    //const [photographFiles, setPhotographFiles] = useState(""); // Fotografías secundarias nuevas
    const [photographs, setPhotographs] = useState([]);  // Todas las fotografías existentes

    // Preview de la fotografía principal mostrada
    const [mainPhotographPreview, setMainPhotographPreview] = useState(null);
    // Preview de las fotografías secundarias mostradas
    const [secondaryPhotographPreviews, setSecundaryPhotographPreviews] = useState([]);

    // Fotografías nuevas todavía no guardadas
    const [newSecondaryPhotographs, setNewSecondaryPhotographs] = useState([]); 

    // IDs de fotografías existentes que queremos borrar
    const [photographsToDelete, setPhotographsToDelete] = useState([]);

    // Obtiene la fotografía principal
    const currentMainPhotograph = photographs.find(
        (photo) => photo.is_main // Se obtiene 1 foto (find).
    );
    
    const currentSecondaryPhotographs = photographs.filter(
        (photo) => !photo.is_main // Se obtienen varias fotos (filter).
    );

    // Indica si hay una fotografía principal, ya sea que existiera anteriormente 
    // o que el usuario ha seleccionado una nueva para añadir.
    const hasMainPhotograph =
        Boolean(currentMainPhotograph) ||
        Boolean(mainPhotographFile);

    // Indica de las fotografías secundarias que existían cuantas se han borrado.
    const remainingSecondaryPhotographs =
        currentSecondaryPhotographs.length
        - photographsToDelete.length;    

    // Total de fotografías secundarias que hay.
    const totalPhotographs =
        (hasMainPhotograph ? 1 : 0)
        + remainingSecondaryPhotographs
        + newSecondaryPhotographs.length;

    // Huecos disponibles para añadir fotografías secundarias.
    const availablePhotographSlots = 5 - totalPhotographs;
    
    // Eliminar vídeo principal.
    const [deleteMainPhotograph, setDeleteMainPhotograph] = useState(false);
    // Videos
    const [videos, setVideos] = useState([]); // Vídeos existentes (debe haber 1 o 0).
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null); // Preview del vídeo mostrado.
    const currentVideo = videos[0]; // Vídeo actual.
    const [deleteVideo, setDeleteVideo] = useState(false); // Eliminar vídeo.


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
    const [photographError, setPhotographError] = useState("");

    // Estados relacionados con el envío del formulario de Inicio de sesión.
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);    

    const handleDeleteMainPhotograph  = () => {
        setDeleteMainPhotograph(true);
    }

    const handleCancelNewMainPhotograph = () => {
        if (mainPhotographPreview) {
            URL.revokeObjectURL(mainPhotographPreview);
        }

        setMainPhotographFile(null);
        setMainPhotographPreview(null);
    };


    const handleDeleteVideo = () => {
        setDeleteVideo(true);
    };

    const handleCancelNewVideo = () => {
        if (videoPreview) {
            URL.revokeObjectURL(videoPreview);
        }
        setVideoFile(null);
        setVideoPreview(null);
    };

    const handleDeleteNewPhotograph = (photoId) => {
        setPhotographError("");
        setNewSecondaryPhotographs((current) =>
            current.filter((photo) => photo.id !== photoId)
        );
        
    };

    const handleDeleteExistingPhotograph = (photoId) => {
        setPhotographsToDelete((current) => [
            ...current,
            photoId
        ]);
    };

    const handleSecondaryPhotographsChange = (e) => {
        setPhotographError("");
        const files = Array.from(e.target.files);
        const filesToAdd = files.slice(0, availablePhotographSlots);
        if (files.length > availablePhotographSlots) {
            setPhotographError(
                `Solo se han añadido ${availablePhotographSlots} fotografía(s), ya que el máximo total es 5.`
            );
        }
        const newFiles = filesToAdd.map((file) => ({
            id: crypto.randomUUID(),
            file: file,
            preview: URL.createObjectURL(file)
        }));

        setNewSecondaryPhotographs((current) => [
            ...current,
            ...newFiles
        ]);
        e.target.value = "";
    };


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
        e.preventDefault(); // IMPORTANTE: evitar recarga de página
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
            setSubmitError(
                "No se ha podido guardar el perro. Revisa los campos indicados."
            );
            return;
        }

        setSubmitting(true);
        try {
            const requestUrl = isEditing
                ? `${API_BASE_URL}/adopta_tu_canino/perros/${id}/` // Editar (visualizar datos del perro)
                : `${API_BASE_URL}/adopta_tu_canino/perros/`;      // Agregar

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
        
            let dogId;
        // Si es un perro nuevo, se obtiene el identificador que se acaba de crear.
        // Si es un perro editado, se obtiene el id pasado por parámetro.
            if(!isEditing){
                dogId = data.id;
            }else{
                dogId = id;
            }

            // FOTOGRAFÍA PRINCIPAL
            if (mainPhotographFile) {
                console.log("MAIN P:" , currentMainPhotograph);
                const requestPhotosUrl  = currentMainPhotograph
                    ? `${API_BASE_URL}/adopta_tu_canino/fotografias/${currentMainPhotograph.id}/` // Editar (visualizar datos del perro)
                    : `${API_BASE_URL}/adopta_tu_canino/fotografias/`;      // Agregar

                const photoRequestMethod  = currentMainPhotograph ? "PATCH" : "POST";
                console.log("Metodo: ",photoRequestMethod );
                const formData = new FormData();

                formData.append("dog", dogId);
                formData.append("imagen", mainPhotographFile);
                formData.append("is_main", true);
                formData.append("title", "probando");
                formData.append("description", "");

                const photoResponse = await fetch(
                    requestPhotosUrl,
                    {
                        method: photoRequestMethod ,
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: formData
                    }
                );

                const photoData = await photoResponse.json();
                console.log("Respuesta fotografía:", photoData);
                if (!photoResponse.ok) {
                    throw new Error(
                        photoData.detail ||
                        "No se pudo guardar la fotografía principal"
                    );
                }
            }else if (deleteMainPhotograph && currentMainPhotograph) {
                const response = await fetch(
                    `${API_BASE_URL}/adopta_tu_canino/fotografias/${currentMainPhotograph.id}/`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "No se pudo eliminar la fotografía principal"
                    );
                }
            }

            // Eliminar fotografías antiguas
            for (const photographId of photographsToDelete) {
                const response = await fetch(
                    `${API_BASE_URL}/adopta_tu_canino/fotografias/${photographId}/`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
            );

            if (!response.ok) {
                throw new Error(
                    "No se pudieron eliminar todas las fotografías"
                );
                }
            }

            // Guardar fotografías secundarias nuevas
            for (const photograph of newSecondaryPhotographs) {
                const formData = new FormData();

                formData.append("dog", dogId);
                formData.append("imagen", photograph.file);
                formData.append("is_main", false);
                formData.append("title", "Fotografía adicional");
                formData.append("description", "");

                const response = await fetch(
                    `${API_BASE_URL}/adopta_tu_canino/fotografias/`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: formData
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "No se pudieron guardar todas las fotografías"
                    );
                }
            }

            // VIDEO
            if (videoFile) {
                const formVideoData = new FormData();

                formVideoData.append("dog", dogId);
                formVideoData.append("file", videoFile);
                formVideoData.append("title", "Vídeo");
                formVideoData.append("description", "");

                const requestVideoUrl = currentVideo
                    ? `${API_BASE_URL}/adopta_tu_canino/videos/${currentVideo.id}/`
                    : `${API_BASE_URL}/adopta_tu_canino/videos/`;

                const videoRequestMethod = currentVideo
                    ? "PATCH"
                    : "POST";

                const videoResponse = await fetch(
                    requestVideoUrl,
                    {
                        method: videoRequestMethod,
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: formVideoData
                    }
                );
                const videoData = await videoResponse.json();

                if (!videoResponse.ok) {
                    throw new Error(
                        videoData.detail ||
                        "No se pudo guardar el vídeo"
                    );
                }
            } else if (deleteVideo && currentVideo) {
                const response = await fetch(
                    `${API_BASE_URL}/adopta_tu_canino/videos/${currentVideo.id}/`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "No se pudo eliminar el vídeo"
                    );
                }
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
                    `${API_BASE_URL}/adopta_tu_canino/temperamentos`,
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
                console.log("Ubicaciones recibidas:", locationResult);

                let dogFormResult = null;
                if(isEditing){
                    // Se obtiene los datos del perro "id"
                    const dogResponse = await fetch(`${API_BASE_URL}/adopta_tu_canino/perros/${id}/`,
                        {
                            signal: controller.signal
                        }
                    );
                    
                    if (!dogResponse.ok){
                        throw new Error(`ERROR HTTP: No se pudo cargar los detalles del perro ${id} - ${dogResponse.status}`);
                    }
                    dogFormResult = await dogResponse.json();
                    setDogForm(dogFormResult);

                    // Se obtienen la fotografía principal y las secundarias asociadas al perro.
                    const photoResponse = await fetch(
                        `${API_BASE_URL}/adopta_tu_canino/fotografias/?dog=${id}`
                    );

                    if (!photoResponse.ok) {
                        throw new Error(
                            "No se pudieron obtener las fotografías"
                        );
                    }

                    const photoResult = await photoResponse.json();

                    console.log("Respuesta fotografía:", photoResult);
                    setPhotographs(photoResult);


                    // Se obtiene vídeo asociado al perro.
                        const videoResponse = await fetch(
                        `${API_BASE_URL}/adopta_tu_canino/videos/?dog=${id}`
                    );

                    if (!videoResponse.ok) {
                        throw new Error(
                            "No se pudo obtener el vídeo"
                        );
                    }

                    const videoResult = await videoResponse.json();

                    console.log("Respuesta vídeo:", videoResult);
                    setVideos(videoResult);          
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

    /* Limpiar URLs de fotografías */
    useEffect(() => {
        return () => {
            if (mainPhotographPreview) {
                URL.revokeObjectURL(mainPhotographPreview);
            }
        };
    }, [mainPhotographPreview]);

    /* Limpiar URLs de vídeos */
    useEffect(() => {
        return () => {
            if (videoPreview) {
                URL.revokeObjectURL(videoPreview);
            }
        };
    }, [videoPreview]);

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
                        <div className="dog-form-field">
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
                            {adoptionStatusError  && (
                                <p className="dog-form-field-error">
                                    {adoptionStatusError }
                                </p>
                            )}
                        </div>            

                        <div className="dog-form-field">
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

                    {/* FOTOGRAFÍA PRINCIPAL */}
                    <div className="dog-form-photo-container">
                        <label
                            htmlFor="main-photograph"
                            className="dog-form-label"
                        >
                           {currentMainPhotograph
                                ? "Cambiar fotografía principal"
                                : "Añadir fotografía principal"
                            }
                        </label>

                        
                            {/* Muestra la previsualización de la foto principal */}
                            {(mainPhotographPreview ||
                                (!deleteMainPhotograph && currentMainPhotograph)) && (
                                <img
                                    src={
                                        mainPhotographPreview ||
                                        currentMainPhotograph.imagen
                                    }
                                    alt="Fotografía principal"
                                    className="dog-form-photograph"
                                />
                            )}

                            <input
                                id="main-photograph"
                                type="file"
                                className="dog-form-file-input"
                                accept="image/*"
                                onChange={(e) => {
                                    /* Al seleccionar una nueva foto no se dispone de una URL
                                    todavía ya que no se ha añadido la foto en el sistema.
                                    Por tanto, se crea una URL temporal para poder visualizarla. */
                                    const file = e.target.files[0];
                                    setMainPhotographFile(file);
                                    if (file) {
                                        setMainPhotographPreview(
                                            URL.createObjectURL(file)
                                        );
                                    }
                                }  
                                }
                            />
                            <div className="dog-form-photo-buttons">
                                {currentMainPhotograph && !deleteMainPhotograph && (
                                    <button
                                        type="button"
                                        className= "dog-form-delete-button"
                                        onClick={handleDeleteMainPhotograph}
                                    >
                                        Eliminar fotografía principal
                                    </button>
                                )}
                                {mainPhotographFile && (
                                    <button
                                        type="button"
                                        className= "dog-form-cancel-button"
                                        onClick={handleCancelNewMainPhotograph}
                                    >
                                        Cancelar cambio
                                    </button>
                                )}
                            </div>
                    </div>

                    {/* FOTOGRAFÍAS SECUNDARIAS */}
                    <div className="dog-form-secondary-photographs-container">
                        <label
                            htmlFor="photographs"
                            className="dog-form-label"
                        >
                            Fotografías adicionales
                        </label>

                        <div className="dog-form-secondary-photographs">
                            {currentSecondaryPhotographs
                                .filter(
                                    (photo) =>
                                        !photographsToDelete.includes(photo.id)
                                )
                                .map((photo) => (
                                    <div key={photo.id}
                                        className ="dog-form-photo-container">
                                        <img
                                            src={photo.imagen}
                                            alt={photo.title}
                                            className="dog-form-photograph"
                                        />

                                        <button
                                            type="button"
                                            className= "dog-form-delete-button"
                                            onClick={() =>
                                                handleDeleteExistingPhotograph(photo.id)
                                            }
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))
                            }

                            {newSecondaryPhotographs.map((photo) => (
                                <div key={photo.id}
                                    className ="dog-form-photo-container"
                                    >
                                    <img
                                        src={photo.preview}
                                        alt="Nueva fotografía"
                                        className="dog-form-photograph"
                                    />

                                    <button
                                        type="button"
                                        className= "dog-form-delete-button"
                                        onClick={() =>
                                            handleDeleteNewPhotograph(photo.id)
                                        }
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>

                        <input
                            id="photographs"
                            type="file"
                            accept="image/*"
                            className="dog-form-file-input"
                            multiple
                            onChange={handleSecondaryPhotographsChange}
                            
                        />
                        {photographError && (
                            <p className="error-message">
                                {photographError}
                            </p>
                        )}
                        <p> Puedes añadir {availablePhotographSlots} fotografía(s) más. </p>

                    </div>

                    {/* VÍDEOS */}
                    <div className="dog-form-video-container">
                        <label
                            htmlFor="main-video"
                            className="dog-form-label"
                        >
                           {currentVideo
                                ? "Cambiar vídeo"
                                : "Añadir vídeo"
                            }
                        </label>

                            {/* Muestra la previsualización del vídeo */}
                            {(videoPreview || (!deleteVideo && currentVideo)) && (
                                <video
                                    controls
                                    src={
                                        videoPreview ||
                                        currentVideo.file
                                    }
                                    className="dog-form-video"
                                />
                            )}

                            <input
                                id="main-video"
                                type="file"
                                className="dog-form-file-input"
                                accept="video/*"
                                onChange={(e) => {
                                    /* Al seleccionar un nuevo vídeo no se dispone de una URL
                                        todavía ya que no se ha añadido el vídeo en el sistema.
                                        Por tanto, se crea una URL temporal para poder visualizarla. */
                                    const file = e.target.files[0];
                                    setVideoFile(file);
                                    if (file) {
                                        setVideoPreview(
                                            URL.createObjectURL(file)
                                        );
                                    }
                                    }  
                                }
                            />

                            <div className="dog-form-video-buttons">
                                {currentVideo && !deleteVideo && (
                                    <button
                                        type="button"
                                        className= "dog-form-delete-button"
                                        onClick={handleDeleteVideo}
                                    >
                                        Eliminar vídeo
                                    </button>
                                )}

                                {videoFile && (
                                    <button
                                        type="button"
                                        className= "dog-form-cancel-button"
                                        onClick={handleCancelNewVideo}
                                    >
                                        Cancelar cambio
                                    </button>
                                )}  
                            </div>
                        </div>

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