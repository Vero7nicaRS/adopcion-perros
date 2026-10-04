// CSS
import "../styles/ContactPage.css";

function ContactPage() {
    return (
        <>
            <div className="contact-container">

                <h1 className="contact-header">
                    Contacto
                </h1>

                <p className="contact-text">
                    Si tienes alguna duda sobre el proceso de adopción,
                    alguno de nuestros perros o el funcionamiento de la aplicación,
                    puedes ponerte en contacto con nosotros.
                </p>

                <div className="contact-card">
                    <i className="bi bi-envelope contact-card-icon"></i>

                    <h2 className="contact-card-title">
                        Correo electrónico
                    </h2>

                    {/* Enlace de correo electrónico */}
                    <a
                        href="mailto:contacto@adoptatucanino.es"
                        className="contact-email"
                    >
                        contacto@adoptatucanino.es
                    </a>
                </div>
            </div>
        </>
    )
    
} export default ContactPage;