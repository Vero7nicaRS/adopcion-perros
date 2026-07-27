import Carousel from "react-bootstrap/Carousel";
import "../styles/DogPhotographs.css";

function DogPhotographs({ photographs }) {
    return (
            <Carousel 
                className="carousel-tam"
                prevIcon={<i className="bi bi-chevron-left fs-1"></i>}
                nextIcon={<i className="bi bi-chevron-right fs-1"></i>}
                indicators={photographs.length > 1} // Hiding indicators when there are one photograph
                controls={photographs.length > 1} // Hiding controls when there are one photograph
            >
                {photographs?.map((photograph) => (
                    <Carousel.Item 
                        className="carousel-item"
                        key={photograph.id}
                    >
                        <img
                            className="d-block w-100 dog-carousel-image"
                            src={photograph.imagen}
                            alt={photograph.title || "Fotografía del perro"}
                        />
                    </Carousel.Item>
                ))}
            </Carousel>
        
    );
}

export default DogPhotographs;