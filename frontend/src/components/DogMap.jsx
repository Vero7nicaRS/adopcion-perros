import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/DogMap.css";


function DogMap({ location }) {

    if (
        !location ||
        location.latitude === null ||
        location.longitude === null
    ) {
        return null;
    }

    const position = [
        Number(location.latitude),
        Number(location.longitude)
    ];

    return (
        <>
            <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={false}
                className="dog-map"
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={position}>
                    <Popup>
                        <strong>{location.name}</strong>
                        <br />
                        {location.locality}, {location.province}
                    </Popup>
                </Marker>
            </MapContainer>
        </>
        
    );
}

export default DogMap;