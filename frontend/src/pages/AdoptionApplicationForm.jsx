// CSS
import "../styles/AdoptionApplicationForm.css";

// Modulos
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Components
import DogSummary from "../components/DogSummary";
import DogInfoDetail from "../components/DogInfoDetail"

// Context
import useAuth from "../context/authentication/useAuth";

function AdoptionApplicationForm() {

    // Id de la URL
    const { id } = useParams();

    const { accessToken } = useAuth();

    //     
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

    // Estados de UseEffect
    const [dogDetail, setDogDetail] = useState(null); // Datos del listado de perros
    const [loading, setLoading] = useState(true); // Indica si los datos están cargados o no.
    const [error, setError] = useState(null); // Indica si hay un error o no.

    // 1. Un estado por cada campo del formulario
    const [comment, setComment] = useState("");
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    console.log("🎨 Render del form — comment:", comment);
      const controller = new AbortController()

      useEffect(() => {
        console.log( "Lanzando fetch a la API...");
        setLoading(true);
        setError(null);
    
        // Obtener los datos de la API: listado de perros
        const fetchDogDetail = async () => {
          try {
            // 1) Se obtiene el listado de perros
            const dogResponse = await fetch(`${API_BASE}/adopta_tu_canino/perros/${id}`);
            if (!dogResponse.ok){
              throw new Error(`ERROR HTTP: No se pudo cargar el listado de perros ${dogResponse.status}`);
            }
            const dogResult = await dogResponse.json();
    
            setDogDetail(dogResult);
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
        fetchDogDetail();
        
        // Limpiar la llamada fetch si el componente se desmonta antes de recibir la respuesta
        return () => {
          console.log("Limpiando fetch...");
          controller.abort();
        };
      }, [id]);

    // 2. Handler del submit
    const handleSubmit = async (e) => {
        e.preventDefault(); // ← IMPORTANTE: evitar recarga de página
        setSubmitError(null);
        setResult(null);
        console.log("📤 Enviando formulario:", {comment});

        // Validación básica
        if (!comment.trim()) {
          setSubmitError(" Los comentarios son obligatorios.");
          return;
        }

        setSubmitting(true);
        try {
          const response = await fetch(`${API_BASE}/adopta_tu_canino/solicitud-adopcion/`, {
              method: "POST",
              headers: { "Content-Type": "application/json", 
                          "Authorization": `Bearer ${accessToken}` 
                        },
              // Aquí se envía el ID del perro y el comentario del usuario
              body: JSON.stringify({
                  dog: Number(id),
                  comment: comment.trim()
              })
          });
         
          const data = await response.json();
           if (!response.ok){
                throw new Error(
                data.dog?.[0] ||
                data.comment?.[0] ||
                "Error al crear la solicitud de adopción."
              );
            }
          
          console.log("✅ Solicitud de adopción con ID:", data.id);
          setResult(data);
          setComment("");

        } catch (err) {
          console.error("❌ Error al crear la solicitud de adopción:", err);
          setSubmitError(err.message);

        } finally {
          setSubmitting(false);
        }
    };


    if (loading) return <p className="hd-info">🔄 Cargando...</p>;
    if (error) return <p className="hd-error">{error}</p>;

    return(
        <>
            <div className ="adoption-form-container">
              <div className="adoption-form-header">
                <h1> Solicitud de adopción</h1>
              </div>
              <div className= "adoption-form-text">
                  <i className="bi bi-stars"></i> Cuéntanos por qué quieres adoptar a este perro e indícanos cualquier
                  información que consideres relevante para su adopción. 
              </div>
               
                {
                    dogDetail && (
                       <DogSummary         
                            key = {id} 
                            dog = {dogDetail} >
                        </DogSummary> 
                    )
                }
                
                <div className="application-form">
                  <form onSubmit={handleSubmit}>

                    {/* Textarea*/}
                    <div className="dog-application-form-comment">
                      <label 
                        htmlFor="comment"
                        className="dog-application-form-label">
                          Comentarios
                      </label>
                      <textarea
                          id = "comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Escribe el contenido..."
                          rows={4}
                          className= "dog-application-form-textarea"
                      />
                    </div>

              
                    <button
                      type="submit"
                      disabled={submitting}
                      className = "dog-application-form-button"   
                      >
                      {submitting ? "⏳ Enviando..." : "Enviar formulario de adopción"}
                    </button>
                  </form>

                </div>
               
                {/* Resultado del POST */}
                {result && (
                    <div
                    className="dog-application-form-result"
                    >
                    <h3><i className="bi bi-check-circle"></i> Solicitud enviada con éxito</h3>
                    <p>
                        Tu solicitud de adopción se ha enviado correctamente.
                        La asociación la revisará y se pondrá en contacto contigo si es necesario.
                    </p>
                    <p><strong>Comentarios:</strong> {result.comment}</p>
                    </div>
                )}
                {submitError && (
                    <div className="dog-application-form-error">
                        {submitError}
                    </div>
                )}
                </div>
        </>
    )
}export default AdoptionApplicationForm;