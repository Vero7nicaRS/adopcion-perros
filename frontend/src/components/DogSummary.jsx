//CSS
import "../styles/DogSummary.css"

import { API_BASE_URL } from "../api/url_api";

// Components
import DogInfoDetail from "../components/DogInfoDetail"
import DogPhotographs from "../components/DogPhotographs";

function formatAge(age, unit) {
    if (age === null || age === undefined) {
        return "Desconocida";
    }

    if (unit === "MONTHS") {
        return `${age} ${age === 1 ? "mes" : "meses"}`;
    }

    return `${age} ${age === 1 ? "año" : "años"}`;
}

function DogSummary( {dog}) {
    return( 
        <>

             <div className="dog-summary-container">
                <div className = "dog-detail-main">
                    <div className="card mb-3" >
                        <div className="row g-0">
                            <div className="col-md-4">
                                {dog.main_photograph ? (
                                    <img
                                        src={`${API_BASE_URL}${dog.main_photograph}`}
                                        alt={`Fotografía de ${dog.name}`}
                                    />
                                ) : (
                                    <div className="dog-summary-without-photo">
                                        Sin fotografía
                                    </div>
                                )}
                            </div>
                            <div className="col-md-8">
                                <div className="card-body">
                                    <h1 className="card-title">{dog.name}</h1>
                                
                                    
                                    <div className="dog-summary-data">
                                        <div>
                                            <DogInfoDetail
                                                    title= "Sexo"
                                                    icon = { dog.sex === "MALE" ? "bi-gender-male"
                                                                : dog.sex === "FEMALE" ? "bi-gender-female" 
                                                                : " Desconocido"
                                                            }
                                                    value = { dog.sex === "MALE" ? " Macho" 
                                                                : dog.sex === "FEMALE" ? " Hembra" 
                                                                : " Desconocido"
                                                            }
                                            ></DogInfoDetail>

                                        </div>

                                        <div>
                                            <DogInfoDetail
                                                    title= "Raza"
                                                    icon = "bi bi-bookmark-heart"
                                                    value = {dog.breed}
                                            ></DogInfoDetail>
                                        </div>

                                        <div>
                                            <DogInfoDetail
                                                    title= "Edad"
                                                    icon = "bi bi-cake"
                                                    value = {formatAge(
                                                        dog.estimated_age,
                                                        dog.estimated_age_unit
                                                    )}
                                            ></DogInfoDetail> 
                                        </div>       
                                
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>       
            </div>
        </>

    );
}export default DogSummary;