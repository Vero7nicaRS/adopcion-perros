import { Link } from "react-router-dom";
import "../styles/ApplicationCard.css";

const API_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000";

function formatAge(age, unit) {
    if (age === null || age === undefined) {
        return "Desconocida";
    }

    if (unit === "MONTHS") {
        return `${age} ${age === 1 ? "mes" : "meses"}`;
    }

    return `${age} ${age === 1 ? "año" : "años"}`;
}

function formatDate(date) {
    if (!date) {
        return "Desconocida";
    }

    return new Date(date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatStatus(status) {
    switch (status) {
        case "PENDING":
            return "Pendiente";
        case "ACCEPTED":
            return "Aceptada";
        case "REJECTED":
            return "Rechazada";
        default:
            return "Desconocido";
    }
}

function getStatusClass(status) {
    switch (status) {
        case "PENDING":
            return "status-pending";
        case "ACCEPTED":
            return "status-accepted";
        case "REJECTED":
            return "status-rejected";
        default:
            return "";
    }
}

function ApplicationCard({ application, isAdmin, onAccept, onReject}) {
    const dog = application.dog_detail;

    if (!dog) {
        return null;
    }

    const photographUrl = dog.main_photograph
        ? `${API_BASE}${dog.main_photograph}`
        : null;

    return (
        <div className="card application-card shadow">
            {photographUrl ? (
                <img
                    src={photographUrl}
                    className="card-img-top"
                    alt={`Fotografía de ${dog.name}`}
                />
            ) : (
                <div className="without-photo">
                    Sin fotografía
                </div>
            )}

            <div className="card-body">
                <h2 className="card-title application-card-title">
                    {dog.name}
                </h2>

                <p>
                     <strong>Sexo: </strong>
                     {dog.sex === "MALE" ? "Macho" : dog.sex === "FEMALE" ? "Hembra" : "Desconocido"}
                     
                </p>

                <p>
                    <strong>Raza: </strong>
                    {dog.breed || "Desconocida"}
                </p>

                <p>
                    <strong>Edad: </strong>
                    {formatAge(
                        dog.estimated_age,
                        dog.estimated_age_unit
                    )}
                </p>
                
                <div className="application-status-container">
                    <strong>Estado: </strong>
                    <p className={`application-status 
                                    ${getStatusClass(application.status)}`}
                    >
                        {formatStatus(application.status)}
                    </p>
                </div>

                <p>
                    <strong>Fecha: </strong> {formatDate(application.created_at)}
                </p>
                <div className="application-comment">
                    <strong>Comentarios:</strong>
                    <p>{application.comment || "Sin comentarios"}</p>
                </div>
                <Link
                    to={`/dogs/${dog.id}`}
                    className="btn dog-btn"
                    >
                    Ver ficha
                </Link>

                {isAdmin && application.status === "PENDING" && (
                    <div className="application-admin-actions">
                        <button
                            onClick={() => onAccept(application.id)}
                            type="button"
                            className="btn dog-btn-accept"
                        >
                            Aceptar
                        </button>

                        <button
                            onClick={() => onReject(application.id)}
                            type="button"
                            className="btn dog-btn-reject"
                        >
                            Rechazar
                        </button>
                    </div>
                )}
            </div>
 
        </div>
    );
}

export default ApplicationCard;