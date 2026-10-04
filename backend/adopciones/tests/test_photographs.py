import tempfile
from rest_framework.test import APITestCase, override_settings
from rest_framework import status
# Create your tests here.

from io import BytesIO

from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile

from adopciones.models import Dog, Photograph, User


# PhotographAPITests: Contiene pruebas unitarias para la API de gestión de fotografías de perros.
class PhotographAPITests(APITestCase):

    # Comprueba que un administrador puede añadir
    # una fotografía a un perro.
    @override_settings(MEDIA_ROOT=tempfile.mkdtemp())
    def test_admin_can_create_photograph(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        # Se autentica al usuario administrador.
        self.client.force_authenticate(user=admin_user)

        # Se crea el perro al que se asociará la fotografía.
        dog = Dog.objects.create(
            name="Perro de prueba",
            has_special_needs=False,
        )

        # Se crea una imagen válida en memoria para realizar la prueba.
        image_file = BytesIO()

        Image.new(
            "RGB",
            (10, 10)
        ).save(
            image_file,
            format="JPEG"
        )

        image_file.seek(0)

        image = SimpleUploadedFile(
            "foto.jpg",
            image_file.read(),
            content_type="image/jpeg"
        )

        # Se crean los datos de la fotografía.
        data = {
            "dog": dog.id,
            "imagen": image,
            "title": "Foto de prueba",
            "description": "Fotografía creada durante una prueba.",
            "is_main": True
        }

        # Se realiza la petición para crear la fotografía.
        response = self.client.post(
            "/adopta_tu_canino/fotografias/",
            data,
            format="multipart"
        )

        # La API debe indicar que la fotografía
        # se ha creado correctamente.
        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        # Se comprueba que la fotografía se ha almacenado
        # en la base de datos de prueba.
        self.assertTrue(
            Photograph.objects.filter(
                dog=dog,
                title="Foto de prueba"
            ).exists()
        )

    # Comprueba que no se pueden añadir más de cinco fotografías a un perro.
    def test_dog_cannot_have_more_than_five_photographs(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        self.client.force_authenticate(user=admin_user)

        # Se crea el perro.
        dog = Dog.objects.create(
            name="Perro de prueba",
            has_special_needs=False
        )

        # Se crean cinco fotografías para el perro.
        for i in range(5):
            Photograph.objects.create(
                dog=dog,
                imagen=f"dogs/photographs/foto{i}.jpg",
                title=f"Foto {i + 1}",
                description="Fotografía de prueba."
            )

        # Se crea una sexta imagen válida.
        image_file = BytesIO()

        Image.new(
            "RGB",
            (10, 10)
        ).save(
            image_file,
            format="JPEG"
        )

        image_file.seek(0)

        image = SimpleUploadedFile(
            "sexta_foto.jpg",
            image_file.read(),
            content_type="image/jpeg"
        )

        # Se intenta añadir una sexta fotografía.
        data = {
            "dog": dog.id,
            "imagen": image,
            "title": "Sexta fotografía",
            "description": "Esta fotografía no debería añadirse.",
            "is_main": False
        }

        response = self.client.post(
            "/adopta_tu_canino/fotografias/",
            data,
            format="multipart"
        )

        # La API debe rechazar la petición, ya que no se permite añadir más de cinco fotografías a un perro.
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertIn(
            "Un perro no puede tener más de 5 fotografías.",
            str(response.data)
        )

        # Se comprueba que siguen existiendo únicamente cinco fotografías.
        self.assertEqual(
            Photograph.objects.filter(dog=dog).count(),
            5
        )


    # Comprueba que un administrador puede eliminar una fotografía de un perro.
    def test_admin_can_delete_photograph(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        # Se autentica al usuario administrador.
        self.client.force_authenticate(user=admin_user)

        # Se crea el perro.
        dog = Dog.objects.create(
            name="Perro de prueba",
            has_special_needs=False
        )

        # Se crea una fotografía asociada al perro.
        photograph = Photograph.objects.create(
            dog=dog,
            imagen="dogs/photographs/foto_prueba.jpg",
            title="Foto de prueba",
            description="Fotografía que será eliminada."
        )

        # Se elimina la fotografía.
        response = self.client.delete(
            f"/adopta_tu_canino/fotografias/{photograph.id}/"
        )

        # La API debe indicar que la eliminación se ha realizado correctamente.
        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT
        )

        # Se comprueba que la fotografía ya no existe.
        self.assertFalse(
            Photograph.objects.filter(id=photograph.id).exists()
        )
