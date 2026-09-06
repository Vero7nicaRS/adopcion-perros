import { useState } from "react";

// CSS
import "../styles/ChatBotWidget.css";

// Components
import DogCard from "../components/DogCard"

// Guardar la hora del envío del mensaje.
function getCurrentTime () {
    const now = new Date();
    return now.toLocaleTimeString([], {hour : '2-digit', minute: '2-digit'});
};

function ChatBotWidget() {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: crypto.randomUUID(),
            sender: "bot",
            text: "¡Hola! 🐾 Cuéntame un poco sobre ti y sobre el tipo de perro que buscas.",
            time: getCurrentTime() 
        }
    ]);  // Guarda el historial de mensajes.
    const [preferences, setPreferences] = useState(null); // Guarda las preferencias que devuelve Django.
    const [input, setInput] = useState(''); // Lo que escribe el usuario.
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);    
    const [recommendations, setRecommendations] = useState([]);
    const [finished, setFinished] = useState(false); // Indica si la conversación ha acabado.

    // Handler del botón de volver a solicitar recomendación
    const handleRestart = () => {
        // Se mantiene la conversación anterior (recomendaciones que realiza [cards]).
        // Las preferencias y recomendaciones se vacían. Asimismo, se indica que la conversación
        // no se ha terminado.

        setPreferences(null);
        setRecommendations([]);
        setFinished(false); // La conversación vuelve a comenzar.

        // El chat devuelve un nuevo mensaje: se comienza la nueva búsqueda
        const botMessage = {
            id: crypto.randomUUID(),
            sender: "bot",
            text: "¡Perfecto! Vamos a buscar de nuevo. Cuéntame qué tipo de perro estás buscando 🔎", 
            time: getCurrentTime()
        }

        setMessages((previousMessages) => [
            // ...previousMessages,
            botMessage
        ]);
    }

    //  Handler del submit
    const handleSubmit = async (e) => {
        e.preventDefault(); // IMPORTANTE: evitar recarga de página
        setSubmitError(null);

        if(!input.trim()){
            return;
        }

        // Crear mensaje del usuario
        const newMessage = {
            id: crypto.randomUUID(),
            sender: "user",
            text: input, 
            time: getCurrentTime()
        };

        // Añadir al historial.
        setMessages((previousMessages) => [
            ...previousMessages,
            newMessage
        ]);

        console.log(messages);
        setInput("");

        setSubmitting(true);
        try {

            const response = await fetch(`${API_BASE}/adopta_tu_canino/chatbot/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message:input, 
                        preferences: preferences
                    })
                }  
            );

            const data = await response.json();
            if (!response.ok){
                throw new Error(
                data.detail || "Error al comuniarse con el chatbot."
              );
            }
            setPreferences(data.preferences);
            setRecommendations(data.recommendations);
            if (data.finished) { // Si la conversación ha acabado
                setFinished(true);
            }

            console.log(data);
            console.log("FINISHED ESTADITO BABE", finished);

            const botMessage = {
                id: crypto.randomUUID(),
                sender: "bot",
                text: data.message, 
                time: getCurrentTime()
            }

            setMessages((previousMessages) => [
                ...previousMessages,
                botMessage
            ]);

        } catch (err) {
          console.error("❌ Error en el formulario:", err);
          setSubmitError(err.message);

        } finally {
          setSubmitting(false);
        }
    };

    return (
        <>
            <div>
                
                {isOpen && (
                    <div className = "chatbot-container"> 
                        <div className="chatbot-header"> 
                            <div className="chatbot-header-text">
                                
                                <p className="chatbot-title">Asistente de adopción</p>
                                <p className="chatbot-subtitle">Te ayudamos a encontrar tu compañero ideal</p>
                            </div>
                           {/*   <button
                                type="button"
                                className="close-button-form"
                                onClick={() => setIsOpen(false)}>
                                <i className="bi bi-x-circle"></i>
                            </button>
                            */}
                        </div>
                
                        <div className="chatbot-messages">
                            {messages.map((message) => (
                                <div
                                    key= {message.id}
                                    className={`chatbot-message ${message.sender}`}
                                >
                                    <p>{message.text}</p>
                                    <span>{message.time}</span>


                                </div>
                            ))}
                            {/* Devuelve las recomendaciones */}
                            {recommendations.length > 0 && (
                                <>
                                    <div className="chatbot-recommendations"> 
                                        {recommendations.map((recommendation) => (
                                                <DogCard
                                                    key = {recommendation.dog.id} 
                                                    dog = {recommendation.dog}
                                                    compatibility = {recommendation.compatibility}
                                                ></DogCard>
                                        ))}
                                    </div> 
                                </>
                            )}
                            {finished && (
                                <button
                                    type = "button"
                                    className="chatbot-restart-button"
                                    onClick={handleRestart}
                                    >
                                        Buscar de nuevo
                                </button> 
                            )}

                        </div>
                        
                        <form 
                            className="chatbot-form"
                            onSubmit={handleSubmit}>
                            {/* No se puede escribir si hay recomendaciones. */}
                            <textarea
                                type = "text"
                                value= {input}
                                onChange={(event) => setInput(event.target.value)}
                                placeholder="Escribe un mensaje..."
                                rows={3}
                                disabled={recommendations.length > 0}
                            />
                            <button
                                className="send-button-form"
                                type="submit" 
                                disabled={submitting || recommendations.length > 0}
                            >
                                <i className="bi bi-send"></i>
                            </button>
                        </form> 
                       
                    </div>
                )}
                <button 
                    onClick={ () => setIsOpen(!isOpen)}
                    className="chatbot-button-isOpen"
                >
                    {isOpen ? 
                        <i className="bi bi-x-circle"></i>
                        : 
                        <i className="bi bi-chat-left-heart-fill"></i>
                    }

                    
                </button>
            </div>
        </>
    )

    
}export default ChatBotWidget;
