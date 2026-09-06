from dotenv import load_dotenv
from openai import OpenAI

from .models import Temperament
import json

load_dotenv()


client = OpenAI()

# Cada vez que se hace una petición al chatbot, debe recordar la información
# que se le ha ido pasando. 
# Ej:
# None
#   - no tenemos información nueva
#   - conservar valor anterior

# []
#   - no se ha mencionado temperamento nuevo
#   - conservar temperamento anterior

# valor real
#   - actualizar
def update_preferences(current_preferences, new_preferences):
    updated_preferences = current_preferences.copy()

#   {
#    ('housing', 'APARTMENT'), 
#    ('human_activity_level', 'LOW' ), 
#    ('has_dog', TRUE), 
#    ('has_cat', TRUE),
#    ('has_children', FALSE)
#    ('preferred_temperament': ["Tranquilo"])
#   }
    for preference in new_preferences:
#   preference = ('preferred_temperament': ["Tranquilo"])
        new_value = new_preferences[preference]

#   preference === 'preferred_temperament'
        if preference == "preferred_temperament":
#   Concatena las preferencias actuales con las nuevas.
            if new_value:
                updated_preferences[preference] = list(
                    set(updated_preferences[preference] + new_value)
                )
        elif new_value is not None:
            updated_preferences[preference] = new_value

    return updated_preferences

def extract_preferences(message, expected_preference):
    temperament_names = list(
        Temperament.objects.values_list("name", flat=True)
    )
    temperaments_text = ", ".join(temperament_names)

    response = client.responses.create(
        model="gpt-5-nano",

        instructions=f"""
        Eres un asistente de una aplicación de adopción de perros.

        Tu tarea es extraer las preferencias del usuario a partir
        del mensaje proporcionado.

        No inventes información que el usuario no haya indicado.

        El criterio sobre el que se está preguntando actualmente es:
        {expected_preference}

        Utiliza este dato únicamente como contexto para interpretar
        respuestas breves del usuario.

        Si la respuesta breve indica una cantidad mayor que cero para
        has_children, has_dogs o has_cats, interpreta que convive con ellos.

        Para housing utiliza:
        - APARTMENT: si vive en un piso
        - HOUSE: si vive en una casa

        Para human_activity_level utiliza:
        - LOW: actividad baja, paseos tranquilos, poco ejercicio o poco tiempo para realizar actividad.
        - MEDIUM: actividad media, paseos habituales y algo de ejercicio.
        - HIGH: actividad alta, mucho ejercicio o practica actividades.

        Para has_children, has_dogs y has_cats:
        - true si indica que convive con uno o más
        - false si indica explícitamente que no convive con ninguno
        - null si no proporciona esa información

        Para preferred_temperament utiliza únicamente alguno 
        de estos valores: {temperaments_text}.

        En preferred_temperament estarán temperamentos que indique el usuario
        que desee para su animal.

        No incluyas en preferred_temperament temperamentos que describan al
        usuario, a sus hijos, familiares u otros animales.
        
        No deduzcas un temperamento por tener hijos, perros, gatos, 
        por el tipo de vivienda ni por el nivel de actividad del usuario.
    
        Por ejemplo:
        - "Soy una persona activa" -> preferred_temperament no incluye "Activo" porque
        está describiendo un rasgo del usuario y no del animal.
        - "Busco un perro activo" -> preferred_temperament incluye "Activo".
        - "Tengo hijos cariñosos" -> preferred_temperament no incluye "Cariñoso" porque está describiendo un rasgo de los hijos y no del animal.
        """,

        input=message,

        text={
            "format": {
                "type": "json_schema",
                "name": "dog_preferences",
                "strict": True,

                "schema": {
                    "type": "object",

                    "properties": {
                        "housing": {
                            "type": ["string", "null"],
                            "enum": ["APARTMENT", "HOUSE", None]
                        },

                        "human_activity_level": {
                            "type": ["string", "null"],
                            "enum": ["LOW", "MEDIUM", "HIGH", None]
                        },

                        "has_children": {
                            "type": ["boolean", "null"]
                        },

                        "has_dogs": {
                            "type": ["boolean", "null"]
                        },

                        "has_cats": {
                            "type": ["boolean", "null"]
                        },

                        "preferred_temperament": {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "enum": temperament_names
                            }
                        }
                    },

                    "required": [
                        "housing",
                        "human_activity_level",
                        "has_children",
                        "has_dogs",
                        "has_cats",
                        "preferred_temperament"
                    ],

                    "additionalProperties": False
                }
            }
        }
    )
    preferences = json.loads(response.output_text)
    print("Tokens entrantes: ", response.usage.input_tokens)
    return preferences

# Cuestiones que va a realizar el chatbot para cada preferencia
QUESTIONS = {
    "housing": "¿Vives en un piso o en una casa?",
    "human_activity_level": (
        "¿Qué nivel de actividad puedes ofrecerle al perro? "
        "Por ejemplo, paseos tranquilos, paseos frecuentes "
        "o bastante ejercicio y actividad."
    ),
    "has_children": "¿Hay niños viviendo contigo?",
    "has_dogs": "¿Convives actualmente con algún perro?",
    "has_cats": "¿Convives actualmente con algún gato?",
}

# create_empty_preferences: 
# Crea las preferencias del usuario vacías (sin ningún tipo de información).
#
def create_empty_preferences():
    return {
        "housing": None,
        "human_activity_level": None,
        "has_children": None,
        "has_dogs": None,
        "has_cats": None,
        "preferred_temperament": [],
    }


# create_empty_preferences: 
# Obtiene las preferencias que faltan del usuario.
# Resultados posibles:
# - Si devuelve el array vacío significa que se conocen TODAS las preferencias del usario.
# - Si devuelve el array con datos significa que FALTAN algunas preferencias del usuario
def get_missing_preferences(preferences):
    required_preferences = [
        "housing",
        "human_activity_level",
        "has_children",
        "has_dogs",
        "has_cats",
    ]

    # Almacena las preferencias que no ha comentado el usuario, es decir,
    # las que se desconocen.
    missing_preferences = []

    for preference in required_preferences:
        # Si no hay información acerca de una preferencia, 
        # se almacena para conocer qué información falta.
        if preferences[preference] is None:
            missing_preferences.append(preference)

    return missing_preferences

# get_next_question
# Obtiene las preferencias del usuario que se desconocen y se realizan
# las preguntas acerca de estas preferencias desconocidas para obtener información de estas.

def get_next_question(preferences):
    # Obtiene el listado de preferencias del usuario que se desconocen
    missing_preferences = get_missing_preferences(preferences)

    # Si el listado está vacío, significa que ya se ha obtenido  
    # TODA la información acerca de las preferencias del usuario.
    if not missing_preferences:
        return None

    # Pregunta por la primera preferencia que se desconoce del usuario
    next_preference = missing_preferences[0]

    return QUESTIONS[next_preference]