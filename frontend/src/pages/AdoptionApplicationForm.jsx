// CSS
import "../styles/AdoptionApplicationForm.css";


import { useState } from "react";

import { useParams } from "react-router-dom";

// Components

import DogSummary from "../components/DogSummary";
import DogInfoDetail from "../components/DogInfoDetail"

function AdoptionApplicationForm() {

  // Id de la URL
  const { id } = useParams();

    // 1. Un estado por cada campo del formulario
    const [body, setBody] = useState("");
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    console.log("🎨 Render del form — body:", body);

    // 2. Handler del submit
    const handleSubmit = async (e) => {
        e.preventDefault(); // ← IMPORTANTE: evitar recarga de página
        console.log("📤 Enviando formulario:", {body});

        // Validación básica
        if (!body.trim()) {
        alert("⚠️ Cuerpo es obligatorio");
        return;
        }

        setSubmitting(true);
        try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({body}),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log("✅ Post creado con ID:", data.id);
        setResult(data);

        setBody("");
        }
        catch (err) {
        console.error("❌ Error al crear el post:", err);
        alert("Error al crear el post: " + err.message);
        } finally {
        setSubmitting(false);
        }
    };

    return(
        <>
            <div className ="adoption-form-container">
                <h1> Solicitud de adopción</h1>

                Cuéntanos por qué quieres adoptar a este perro e indícanos cualquier
                información que consideres relevante para su adopción.

                <DogSummary></DogSummary>
                <form onSubmit={handleSubmit}>

                    {/* Textarea — mismo patrón */}
                    <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
                        Comentarios
                    </label>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Escribe el contenido..."
                        rows={4}
                        style={{
                        width: "100%",
                        padding: "0.5rem",
                        fontSize: "1rem",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        boxSizing: "border-box",
                        resize: "vertical",
                        }}
                    />
                    </div>

            
                    <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        backgroundColor: "#0066ff",
                        color: "white",
                        border: "none",
                        padding: "0.75rem 2rem",
                        fontSize: "1rem",
                        borderRadius: 6,
                        cursor: submitting ? "not-allowed" : "pointer",
                    }}
                    >
                    {submitting ? "⏳ Enviando..." : "📤 Publicar post"}
                    </button>
                </form>

                {/* Resultado del POST */}
                {result && (
                    <div
                    style={{
                        marginTop: "2rem",
                        padding: "1rem",
                        backgroundColor: "#d4edda",
                        borderRadius: 8,
                        border: "1px solid #c3e6cb",
                    }}
                    >
                    <h3>✅ Post creado con éxito</h3>
                    <p><strong>ID:</strong> {result.id}</p>
                    <p><strong>Título:</strong> {result.title}</p>
                    <p><strong>Cuerpo:</strong> {result.body}</p>
                    </div>
                )}
                </div>
        </>
    )
}export default AdoptionApplicationForm;