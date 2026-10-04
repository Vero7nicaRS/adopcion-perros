from rest_framework.test import APITestCase
from rest_framework import status

from adopciones.models import Location, User

# Create your tests here.
class LocationAPITests(APITestCase):

    # Comprueba que cualquier usuario puede consultar
    # las ubicaciones sin necesidad de autenticarse.
    def test_unauthenticated_user_can_view_locations(self):

        # Se crea una ubicación.
        Location.objects.create(
            name="Refugio de prueba",
            locality="Málaga",
            province="Málaga",
            latitude=36.7213,
            longitude=-4.4214
        )

        # Se consultan las ubicaciones sin autenticar al usuario.
        response = self.client.get(
            "/adopta_tu_canino/ubicaciones/"
        )

        # La consulta debe realizarse correctamente.
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        # Debe aparecer la ubicación creada.
        self.assertEqual(
            len(response.data),
            1
        )

        self.assertEqual(
            response.data[0]["name"],
            "Refugio de prueba"
        )

    # Comprueba que un usuario normal no puede crear ubicaciones.
    def test_normal_user_cannot_create_location(self):

        # Se crea un usuario normal.
        user = User.objects.create_user(
            username="usuario_pruebas",
            password="usuario_pruebas",
            is_staff=False
        )

        # Se autentica al usuario.
        self.client.force_authenticate(user=user)

        # Se preparan los datos de una nueva ubicación.
        data = {
            "name": "Refugio de prueba",
            "locality": "Málaga",
            "province": "Málaga",
            "latitude": 36.7213,
            "longitude": -4.4214
        }

        # El usuario intenta crear una ubicación.
        response = self.client.post(
            "/adopta_tu_canino/ubicaciones/",
            data,
            format="json"
        )

        # La API debe impedir la creación de una ubicación.
        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

        # Se comprueba que la ubicación no se ha creado.
        self.assertFalse(
            Location.objects.filter(
                name="Refugio de prueba"
            ).exists()
        )

    # Comprueba que un administrador puede crear una ubicación.
    def test_admin_can_create_location(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        # Se autentica al administrador.
        self.client.force_authenticate(user=admin_user)

        # Se preparan los datos de la ubicación.
        data = {
            "name": "Refugio de prueba",
            "locality": "Málaga",
            "province": "Málaga",
            "latitude": 36.7213,
            "longitude": -4.4214
        }

        # El administrador crea una ubicación.
        response = self.client.post(
            "/adopta_tu_canino/ubicaciones/",
            data,
            format="json"
        )

        # La ubicación debe crearse correctamente.
        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        # Se comprueba que la ubicación existe
        # en la base de datos.
        self.assertTrue(
            Location.objects.filter(
                name="Refugio de prueba"
            ).exists()
        )

    # Comprueba que no se puede crear una ubicación
    # con una latitud fuera del rango permitido.
    def test_location_invalid_latitude(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        self.client.force_authenticate(user=admin_user)

        # Se preparan los datos de la ubicación con latitud inválida.
        data = {
            "name": "Ubicación de prueba",
            "locality": "Málaga",
            "province": "Málaga",
            "latitude": 100, # Latitud fuera del rango [-90, 90].
            "longitude": -4.4214
        }

        # Se intenta crear la ubicación con latitud inválida.
        response = self.client.post(
            "/adopta_tu_canino/ubicaciones/",
            data,
            format="json"
        )

        # La API debe rechazar la creación de la ubicación, 
        # ya que la latitud no es válida.
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        # Devuelve un mensaje de error indicando que la latitud debe estar entre -90 y 90.
        self.assertIn(
            "La latitude debe estar entre -90 y 90.",
            str(response.data)
        )

        # Se comprueba que la ubicación no se ha creado en la base de datos.
        self.assertFalse(
            Location.objects.filter(
                name="Ubicación de prueba"
            ).exists()
        )

    # Comprueba que no se puede crear una ubicación
    # con una longitud fuera del rango permitido.
    def test_location_invalid_longitude(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        self.client.force_authenticate(user=admin_user)

        # Se preparan los datos de la ubicación con longitud inválida.
        data = {
            "name": "Ubicación de prueba",
            "locality": "Málaga",
            "province": "Málaga",
            "latitude": 36.7213, 
            "longitude": 200 # Longitud fuera del rango [-180, 180].
        }

        # Se intenta crear la ubicación con longitud inválida.
        response = self.client.post(
            "/adopta_tu_canino/ubicaciones/",
            data,
            format="json"
        )

        # La API debe rechazar la creación de la ubicación,
        # ya que la longitud no es válida.
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        # Se comprueba que el mensaje de error indica que la longitud debe estar entre -180 y 180.
        self.assertIn(
            "La longitude debe estar entre -180 y 180.",
            str(response.data)
        )

        # Se comprueba que la ubicación no se ha creado en la base de datos.
        self.assertFalse(
            Location.objects.filter(
                name="Ubicación de prueba"
            ).exists()
        )

    # Comprueba que no se puede indicar la longitud
    # sin indicar también la latitud.
    def test_location_cannot_have_longitude_without_latitude(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        self.client.force_authenticate(user=admin_user)

        # Se preparan los datos de la ubicación con longitud pero sin latitud.
        data = {
            "name": "Ubicación de prueba",
            "locality": "Málaga",
            "province": "Málaga",
            "longitude": -4.4214 # Está indicando la longitud pero no la latitud.
        }

        # Se intenta crear la ubicación con longitud pero sin latitud.
        response = self.client.post(
            "/adopta_tu_canino/ubicaciones/",
            data,
            format="json"
        )

        # La API debe rechazar la creación de la ubicación,
        # ya que no se puede indicar la longitud sin la latitud.
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        # Se comprueba que el mensaje de error indica que se debe indicar la latitud también.
        self.assertIn(
            "Debes indicar la latitude también.",
            str(response.data)
        )

        # Se comprueba que la ubicación no se ha creado en la base de datos.
        self.assertFalse(
            Location.objects.filter(
                name="Ubicación de prueba"
            ).exists()
        )


    # Comprueba que no se puede indicar la latitud
    # sin indicar también la longitud.
    def test_location_cannot_have_latitude_without_longitude(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        self.client.force_authenticate(user=admin_user)

        # Se preparan los datos de la ubicación con latitud pero sin longitud.
        data = {
            "name": "Ubicación de prueba",
            "locality": "Málaga",
            "province": "Málaga",
            "latitude": 36.7213  # Está indicando la latitud pero no la longitud.
        }

        # Se intenta crear la ubicación con latitud pero sin longitud.
        response = self.client.post(
            "/adopta_tu_canino/ubicaciones/",
            data,
            format="json"
        )

        # La API debe rechazar la creación de la ubicación,
        # ya que no se puede indicar la latitud sin la longitud.
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        # Se comprueba que el mensaje de error indica
        # que se debe indicar la longitud también.
        self.assertIn(
            "Debes indicar la longitude también.",
            str(response.data)
        )

        # Se comprueba que la ubicación no se ha creado en la base de datos.
        self.assertFalse(
            Location.objects.filter(
                name="Ubicación de prueba"
            ).exists()
        )
    
    # Comprueba que no se pueden eliminar ubicaciones.
    def test_location_cannot_be_deleted(self):
        
        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        self.client.force_authenticate(user=admin_user)

        # Se crea una ubicación.
        location = Location.objects.create(
            name="Ubicación de prueba",
            locality="Málaga",
            province="Málaga",
            latitude=36.7213,
            longitude=-4.4214
        )

        # Se intenta eliminar la ubicación.
        response = self.client.delete(
            f"/adopta_tu_canino/ubicaciones/{location.id}/"
        )

        # La API debe indicar que la operación no está permitida.
        self.assertEqual(
            response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED
        )

        # Se comprueba el mensaje devuelto.
        self.assertEqual(
            response.data["detail"],
            "No se permite eliminar ubicaciones."
        )

        # Se comprueba que la ubicación continúa existiendo en la base de datos.
        self.assertTrue(
            Location.objects.filter(
                id=location.id
            ).exists()
        )