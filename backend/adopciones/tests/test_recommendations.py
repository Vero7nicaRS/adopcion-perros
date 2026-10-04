from django.test import TestCase
from adopciones.models import Dog, Temperament
from adopciones.recommendation import calculate_compatibility, get_activity_compatibility, get_activity_level, recommend_dogs
# Create your tests here.

# RecomendationTests: Contiene pruebas unitarias para la funcionalidad de recomendación de perros.
class RecommendationTests(TestCase):

# test_no_recommendations_when_all_dogs_are_incompatible: Dado un usuario que convive con niños, perros y gatos, 
# y un conjunto controlado de perros disponibles en el que
# cada animal presenta al menos una incompatibilidad excluyente con alguna de esas condiciones,
# el sistema no devuelve ninguna recomendación.
    def test_no_recommendations_when_all_dogs_are_incompatible(self):

        # Se crea un perro con compatibilidad de niños "NO", 
        # compatibilidad con perros "YES" 
        # y compatibilidad con gatos "YES"
        Dog.objects.create(
            name="Perro incompatible con niños",
            children_compatibility="NO",
            dog_compatibility="YES",
            cat_compatibility="YES",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )

        # Se crea un perro con compatibilidad de niños "YES", 
        # compatibilidad con perros "NO" 
        # y compatibilidad con gatos "YES"  
        Dog.objects.create(
            name="Perro incompatible con perros",
            children_compatibility="YES",
            dog_compatibility="NO",
            cat_compatibility="YES",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )

        # Se crea un perro con compatibilidad de niños "YES", 
        # compatibilidad con perros "YES" 
        # y compatibilidad con gatos "NO"
        Dog.objects.create(
            name="Perro incompatible con gatos",
            children_compatibility="YES",
            dog_compatibility="YES",
            cat_compatibility="NO",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )

        # Preferencias que se habrían obtenido de un usuario que tiene niños, perros y gatos.
        # Además, el nivel de actividad del usuario es "MEDIUM" 
        # y no tiene ninguna preferencia de temperamento.
        preferences = {
            "human_activity_level": "MEDIUM",
            "has_children": True,
            "has_dogs": True,
            "has_cats": True,
            "preferred_temperament": []
        }

        # Obtiene las recomendaciones de perros según las preferencias del usuario.
        recommendations = recommend_dogs(preferences)

        # Se espera que no haya perros compatibles con las preferencias del usuario.
        self.assertEqual(recommendations, [])

# test_only_available_dogs_are_recommended:
# Dado un conjunto de perros con diferentes estados de adopción,
# el sistema únicamente tiene en cuenta para las recomendaciones
# aquellos cuyo estado es "AVAILABLE" y no "ADOPTED" o "UNAVAILABLE"
    def test_only_available_dogs_are_recommended(self):

        # Se crea un perro disponible.
        available_dog = Dog.objects.create(
            name="Perro disponible",
            children_compatibility="YES",
            dog_compatibility="YES",
            cat_compatibility="YES",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )

        # Se crea un perro que ya ha sido adoptado.
        Dog.objects.create(
            name="Perro adoptado",
            children_compatibility="YES",
            dog_compatibility="YES",
            cat_compatibility="YES",
            adoption_status="ADOPTED",
            has_special_needs=False
        )

        # Se crea un perro que no se encuentra disponible para adopción.
        Dog.objects.create(
            name="Perro no disponible",
            children_compatibility="YES",
            dog_compatibility="YES",
            cat_compatibility="YES",
            adoption_status="UNAVAILABLE",
            has_special_needs=False
        )

        # Preferencias de un usuario que no convive con niños,
        # perros ni gatos y que no tiene preferencia de temperamento.
        preferences = {
            "human_activity_level": "MEDIUM",
            "has_children": False,
            "has_dogs": False,
            "has_cats": False,
            "preferred_temperament": []
        }

        # Obtiene las recomendaciones de perros según las preferencias del usuario.
        recommendations = recommend_dogs(preferences)

        # Se espera que únicamente se recomiende a un perro que es el perro disponible, 
        # ya que el sistema debe recomendar a los perros que estén disponibles
        # y no a los adoptados o no disponibles.
        self.assertEqual(len(recommendations), 1)
        self.assertEqual(recommendations[0]["dog"], available_dog)


# test_get_activity_level:
# Comprueba que el nivel de actividad de un perro se determina
# correctamente a partir de sus temperamentos.
    def test_get_activity_level(self):

        # Se definen distintos temperamentos.
        energetic = Temperament.objects.create(name="Enérgico")
        active = Temperament.objects.create(name="Activo")
        calm = Temperament.objects.create(name="Tranquilo")
        affectionate = Temperament.objects.create(name="Cariñoso")

        # Se crea un perro con el temperamento "Enérgico".
        high_dog = Dog.objects.create(
            name="Perro actividad alta",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )
        high_dog.temperament.add(energetic)

        # Se crea un perro con el temperamento "Activo".
        medium_dog = Dog.objects.create(
            name="Perro actividad media",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )
        medium_dog.temperament.add(active)

        # Se crea un perro con el temperamento "Tranquilo".
        low_dog = Dog.objects.create(
            name="Perro actividad baja",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )
        low_dog.temperament.add(calm)

        # Se crea un perro con el temperamento "Cariñoso".
        unknown_dog = Dog.objects.create(
            name="Perro actividad desconocida",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )
        unknown_dog.temperament.add(affectionate)

        # Se comprueba que el temperamento "Enérgico" 
        # se corresponda con un nivel de actividad "HIGH".
        self.assertEqual(get_activity_level(high_dog), "HIGH")

        # Se comprueba que el temperamento "Activo" 
        # se corresponda con un nivel de actividad "MEDIUM".
        self.assertEqual(get_activity_level(medium_dog), "MEDIUM")

        # Se comprueba que el temperamento "Tranquilo" 
        # se corresponda con un nivel de actividad "LOW".
        self.assertEqual(get_activity_level(low_dog), "LOW")

        # Se comprueba que el temperamento "Cariñoso" 
        # se corresponda con un nivel de actividad "UNKNOW".
        self.assertEqual(get_activity_level(unknown_dog), "UNKNOWN")


# test_activity_level_priority:
# Comprueba la prioridad establecida entre los niveles de actividad
# cuando un perro presenta temperamentos asociados a distintos niveles.
# El comportamiento actual tiene como orden de prioridad para definir
# el nivel de actividad como: HIGH --> MEDIUM --> LOW
    def test_activity_level_priority(self):

        # Se definen distintos temperamentos.
        energetic = Temperament.objects.create(name="Enérgico")
        active = Temperament.objects.create(name="Activo")
        calm = Temperament.objects.create(name="Tranquilo")

        # Se crea un perro que tenga todos los temperamentos definidos.
        dog = Dog.objects.create(
            name="Perro con distintos niveles de actividad",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )

        dog.temperament.add(energetic, active, calm)

        # Al tener el temperamento "Enérgico", el nivel de actividad
        # debe ser HIGH, aunque también tenga "Activo" y "Tranquilo".
        # Ya que el orden de prioridad es: "HIGH", "MEDIUM" y "LOW".
        self.assertEqual(get_activity_level(dog), "HIGH")


# test_get_activity_compatibility:
# Comprueba que la compatibilidad entre el nivel de actividad
# del usuario y el del perro se determina correctamente.
    def test_get_activity_compatibility(self):

        # Se definen distintos temperamentos.
        energetic = Temperament.objects.create(name="Enérgico")
        active = Temperament.objects.create(name="Activo")
        calm = Temperament.objects.create(name="Tranquilo")
        affectionate = Temperament.objects.create(name="Cariñoso")

        # Se crea un perro con el temperamento "Enérgico".
        high_dog = Dog.objects.create(
            name="Perro actividad alta",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )
        high_dog.temperament.add(energetic)

        # Se crea un perro con el temperamento "Activo".
        medium_dog = Dog.objects.create(
            name="Perro actividad media",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )
        medium_dog.temperament.add(active)

        # Se crea un perro con el temperamento "Tranquilo".
        low_dog = Dog.objects.create(
            name="Perro actividad baja",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )
        low_dog.temperament.add(calm)

        # Se crea un perro con el temperamento "Cariñoso".
        unknown_dog = Dog.objects.create(
            name="Perro actividad desconocida",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )
        unknown_dog.temperament.add(affectionate)

        # Se comprueba la compatibilidad de la actividad que le puede ofrecer 
        # el usuario al perro.
        # - Un usuario con actividad alta (HIGH) es compatible
        # con perros de cualquier nivel de actividad conocido (HIGH, MEDIUM y LOW).
        self.assertEqual(
            get_activity_compatibility(high_dog, "HIGH"),
            "GOOD"
        )
        self.assertEqual(
            get_activity_compatibility(medium_dog, "HIGH"),
            "GOOD"
        )
        self.assertEqual(
            get_activity_compatibility(low_dog, "HIGH"),
            "GOOD"
        )

        # - Un usuario con actividad media (MEDIUM) es compatible con perros
        # de actividad media o baja, pero no con los de actividad alta (MEDIUM y LOW).
        # Si el perro tiene una actividad alta, la compatibilidad es "LOWER",
        # por lo que no obtiene el punto correspondiente a la actividad.
        self.assertEqual(
            get_activity_compatibility(medium_dog, "MEDIUM"),
            "GOOD"
        )
        self.assertEqual(
            get_activity_compatibility(low_dog, "MEDIUM"),
            "GOOD"
        )
        self.assertEqual(
            get_activity_compatibility(high_dog, "MEDIUM"),
            "LOWER"
        )

        # - Un usuario con actividad baja (LOW) únicamente es compatible
        # con perros de actividad baja (LOW).
        # Si el perro tiene una actividad alta o media, la compatibilidad es "LOWER",
        # por lo que no obtiene el punto correspondiente a la actividad.
        self.assertEqual(
            get_activity_compatibility(low_dog, "LOW"),
            "GOOD"
        )
        self.assertEqual(
            get_activity_compatibility(medium_dog, "LOW"),
            "LOWER"
        )
        self.assertEqual(
            get_activity_compatibility(high_dog, "LOW"),
            "LOWER"
        )

        # - Si no puede determinarse la actividad del perro,
        # la compatibilidad de actividad también es desconocida.
        self.assertEqual(
            get_activity_compatibility(unknown_dog, "MEDIUM"),
            "UNKNOWN"
        )    


# test_calculate_compatibility_max_score:
# Comprueba que un perro completamente compatible con las preferencias
# del usuario obtiene la puntuación máxima posible.
    def test_calculate_compatibility_max_score(self):

        # Se definen los temperamentos.
        active = Temperament.objects.create(name="Activo")
        affectionate = Temperament.objects.create(name="Cariñoso")

        # Se crea un perro que sea compatible con niños, perros y gatos.
        # Además, se le añaden los temperamentos definidos.
        dog = Dog.objects.create(
            name="Perro completamente compatible",
            children_compatibility="YES",
            dog_compatibility="YES",
            cat_compatibility="YES",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )

        dog.temperament.add(active, affectionate)

        # El usuario tiene un nivel de actividad medio, convive con niños,
        # perros y gatos, y prefiere perros cariñosos.
        preferences = {
            "human_activity_level": "MEDIUM",
            "has_children": True,
            "has_dogs": True,
            "has_cats": True,
            "preferred_temperament": ["Cariñoso"]
        }

        compatibility = calculate_compatibility(dog, preferences)

        # El perro no debe ser excluido.
        self.assertFalse(compatibility["excluded"])

        # Obtiene un punto por cada criterio:
        # actividad + niños + perros + gatos + temperamento.
        # Debe obtener la máxima puntuación posible, que es 5.
        # Ya que el usuario tiene las 3 compatibilidades, el nivel de actividad y
        # además el perro tiene el temperamento que prefiere.
        self.assertEqual(compatibility["score"], 5)
        self.assertEqual(compatibility["max_score"], 5)

        # Las evaluaciones deben reflejar la compatibilidad del perro.
        self.assertEqual(compatibility["activity_compatibility"], "GOOD")
        self.assertEqual(compatibility["children_evaluation"], "YES")
        self.assertEqual(compatibility["dogs_evaluation"], "YES")
        self.assertEqual(compatibility["cats_evaluation"], "YES")
        self.assertTrue(compatibility["temperament_match"])

        # Al conocerse todas las compatibilidades, no debe generarse
        # ninguna advertencia.
        self.assertEqual(compatibility["warnings"], [])


# test_unknown_compatibilities:
# Comprueba que los valores de compatibilidad desconocidos no excluyen
# al perro, pero no suman puntuación y generan las advertencias correspondientes.
    def test_unknown_compatibilities(self):

        # Se define un temperamento.
        affectionate = Temperament.objects.create(name="Cariñoso")

        # Se crea un perro con todas las compatibilidades desconocidas 
        # y con el temperamento definido (Cariñoso).
        dog = Dog.objects.create(
            name="Perro con compatibilidades desconocidas",
            children_compatibility="UNKNOWN",
            dog_compatibility="UNKNOWN",
            cat_compatibility="UNKNOWN",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )

        dog.temperament.add(affectionate)

        # El usuario convive con niños, perros y gatos.
        # No se establece ninguna preferencia de temperamento.
        preferences = {
            "human_activity_level": "MEDIUM",
            "has_children": True,
            "has_dogs": True,
            "has_cats": True,
            "preferred_temperament": []
        }

        compatibility = calculate_compatibility(dog, preferences)

        # Los valores "UNKNOWN" no provocan la exclusión del perro.
        self.assertFalse(compatibility["excluded"])

        # El perro no obtiene ningún punto, ya que se desconocen sus
        # compatibilidades y no puede determinarse su nivel de actividad.
        self.assertEqual(compatibility["score"], 0)

        # La puntuación máxima posible es 4:
        # actividad + niños + perros + gatos.
        # Ya que el usuario tiene las 3 compatibilidades, pero no indica
        # ninguna preferencia de temperamento.
        self.assertEqual(compatibility["max_score"], 4)

        # Las evaluaciones deben reflejar que las compatibilidades
        # con niños, perros y gatos son desconocidas.
        self.assertEqual(compatibility["activity_compatibility"], "UNKNOWN")
        self.assertEqual(compatibility["children_evaluation"], "UNKNOWN")
        self.assertEqual(compatibility["dogs_evaluation"], "UNKNOWN")
        self.assertEqual(compatibility["cats_evaluation"], "UNKNOWN")

        # Deben generarse cuatro advertencias:
        # una por la actividad y una por cada compatibilidad desconocida.
        self.assertEqual(len(compatibility["warnings"]), 4)
        self.assertIn(
            "No se ha podido determinar el nivel de actividad del perro.",
            compatibility["warnings"]
        )
        self.assertIn(
            "Se desconoce su compatibilidad con niños.",
            compatibility["warnings"]
        )
        self.assertIn(
            "Se desconoce su compatibilidad con otros perros.",
            compatibility["warnings"]
        )
        self.assertIn(
            "Se desconoce su compatibilidad con gatos.",
            compatibility["warnings"]
        )

# test_recommendations_are_sorted_and_limited_to_three:
# Comprueba que las recomendaciones se ordenan de mayor a menor
# puntuación y que se devuelven como máximo tres perros.
    def test_recommendations_are_sorted_and_limited_to_three(self):

        # Se define un temperamento.
        active = Temperament.objects.create(name="Activo")

        # Se crean cuatro perros con diferentes compatibilidades 
        # y con el mismo temperamento (Activo).

        # El perro primero tiene compatibilidad con niños, perros y gatos, 
        # por lo que obtiene la puntuación máxima (primer puesto).
        dog_1 = Dog.objects.create(
            name="Perro puntuación 4",
            children_compatibility="YES",
            dog_compatibility="YES",
            cat_compatibility="YES",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )
        dog_1.temperament.add(active)

        # El segundo perro tiene compatibilidad con niños y perros, 
        # pero compatibilidad desconocida con gatos, por lo que obtiene una puntuación menor
        # (segundo puesto).
        dog_2 = Dog.objects.create(
            name="Perro puntuación 3",
            children_compatibility="YES",
            dog_compatibility="YES",
            cat_compatibility="UNKNOWN",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )
        dog_2.temperament.add(active)

        # El tercer perro tiene compatibilidad con niños, 
        # pero compatibilidad desconocida con perros y gatos,
        # por lo que obtiene una puntuación aún menor (tercer puesto).
        dog_3 = Dog.objects.create(
            name="Perro puntuación 2",
            children_compatibility="YES",
            dog_compatibility="UNKNOWN",
            cat_compatibility="UNKNOWN",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )
        dog_3.temperament.add(active)
    
        # El cuarto perro tiene compatibilidad desconocida con todos los animales,
        # por lo que obtiene la puntuación más baja (no aparece en las recomendaciones).
        dog_4 = Dog.objects.create(
            name="Perro puntuación 1",
            children_compatibility="UNKNOWN",
            dog_compatibility="UNKNOWN",
            cat_compatibility="UNKNOWN",
            adoption_status="AVAILABLE",
            has_special_needs=False
        )
        dog_4.temperament.add(active)

        # Preferencias de un usuario que convive con niños, perros y gatos,
        # que puede ofrecerle al perro un nivel de actividad medio y
        # que no tiene ninguna preferencia de temperamento.
        preferences = {
            "human_activity_level": "MEDIUM",
            "has_children": True,
            "has_dogs": True,
            "has_cats": True,
            "preferred_temperament": []
        }

        recommendations = recommend_dogs(preferences)

        # El sistema debe devolver como máximo tres recomendaciones.
        self.assertEqual(len(recommendations), 3)

        # Las recomendaciones deben estar ordenadas de mayor
        # a menor puntuación.
        self.assertEqual(
            [recommendation["compatibility"]["score"] for recommendation in recommendations],
            [4, 3, 2]
        )

        # Los tres perros con mayor puntuación deben ser los recomendados.
        self.assertEqual(recommendations[0]["dog"], dog_1)
        self.assertEqual(recommendations[1]["dog"], dog_2)
        self.assertEqual(recommendations[2]["dog"], dog_3)

        # El perro con menor puntuación no debe encontrarse
        # entre las tres recomendaciones.
        # Se crea una lista con los perros recomendados para comprobar que 
        # el perro con menor puntuación no se encuentra entre ellos.
        recommended_dogs = [
            recommendation["dog"] for recommendation in recommendations
        ]

        self.assertNotIn(dog_4, recommended_dogs)
