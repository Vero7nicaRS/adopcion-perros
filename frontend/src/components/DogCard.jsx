import { Link } from "react-router-dom";
import { API_BASE_URL } from "../api/url_api";
import "../styles/DogCard.css";


function formatAge(age, unit) {
    if (age === null || age === undefined) {
        return "Desconocida";
    }

    if (unit === "MONTHS") {
        return `${age} ${age === 1 ? "mes" : "meses"}`;
    }

    return `${age} ${age === 1 ? "año" : "años"}`;
}

function DogCard({ dog }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  const photographUrl = dog.main_photograph
                          ? `${API_BASE}${dog.main_photograph}`
                          : null;

  return (
    <div className="card dog-card shadow">
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
        <h5 className="card-title">{dog.name}</h5>
         <p className="card-text">
            <strong>Sexo: </strong>
            {dog.sex === "MALE" ? " Macho" : dog.sex === "FEMALE" ? " Hembra" : " Desconocido"}
        </p>
        <p className="card-text">
            <strong>Raza: </strong>
            {dog.breed ? " " + dog.breed : " Desconocida"}
        </p>
       
        <p className="card-text">
            <strong>Edad: </strong> {formatAge(
                dog.estimated_age,
                dog.estimated_age_unit
            )}
        </p>
        
        <Link
          to={`/dogs/${dog.id}`}
          className="btn dog-btn"
        >
          Ver más
        </Link>
      </div>
    </div>
  );
}

export default DogCard;