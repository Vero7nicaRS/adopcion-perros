
from adopciones.models import Dog, Temperament, User

from rest_framework.test import APITestCase
from rest_framework import status

# DogAPITests: Contiene pruebas unitarias para la API de gestión de perros.
class DogAPITests(APITestCase):

    # test_create_dog:
    # Comprueba que se puede crear correctamente un perro
    # mediante la API cuando se proporcionan datos válidos.
    def test_create_dog(self):

        # Se crea un usuario administrador para agregar un perro.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        # Se autentica al usuario administrador.
        self.client.force_authenticate(user=admin_user)

        # Se crea un temperamento que se asociará al perro.
        temperament = Temperament.objects.create(
            name="Activo"
        )

        # Se crean los datos del perro que se enviarán a la API.
        data = {
            "name": "Perro de prueba",
            "estimated_age": 3,
            "estimated_age_unit": "YEARS",
            "sex": "MALE",
            "size": "MEDIUM",
            "breed": "Mestizo",
            "temperament_ids": [temperament.id],
            "description": "Perro creado durante una prueba.",
            "dog_compatibility": "YES",
            "cat_compatibility": "UNKNOWN",
            "children_compatibility": "YES",
            "has_special_needs": False,
            "special_needs_description": "",
            "is_sterilized": True,
            "is_vaccinated": True,
            "looking_for_home_since": "2026-01-01",
            "adoption_status": "AVAILABLE"
        }

        # Se realiza la petición para crear el perro.
        response = self.client.post(
            "/adopta_tu_canino/perros/",
            data,
            format="json"
        )

        # La API debe indicar que el perro se ha creado correctamente.
        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        # Se comprueba que el perro se ha almacenado
        # en la base de datos de prueba.
        self.assertTrue(
            Dog.objects.filter(name="Perro de prueba").exists()
        )

        # Se obtiene el perro creado para comprobar sus datos.
        dog = Dog.objects.get(name="Perro de prueba")

        # - El perro debe tener el estado de adopción "AVAILABLE".
        self.assertEqual(dog.adoption_status, "AVAILABLE")
        
        # - Debe tener un temperamento asociado.
        self.assertEqual(dog.temperament.count(), 1)
        self.assertEqual(
            dog.temperament.first(),
            temperament
        )

    def test_normal_user_cannot_create_dog(self):

        # Se crea un usuario normal, sin permisos de administrador.
        user = User.objects.create_user(
            username="usuario_pruebas",
            password="usuario_pruebas",
            is_staff=False
        )

        # Se autentica al usuario.
        self.client.force_authenticate(user=user)

        # Se crea un temperamento para los datos del perro.
        temperament = Temperament.objects.create(
            name="Activo"
        )

        # Se crean los datos del perro que se intentará añadir.
        data = {
            "name": "Perro no permitido",
            "estimated_age": 3,
            "estimated_age_unit": "YEARS",
            "sex": "MALE",
            "size": "MEDIUM",
            "breed": "Mestizo",
            "temperament_ids": [temperament.id],
            "description": "Perro creado durante una prueba.",
            "dog_compatibility": "YES",
            "cat_compatibility": "UNKNOWN",
            "children_compatibility": "YES",
            "has_special_needs": False,
            "special_needs_description": "",
            "is_sterilized": True,
            "is_vaccinated": True,
            "looking_for_home_since": "2026-01-01",
            "adoption_status": "AVAILABLE"
        }

        # El usuario normal intenta crear un perro.
        response = self.client.post(
            "/adopta_tu_canino/perros/",
            data,
            format="json"
        )

        # La API rechaza la petición con un código 403 Forbidden, 
        # ya que el usuario no tiene permisos de administrador.
        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

        # Se comprueba que el perro no se ha creado en la base de datos.
        self.assertFalse(
            Dog.objects.filter(name="Perro no permitido").exists()
        )
    

    def test_admin_can_update_dog(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        # Se autentica al usuario administrador.
        self.client.force_authenticate(user=admin_user)

        # Se crea un perro que posteriormente será modificado.
        dog = Dog.objects.create(
            name="Perro original",
            estimated_age=3,
            estimated_age_unit="YEARS",
            sex="MALE",
            size="MEDIUM",
            breed="Mestizo",
            description="Descripción original",
            dog_compatibility="YES",
            cat_compatibility="UNKNOWN",
            children_compatibility="YES",
            has_special_needs=False,
            special_needs_description="",
            is_sterilized=True,
            is_vaccinated=True,
            looking_for_home_since="2026-01-01",
            adoption_status="AVAILABLE"
        )

        # Se indican únicamente los campos que se quieren modificar.
        data = {
            "name": "Perro modificado",
            "description": "Descripción modificada"
        }

        # Se realiza la petición PATCH.
        response = self.client.patch(
            f"/adopta_tu_canino/perros/{dog.id}/",
            data,
            format="json"
        )

        # La API debe indicar que la modificación se ha realizado correctamente.
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        # Se actualiza el objeto con los datos almacenados en la base de datos.
        dog.refresh_from_db()

        # Se comprueba que los campos han sido modificados.
        self.assertEqual(
            dog.name,
            "Perro modificado"
        )

        self.assertEqual(
            dog.description,
            "Descripción modificada"
        )


    def test_normal_user_cannot_update_dog(self):

        # Se crea un usuario normal, sin permisos de administrador.
        user = User.objects.create_user(
            username="usuario_pruebas",
            password="usuario_pruebas",
            is_staff=False
        )

        # Se autentica al usuario.
        self.client.force_authenticate(user=user)

        # Se crea el perro que se intentará modificar.
        dog = Dog.objects.create(
            name="Perro original",
            estimated_age=3,
            estimated_age_unit="YEARS",
            sex="MALE",
            size="MEDIUM",
            breed="Mestizo",
            description="Descripción original",
            dog_compatibility="YES",
            cat_compatibility="UNKNOWN",
            children_compatibility="YES",
            has_special_needs=False,
            special_needs_description="",
            is_sterilized=True,
            is_vaccinated=True,
            looking_for_home_since="2026-01-01",
            adoption_status="AVAILABLE"
        )

        # El usuario normal intenta modificar el perro.
        data = {
            "name": "Perro modificado"
        }

        response = self.client.patch(
            f"/adopta_tu_canino/perros/{dog.id}/",
            data,
            format="json"
        )

        # La API debe denegar la modificación.
        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

        # Se vuelven a obtener los datos del perro desde la base de datos.
        dog.refresh_from_db()

        # Se comprueba que el perro no ha sido modificado.
        self.assertEqual(
            dog.name,
            "Perro original"
        )    


    def test_unauthenticated_user_can_view_dogs(self):

        # Se crea un perro para comprobar que puede ser consultado.
        Dog.objects.create(
            name="Perro de prueba",
            estimated_age=3,
            estimated_age_unit="YEARS",
            sex="MALE",
            size="MEDIUM",
            breed="Mestizo",
            description="Descripción de prueba",
            dog_compatibility="YES",
            cat_compatibility="UNKNOWN",
            children_compatibility="YES",
            has_special_needs=False,
            special_needs_description="",
            is_sterilized=True,
            is_vaccinated=True,
            looking_for_home_since="2026-01-01",
            adoption_status="AVAILABLE"
        )

        # Se consulta la lista de perros sin estar autenticado.
        response = self.client.get(
            "/adopta_tu_canino/perros/"
        )

        # La consulta debe estar permitida.
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )


    def test_dog_cannot_be_deleted(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        # Se autentica al usuario administrador.
        self.client.force_authenticate(user=admin_user)

        # Se crea el perro que se intentará eliminar.
        dog = Dog.objects.create(
            name="Perro de prueba",
            estimated_age=3,
            estimated_age_unit="YEARS",
            sex="MALE",
            size="MEDIUM",
            breed="Mestizo",
            description="Descripción de prueba",
            dog_compatibility="YES",
            cat_compatibility="UNKNOWN",
            children_compatibility="YES",
            has_special_needs=False,
            special_needs_description="",
            is_sterilized=True,
            is_vaccinated=True,
            looking_for_home_since="2026-01-01",
            adoption_status="AVAILABLE"
        )

        # Se intenta eliminar el perro.
        response = self.client.delete(
            f"/adopta_tu_canino/perros/{dog.id}/"
        )

        # La operación DELETE no debe estar permitida.
        self.assertEqual(
            response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED
        )

        # El mensaje de error debe indicar que no se permite eliminar perros.
        self.assertEqual(
            response.data["detail"],
            "No se permite eliminar perros."
        )

        # Se comprueba que el perro continúa existiendo.
        self.assertTrue(
            Dog.objects.filter(id=dog.id).exists()
        )