from .models import Dog
# get_activity_level: define el nivel de actividad del perro según su temperamento.
# - Si es Enérgico o Intenso, se considera de actividad alta.
# - Si es Activo o Juguetón, se considera de actividad media.
# - Si es Tranquilo, se considera de actividad baja.
def get_activity_level(dog):
    # Temperaments List 
    temperaments = set(
        dog.temperament.values_list("name", flat=True)
    )

    # & : Intersection
    if {"Enérgico", "Intenso"} & temperaments :
        return "HIGH"
    if {"Activo", "Juguetón"} & temperaments:
        return "MEDIUM"
    if {"Tranquilo"} & temperaments:
        return "LOW"

    return "UNKNOWN"

# has_excluding_incompatibility: comprueba si existe alguna compatibilidad excluyente 
# entre el perro y las especificaciones del usuario.
# - True: descarta al animal.
# - False: no descarta al animal.
def   has_excluding_incompatibility(dog, preferences):
    if (
        preferences["has_children"]
        and dog.children_compatibility == "NO"
    ):
        return True

    if (
        preferences["has_dogs"]
        and dog.dog_compatibility == "NO"
    ):
        return True

    if (
        preferences["has_cats"]
        and dog.cat_compatibility == "NO"
    ):
        return True

    return False

# get_activity_compatibility: define el nivel de compatibilidad entre la actividad humana y el perro
# Una persona con actividad alta puede adaptarse a un perro con actividad alta, media o baja.
# Una persona con actividad media puede adaptarse a un perro con actividad media o baja.
# Una persona con actividad baja  puede adaptarse a un perro con actividad baja.
def get_activity_compatibility(dog, human_activity_level):
    dog_activity_level = get_activity_level(dog)

    if dog_activity_level == "UNKNOWN":
        return "UNKNOWN"

    # = Activity level
    if dog_activity_level == human_activity_level:
        return "GOOD"

    # HIGH human activity level
    if (
        human_activity_level == "HIGH"
        and dog_activity_level in {"LOW", "MEDIUM", "HIGH"}
    ):
        return "GOOD"

    # MEDIUM human activity level
    if (
        human_activity_level == "MEDIUM"
        and dog_activity_level in {"LOW", "MEDIUM"}
    ):
        return "GOOD"

    # LOW human activity level
    if (
        human_activity_level == "LOW"
        and dog_activity_level == "LOW"
    ):
        return "GOOD"

    return "LOWER"



# def get_max_score(preferences): Indica cuál es la puntuación máxima que puede conseguir 
# el perro según las preferencias del usuario.
#
def get_max_score(preferences): 
    max_score = 1 # Incluye: Nivel de actividad

    if preferences["has_children"]:
        max_score += 1

    if preferences["has_dogs"]:
        max_score += 1

    if preferences["has_cats"]:
        max_score += 1

    if preferences["preferred_temperament"]: 
        max_score += 1 # El Temperamento no suma siempre porque quizás el usuario 
                    # no tenga preferencia por el temperamento del perro.

    return max_score

# calculate_compatibility: calcula la puntuación de compatibilidad
# entre el perro y las preferencias del usuario.
#
def calculate_compatibility(dog, preferences):

    max_score = get_max_score(preferences) # Puntuación máxima que puede conseguir el perro para ese usuario

    # Si tiene alguna incompatibilidad (perros, gatos y/o niños), se descarta al perro.
    if has_excluding_incompatibility(dog, preferences):
        return {
            "excluded": True,
            "score": 0,
            "max_score": max_score,
            "activity_compatibility": None,
            "children_evaluation": None,
            "dogs_evaluation": None,
            "cats_evaluation": None,
            "temperament_match": False,
            "warnings": [],
        }

    score = 0 # Puntos que consigue el perro
    warnings = []

    # Actividad
    activity_compatibility = get_activity_compatibility(
        dog,
        preferences["human_activity_level"]
    )

    if activity_compatibility == "GOOD":
        score = score + 1
    elif activity_compatibility == "UNKNOWN":
        warnings.append(
            "No se ha podido determinar el nivel de actividad del perro."
        )

    # Niños
    children_evaluation = None # Se inicializa como "None", se desconoce

    if preferences["has_children"]:
        children_evaluation = dog.children_compatibility

        if children_evaluation == "YES":
            score += 1
        elif children_evaluation == "UNKNOWN":
            warnings.append(
                "Se desconoce su compatibilidad con niños."
            )

    # Perros
    dogs_evaluation = None

    if preferences["has_dogs"]:
        dogs_evaluation = dog.dog_compatibility

        if dogs_evaluation == "YES":
            score += 1
        elif dogs_evaluation == "UNKNOWN":
            warnings.append(
                "Se desconoce su compatibilidad con otros perros."
            )

    # Gatos
    cats_evaluation = None

    if preferences["has_cats"]:
        cats_evaluation = dog.cat_compatibility

        if cats_evaluation == "YES":
            score += 1
        elif cats_evaluation == "UNKNOWN":
            warnings.append(
                "Se desconoce su compatibilidad con gatos."
            )

    # Temperamento preferido
    temperament_match = False
    preferred_temperament = preferences["preferred_temperament"]

    if preferred_temperament:

        dog_temperaments = set(
            dog.temperament.values_list("name", flat=True)
        )

        if set(preferred_temperament) & dog_temperaments:
            temperament_match = True
            score += 1

    return {
        "excluded": False,
        "score": score,
        "max_score": max_score,
        "activity_compatibility": activity_compatibility,
        "children_evaluation": children_evaluation,
        "dogs_evaluation": dogs_evaluation,
        "cats_evaluation": cats_evaluation,
        "temperament_match": temperament_match,
        "warnings": warnings,
    }


# recommend_dogs: Obtiene los perros compatibles con las preferencias del usuario
# y los ordena según su nivel de compatibilidad.
#{'dog': 
#   <Dog: PerroNuevo2 (FEMALE, None) - ID 23>, 
#   'compatibility': 
#   {
#       'excluded': False, 
#       'score': 4, 
#       'max_score': 5, 'activity_compatibility': 'GOOD', 
#       'children_evaluation': 'UNKNOWN', 
#       'dogs_evaluation': None, 
#       'cats_evaluation': 'YES', 
#       'temperament_match': True, 
#       'warnings': ['Se desconoce su compatibilidad con niños.']
#    }
#}
#
def recommend_dogs(preferences):

    # Filtra por perros que tienen el estado de adopción "AVAILABLE"
    available_dogs = Dog.objects.filter(
        adoption_status="AVAILABLE"
    )

    recommendations = []

    # Recorre cada perro del listado de perros
    for dog in available_dogs:

        # Calcula la compatibilidad del perro con el usuario
        compatibility = calculate_compatibility(
            dog,
            preferences
        )

        if compatibility["excluded"] == False:
            recommendations.append({
                "dog": dog,
                "compatibility": compatibility,
            })

    # Se crea una nueva lista ordenada
    sorted_recommendations = sorted(
        recommendations,
        key=lambda recommendation: recommendation["compatibility"]["score"],
        reverse=True
    )

    # Se escogen las tres primeras recomendaciones para devolverlas al usuario, 
    # ya que son las más compatibles con sus preferencias.
    sorted_recommendations_three = sorted_recommendations[:3]

    return sorted_recommendations_three