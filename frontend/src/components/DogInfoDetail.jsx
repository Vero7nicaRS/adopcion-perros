function DogInfoDetail({ title, icon, value }) {
    return (
        <div className="dog-info-item">
            <strong>
                <i className={`bi ${icon}`}></i>{" "}
                {title}: { } 
            </strong>

            { value ? value : "Desconocido"}
        </div>
    );
} export default DogInfoDetail;