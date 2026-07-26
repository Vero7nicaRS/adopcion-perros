import dog_home from "../assets/dog_home.png";
import '../styles/Home.css';

function Home(){
    return(
        <>
            <div className="inicio">
                <img
                    src={dog_home}
                    alt="Perro esperando ser adoptado"
                />

                <div className="contenido-inicio">
                    <h1>¿Me adoptas?</h1>

                    <p>
                        Un hogar puede cambiar su vida...
                        <span> y la tuya.</span>
                    </p>

                </div>
            </div>
        </>
    )

}export default Home;