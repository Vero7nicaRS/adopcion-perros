
from adopciones.models import Dog, User, Video
import tempfile
from rest_framework.test import APITestCase, override_settings
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile

# Create your tests here.
class VideoAPITests(APITestCase):

    # Comprueba que un administrador puede añadir
    # un vídeo a un perro.
    @override_settings(MEDIA_ROOT=tempfile.mkdtemp())
    def test_admin_can_create_video(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        # Se autentica al usuario administrador.
        self.client.force_authenticate(user=admin_user)

        # Se crea el perro al que se asociará el vídeo.
        dog = Dog.objects.create(
            name="Perro de prueba",
            has_special_needs=False
        )

        # Se crea un archivo de vídeo de prueba.
        video = SimpleUploadedFile(
            "video_prueba.mp4",
            b"contenido_de_video_de_prueba",
            content_type="video/mp4"
        )

        # Se crean los datos del vídeo.
        data = {
            "dog": dog.id,
            "file": video,
            "title": "Vídeo de prueba",
            "description": "Vídeo creado durante una prueba."
        }

        # Se realiza la petición para crear el vídeo.
        response = self.client.post(
            "/adopta_tu_canino/videos/",
            data,
            format="multipart"
        )

        # La API debe indicar que el vídeo
        # se ha creado correctamente.
        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        # Se comprueba que el vídeo se ha almacenado
        # en la base de datos de prueba.
        self.assertTrue(
            Video.objects.filter(
                dog=dog,
                title="Vídeo de prueba"
            ).exists()
        )


    # Comprueba que un perro no puede tener más de un vídeo.
    def test_dog_cannot_have_more_than_one_video(self):

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

        # Se crea un primer vídeo asociado al perro.
        Video.objects.create(
            dog=dog,
            file="dogs/videos/video_prueba.mp4",
            title="Primer vídeo",
            description="Primer vídeo de prueba."
        )

        # Se crea un segundo archivo de vídeo de prueba.
        second_video = SimpleUploadedFile(
            "segundo_video.mp4",
            b"contenido_del_segundo_video",
            content_type="video/mp4"
        )

        data = {
            "dog": dog.id,
            "file": second_video,
            "title": "Segundo vídeo",
            "description": "Este vídeo no debería añadirse."
        }

        # Se intenta añadir un segundo vídeo al mismo perro.
        response = self.client.post(
            "/adopta_tu_canino/videos/",
            data,
            format="multipart"
        )

        # La API debe rechazar la petición.
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        # Se comprueba que se devuelve el mensaje esperado.
        self.assertIn(
            "Un perro solo puede tener un vídeo.",
            str(response.data)
        )

        # Se comprueba que el perro continúa teniendo un único vídeo.
        self.assertEqual(
            Video.objects.filter(dog=dog).count(),
            1
        )


    # Comprueba que un administrador puede eliminar un vídeo.
    def test_admin_can_delete_video(self):

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

        # Se crea un vídeo asociado al perro.
        video = Video.objects.create(
            dog=dog,
            file="dogs/videos/video_prueba.mp4",
            title="Vídeo de prueba",
            description="Vídeo que será eliminado."
        )

        # Se elimina el vídeo.
        response = self.client.delete(
            f"/adopta_tu_canino/videos/{video.id}/"
        )

        # La API debe indicar que la eliminación
        # se ha realizado correctamente.
        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT
        )

        # Se comprueba que el vídeo ya no existe.
        self.assertFalse(
            Video.objects.filter(id=video.id).exists()
        )