from rest_framework.test import APITestCase
from rest_framework import status
# Create your tests here.

from adopciones.models import Temperament, User

# TemperamentAPITests: Contiene pruebas unitarias para la API de gestión de temperamentos.
class TemperamentAPITests(APITestCase):
    
    # Comprueba que los temperamentos pueden consultarse
    # sin necesidad de estar autenticado.
    def test_unauthenticated_user_can_view_temperaments(self):

        # Se crea un temperamento de prueba.
        Temperament.objects.create(
            name="Activo"
        )

        # Se consulta la lista de temperamentos sin autenticación.
        response = self.client.get(
            "/adopta_tu_canino/temperamentos/"
        )

        # La consulta debe estar permitida.
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    def test_admin_can_create_temperament(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        # Se autentica al usuario administrador.
        self.client.force_authenticate(user=admin_user)

        # Se crean los datos del temperamento.
        data = {
            "name": "Cariñoso"
        }

        # Se realiza la petición para crear el temperamento.
        response = self.client.post(
            "/adopta_tu_canino/temperamentos/",
            data,
            format="json"
        )

        # La API debe indicar que el temperamento
        # se ha creado correctamente.
        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        # Se comprueba que el temperamento se ha almacenado
        # en la base de datos de prueba.
        self.assertTrue(
            Temperament.objects.filter(name="Cariñoso").exists()
        )

    def test_normal_user_cannot_create_temperament(self):

        # Se crea un usuario normal, sin permisos de administrador.
        user = User.objects.create_user(
            username="usuario_pruebas",
            password="usuario_pruebas",
            is_staff=False
        )

        # Se autentica al usuario.
        self.client.force_authenticate(user=user)

        # Se crean los datos del temperamento que se intentará añadir.
        data = {
            "name": "Cariñoso"
        }

        # El usuario normal intenta crear un temperamento.
        response = self.client.post(
            "/adopta_tu_canino/temperamentos/",
            data,
            format="json"
        )

        # La API debe rechazar la creación de un temperamento
        # al no ser un usuario administrador.
        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

        # Se comprueba que el temperamento no se ha creado.
        self.assertFalse(
            Temperament.objects.filter(name="Cariñoso").exists()
        )

    def test_temperament_cannot_be_deleted(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        # Se autentica al usuario administrador.
        self.client.force_authenticate(user=admin_user)

        # Se crea el temperamento que se intentará eliminar.
        temperament = Temperament.objects.create(
            name="Activo"
        )

        # El administrador intenta eliminar el temperamento.
        response = self.client.delete(
            f"/adopta_tu_canino/temperamentos/{temperament.id}/"
        )

        # La operación DELETE no debe estar permitida.
        self.assertEqual(
            response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED
        )

        # El mensaje de error debe indicar que no se permite eliminar temperamentos.
        self.assertEqual(
            response.data["detail"],
            "No se permite eliminar temperamentos."
        )

        # Se comprueba que el temperamento continúa existiendo.
        self.assertTrue(
            Temperament.objects.filter(id=temperament.id).exists()
        )
