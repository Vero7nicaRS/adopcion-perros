from rest_framework.test import APITestCase
from rest_framework import status

from adopciones.models import AdoptionApplication, Dog, User


# Create your tests here.
class AdoptionApplicationAPITests(APITestCase):

    # Comprueba que un usuario solo puede consultar
    # sus propias solicitudes de adopción.
    def test_user_can_only_view_own_applications(self):

        # Se crean dos usuarios.
        user1 = User.objects.create_user(
            username="usuario1",
            password="usuario1"
        )

        user2 = User.objects.create_user(
            username="usuario2",
            password="usuario2"
        )

        # Se crean dos perros.
        dog1 = Dog.objects.create(
            name="Perro 1",
            has_special_needs=False
        )

        dog2 = Dog.objects.create(
            name="Perro 2",
            has_special_needs=False
        )

        # Se crea una solicitud para cada usuario.
        application1 = AdoptionApplication.objects.create(
            user=user1,
            dog=dog1,
            comment="Solicitud del usuario 1"
        )

        AdoptionApplication.objects.create(
            user=user2,
            dog=dog2,
            comment="Solicitud del usuario 2"
        )

        # Se autentica el primer usuario.
        self.client.force_authenticate(user=user1)

        # Se consultan las solicitudes.
        response = self.client.get(
            "/adopta_tu_canino/solicitud-adopcion/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        # El usuario únicamente debe recibir su solicitud.
        self.assertEqual(
            len(response.data),
            1
        )

        self.assertEqual(
            response.data[0]["id"],
            application1.id
        )



    # Comprueba que un administrador puede consultar
    # todas las solicitudes de adopción.
    def test_admin_can_view_all_applications(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        # Se crean dos usuarios.
        user1 = User.objects.create_user(
            username="usuario1",
            password="usuario1"
        )

        user2 = User.objects.create_user(
            username="usuario2",
            password="usuario2"
        )

        # Se crean dos perros.
        dog1 = Dog.objects.create(
            name="Perro 1",
            has_special_needs=False
        )

        dog2 = Dog.objects.create(
            name="Perro 2",
            has_special_needs=False
        )

        # Se crea una solicitud para cada usuario.
        application1 = AdoptionApplication.objects.create(
            user=user1,
            dog=dog1,
            comment="Solicitud del usuario 1"
        )

        application2 = AdoptionApplication.objects.create(
            user=user2,
            dog=dog2,
            comment="Solicitud del usuario 2"
        )

        # Se autentica el administrador.
        self.client.force_authenticate(user=admin_user)

        # Se consultan las solicitudes.
        response = self.client.get(
            "/adopta_tu_canino/solicitud-adopcion/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        # El administrador debe recibir las dos solicitudes.
        self.assertEqual(
            len(response.data),
            2
        )

        # Se comprueba que aparecen ambas solicitudes.
        application_ids = [
            application["id"]
            for application in response.data
        ]

        self.assertIn(
            application1.id,
            application_ids
        )

        self.assertIn(
            application2.id,
            application_ids
        )

    # Comprueba que un usuario autenticado puede crear una solicitud
    # de adopción y que esta queda asociada automáticamente a él.
    def test_user_can_create_adoption_application(self):

        # Se crea un usuario.
        user = User.objects.create_user(
            username="usuario_pruebas",
            password="usuario_pruebas"
        )

        # Se autentica al usuario.
        self.client.force_authenticate(user=user)

        # Se crea un perro disponible para adopción.
        dog = Dog.objects.create(
            name="Perro de prueba",
            has_special_needs=False,
            adoption_status=Dog.AdoptionStatusChoices.AVAILABLE
        )

        # El usuario únicamente envía el perro y el comentario.
        # No envía ni el usuario ni el estado.
        data = {
            "dog": dog.id,
            "comment": "Estoy interesado en adoptar este perro."
        }

        # Se crea la solicitud de adopción.
        response = self.client.post(
            "/adopta_tu_canino/solicitud-adopcion/",
            data,
            format="json"
        )

        # La solicitud debe crearse correctamente.
        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        # Se obtiene la solicitud creada.
        application = AdoptionApplication.objects.get(
            dog=dog
        )

        # Se comprueba que el backend ha asociado
        # automáticamente el usuario autenticado.
        self.assertEqual(
            application.user,
            user
        )

        # Se comprueba que la solicitud se crea como pendiente.
        self.assertEqual(
            application.status,
            AdoptionApplication.ApplicationStatus.PENDING
        )

    # Comprueba que no se puede solicitar la adopción
    # de un perro que ya ha sido adoptado.
    def test_cannot_apply_for_adopted_dog(self):

        # Se crea un usuario.
        user = User.objects.create_user(
            username="usuario_pruebas",
            password="usuario_pruebas"
        )

        # Se autentica al usuario.
        self.client.force_authenticate(user=user)

        # Se crea un perro cuyo estado es adoptado.
        dog = Dog.objects.create(
            name="Perro adoptado",
            has_special_needs=False,
            adoption_status=Dog.AdoptionStatusChoices.ADOPTED
        )

        data = {
            "dog": dog.id,
            "comment": "Estoy interesado en adoptar este perro."
        }

        # Se intenta crear una solicitud para el perro adoptado.
        response = self.client.post(
            "/adopta_tu_canino/solicitud-adopcion/",
            data,
            format="json"
        )

        # La API debe rechazar la solicitud.
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        # Se comprueba el mensaje devuelto.
        self.assertIn(
            "No se puede solicitar la adopción de un perro que ya ha sido adoptado.",
            str(response.data)
        )

        # Se comprueba que no se ha creado ninguna solicitud.
        self.assertFalse(
            AdoptionApplication.objects.filter(
                user=user,
                dog=dog
            ).exists()
        )

    # Comprueba que no se puede solicitar la adopción
    # de un perro que no está disponible para adopción.
    def test_cannot_apply_for_unavailable_dog(self):

        # Se crea un usuario.
        user = User.objects.create_user(
            username="usuario_pruebas",
            password="usuario_pruebas"
        )

        # Se autentica al usuario.
        self.client.force_authenticate(user=user)

        # Se crea un perro no disponible para adopción.
        dog = Dog.objects.create(
            name="Perro no disponible",
            has_special_needs=False,
            adoption_status=Dog.AdoptionStatusChoices.UNAVAILABLE
        )

        data = {
            "dog": dog.id,
            "comment": "Estoy interesado en adoptar este perro."
        }

        # Se intenta crear una solicitud para el perro no disponible.
        response = self.client.post(
            "/adopta_tu_canino/solicitud-adopcion/",
            data,
            format="json"
        )

        # La API debe rechazar la solicitud.
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        # Se comprueba el mensaje devuelto.
        self.assertIn(
            "Este perro no está disponible para adopción.",
            str(response.data)
        )

        # Se comprueba que no se ha creado ninguna solicitud.
        self.assertFalse(
            AdoptionApplication.objects.filter(
                user=user,
                dog=dog
            ).exists()
        )

    # Comprueba que un usuario no puede realizar más de una
    # solicitud de adopción para el mismo perro.
    def test_user_cannot_apply_twice_for_same_dog(self):

        # Se crea un usuario.
        user = User.objects.create_user(
            username="usuario_pruebas",
            password="usuario_pruebas"
        )

        # Se autentica al usuario.
        self.client.force_authenticate(user=user)

        # Se crea un perro disponible para adopción.
        dog = Dog.objects.create(
            name="Perro de prueba",
            has_special_needs=False,
            adoption_status=Dog.AdoptionStatusChoices.AVAILABLE
        )

        # Se crea una primera solicitud para ese perro.
        AdoptionApplication.objects.create(
            user=user,
            dog=dog,
            comment="Primera solicitud."
        )

        # Se intenta realizar una segunda solicitud
        # para el mismo perro.
        data = {
            "dog": dog.id,
            "comment": "Segunda solicitud."
        }

        response = self.client.post(
            "/adopta_tu_canino/solicitud-adopcion/",
            data,
            format="json"
        )

        # La API debe rechazar la segunda solicitud porque 
        # el usuario ya tiene una solicitud pendiente para ese perro.
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        # Se comprueba el mensaje devuelto.
        self.assertIn(
            "Tienes ya una solicitud de adopción para este perro.",
            str(response.data)
        )

        # Se comprueba que sigue existiendo una única solicitud
        # de ese usuario para ese perro.
        self.assertEqual(
            AdoptionApplication.objects.filter(
                user=user,
                dog=dog
            ).count(),
            1
        )

    # Comprueba que al aceptar una solicitud:
    # - la solicitud seleccionada pasa a ACCEPTED,
    # - el perro pasa a ADOPTED,
    # - las demás solicitudes PENDING del perro pasan a REJECTED.
    def test_admin_can_accept_application(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        # Se crean dos usuarios.
        user1 = User.objects.create_user(
            username="usuario1",
            password="usuario1"
        )

        user2 = User.objects.create_user(
            username="usuario2",
            password="usuario2"
        )

        # Se crea un perro disponible para adopción.
        dog = Dog.objects.create(
            name="Perro de prueba",
            has_special_needs=False,
            adoption_status=Dog.AdoptionStatusChoices.AVAILABLE
        )

        # Se crean dos solicitudes pendientes para el mismo perro.
        application1 = AdoptionApplication.objects.create(
            user=user1,
            dog=dog,
            comment="Solicitud del usuario 1"
        )

        application2 = AdoptionApplication.objects.create(
            user=user2,
            dog=dog,
            comment="Solicitud del usuario 2"
        )

        # Se autentica al administrador.
        self.client.force_authenticate(user=admin_user)

        # El administrador acepta la primera solicitud.
        response = self.client.patch(
            f"/adopta_tu_canino/solicitud-adopcion/{application1.id}/accept_status/"
        )

        # La operación debe realizarse correctamente.
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        # Se actualizan los objetos con los valores actuales
        # almacenados en la base de datos.
        application1.refresh_from_db()
        application2.refresh_from_db()
        dog.refresh_from_db()

        # La solicitud seleccionada debe estar aceptada.
        self.assertEqual(
            application1.status,
            AdoptionApplication.ApplicationStatus.ACCEPTED
        )

        # El perro debe pasar a estar adoptado.
        self.assertEqual(
            dog.adoption_status,
            Dog.AdoptionStatusChoices.ADOPTED
        )

        # La otra solicitud del mismo perro debe rechazarse automáticamente.
        self.assertEqual(
            application2.status,
            AdoptionApplication.ApplicationStatus.REJECTED
        )

    # Comprueba que un usuario normal no puede aceptar
    # una solicitud de adopción.
    def test_normal_user_cannot_accept_application(self):

        # Se crean dos usuarios.

        # - Usuario que realiza la solicitud.
        applicant = User.objects.create_user(
            username="solicitante",
            password="solicitante"
        )

        # - Usuario normal que intentará aceptar la solicitud.
        normal_user = User.objects.create_user(
            username="usuario_normal",
            password="usuario_normal"
        )

        # Se crea un perro disponible para adopción.
        dog = Dog.objects.create(
            name="Perro de prueba",
            has_special_needs=False,
            adoption_status=Dog.AdoptionStatusChoices.AVAILABLE
        )

        # Se crea una solicitud pendiente.
        application = AdoptionApplication.objects.create(
            user=applicant,
            dog=dog,
            comment="Solicitud de prueba."
        )

        # Se autentica un usuario que no es administrador.
        self.client.force_authenticate(user=normal_user)

        # El usuario intenta aceptar la solicitud.
        response = self.client.patch(
            f"/adopta_tu_canino/solicitud-adopcion/{application.id}/accept_status/"
        )

        # La API debe impedir la operación.
        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

        # Se actualizan los objetos desde la base de datos.
        application.refresh_from_db()
        dog.refresh_from_db()

        # La solicitud debe continuar pendiente.
        self.assertEqual(
            application.status,
            AdoptionApplication.ApplicationStatus.PENDING
        )

        # El perro debe continuar disponible.
        self.assertEqual(
            dog.adoption_status,
            Dog.AdoptionStatusChoices.AVAILABLE
        )


    # Comprueba que un administrador puede rechazar
    # una solicitud de adopción pendiente.
    # Una vez que rechace la solicitud, el perro debe continuar disponible para adopción.
    def test_admin_can_reject_application(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        # Se crea el usuario que realiza la solicitud.
        applicant = User.objects.create_user(
            username="solicitante",
            password="solicitante"
        )

        # Se crea un perro disponible para adopción.
        dog = Dog.objects.create(
            name="Perro de prueba",
            has_special_needs=False,
            adoption_status=Dog.AdoptionStatusChoices.AVAILABLE
        )

        # Se crea una solicitud pendiente.
        application = AdoptionApplication.objects.create(
            user=applicant,
            dog=dog,
            comment="Solicitud de prueba."
        )

        # Se autentica al administrador.
        self.client.force_authenticate(user=admin_user)

        # El administrador rechaza la solicitud.
        response = self.client.patch(
            f"/adopta_tu_canino/solicitud-adopcion/{application.id}/reject_status/"
        )

        # La operación debe realizarse correctamente.
        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        # Se actualizan los objetos con los datos
        # almacenados en la base de datos.
        application.refresh_from_db()
        dog.refresh_from_db()

        # La solicitud debe estar rechazada.
        self.assertEqual(
            application.status,
            AdoptionApplication.ApplicationStatus.REJECTED
        )

        # El perro debe continuar disponible para adopción.
        self.assertEqual(
            dog.adoption_status,
            Dog.AdoptionStatusChoices.AVAILABLE
        )

    # Comprueba que no se puede aceptar una solicitud
    # que ya ha sido rechazada.
    def test_cannot_accept_rejected_application(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        # Se crea el usuario que realizó la solicitud.
        applicant = User.objects.create_user(
            username="solicitante",
            password="solicitante"
        )

        # Se crea un perro disponible para adopción.
        dog = Dog.objects.create(
            name="Perro de prueba",
            has_special_needs=False,
            adoption_status=Dog.AdoptionStatusChoices.AVAILABLE
        )

        # Se crea una solicitud que ya está rechazada.
        application = AdoptionApplication.objects.create(
            user=applicant,
            dog=dog,
            comment="Solicitud de prueba.",
            status=AdoptionApplication.ApplicationStatus.REJECTED
        )

        # Se autentica al administrador.
        self.client.force_authenticate(user=admin_user)

        # Se intenta aceptar la solicitud rechazada.
        response = self.client.patch(
            f"/adopta_tu_canino/solicitud-adopcion/{application.id}/accept_status/"
        )

        # La API debe rechazar la operación porque la solicitud ya está rechazada.
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        # Se comprueba el mensaje devuelto.
        self.assertEqual(
            response.data["detail"],
            "Solo se pueden aceptar solicitudes pendientes."
        )

        # Se actualizan los objetos desde la base de datos.
        application.refresh_from_db()
        dog.refresh_from_db()

        # La solicitud debe continuar rechazada.
        self.assertEqual(
            application.status,
            AdoptionApplication.ApplicationStatus.REJECTED
        )

        # El perro debe continuar disponible.
        self.assertEqual(
            dog.adoption_status,
            Dog.AdoptionStatusChoices.AVAILABLE
        )


    # Comprueba que no se puede rechazar una solicitud
    # que ya ha sido aceptada. Asimismo, el perro debe tener el estado ADOPTED
    # y no debe cambiar su estado al intentar rechazar la solicitud aceptada.
    def test_cannot_reject_accepted_application(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        # Se crea el usuario que realizó la solicitud.
        applicant = User.objects.create_user(
            username="solicitante",
            password="solicitante"
        )

        # Se crea un perro adoptado.
        dog = Dog.objects.create(
            name="Perro de prueba",
            has_special_needs=False,
            adoption_status=Dog.AdoptionStatusChoices.ADOPTED
        )

        # Se crea una solicitud que ya está aceptada.
        application = AdoptionApplication.objects.create(
            user=applicant,
            dog=dog,
            comment="Solicitud de prueba.",
            status=AdoptionApplication.ApplicationStatus.ACCEPTED
        )

        # Se autentica al administrador.
        self.client.force_authenticate(user=admin_user)

        # Se intenta rechazar la solicitud aceptada.
        response = self.client.patch(
            f"/adopta_tu_canino/solicitud-adopcion/{application.id}/reject_status/"
        )

        # La API debe rechazar la operación.
        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        # Se comprueba el mensaje devuelto.
        self.assertEqual(
            response.data["detail"],
            "Solo se pueden rechazar solicitudes pendientes."
        )

        # Se actualizan los objetos desde la base de datos.
        application.refresh_from_db()
        dog.refresh_from_db()

        # La solicitud debe continuar aceptada.
        self.assertEqual(
            application.status,
            AdoptionApplication.ApplicationStatus.ACCEPTED
        )

        # El perro debe continuar adoptado.
        self.assertEqual(
            dog.adoption_status,
            Dog.AdoptionStatusChoices.ADOPTED
        )

    # Comprueba que una solicitud de adopción
    # no puede modificarse mediante PUT.
    def test_adoption_application_cannot_be_updated(self):

        # Se crea un usuario.
        user = User.objects.create_user(
            username="usuario_pruebas",
            password="usuario_pruebas"
        )

        # Se autentica al usuario.
        self.client.force_authenticate(user=user)

        # Se crea un perro disponible para adopción.
        dog = Dog.objects.create(
            name="Perro de prueba",
            has_special_needs=False,
            adoption_status=Dog.AdoptionStatusChoices.AVAILABLE
        )

        # Se crea una solicitud.
        application = AdoptionApplication.objects.create(
            user=user,
            dog=dog,
            comment="Comentario original."
        )

        # Se intenta modificar la solicitud mediante PUT.
        data = {
            "dog": dog.id,
            "comment": "Comentario modificado."
        }

        response = self.client.put(
            f"/adopta_tu_canino/solicitud-adopcion/{application.id}/",
            data,
            format="json"
        )

        # La API debe indicar que la operación no está permitida.
        self.assertEqual(
            response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED
        )

        # Se comprueba el mensaje devuelto.
        self.assertEqual(
            response.data["detail"],
            "Las solicitudes de adopción no se pueden modificar una vez enviadas."
        )

        # Se actualiza la solicitud desde la base de datos.
        application.refresh_from_db()

        # El comentario debe continuar siendo el original.
        self.assertEqual(
            application.comment,
            "Comentario original."
        )

    # Comprueba que una solicitud de adopción
    # no puede modificarse mediante PATCH.
    def test_adoption_application_cannot_be_partially_updated(self):

        # Se crea un usuario.
        user = User.objects.create_user(
            username="usuario_pruebas",
            password="usuario_pruebas"
        )

        # Se autentica al usuario.
        self.client.force_authenticate(user=user)

        # Se crea un perro disponible para adopción.
        dog = Dog.objects.create(
            name="Perro de prueba",
            has_special_needs=False,
            adoption_status=Dog.AdoptionStatusChoices.AVAILABLE
        )

        # Se crea una solicitud.
        application = AdoptionApplication.objects.create(
            user=user,
            dog=dog,
            comment="Comentario original."
        )

        # Se intenta modificar únicamente el comentario mediante PATCH.
        data = {
            "comment": "Comentario modificado."
        }

        response = self.client.patch(
            f"/adopta_tu_canino/solicitud-adopcion/{application.id}/",
            data,
            format="json"
        )

        # La API debe indicar que la operación no está permitida.
        self.assertEqual(
            response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED
        )

        # Se comprueba el mensaje devuelto.
        self.assertEqual(
            response.data["detail"],
            "Las solicitudes de adopción no se pueden modificar una vez enviadas."
        )

        # Se actualiza la solicitud desde la base de datos.
        application.refresh_from_db()

        # El comentario debe continuar siendo el original.
        self.assertEqual(
            application.comment,
            "Comentario original."
        )

    # Comprueba que una solicitud de adopción no puede eliminarse.
    def test_adoption_application_cannot_be_deleted(self):

        # Se crea un usuario administrador.
        admin_user = User.objects.create_user(
            username="admin_pruebas",
            password="admin_pruebas",
            is_staff=True
        )

        # Se crea el usuario que realizó la solicitud.
        applicant = User.objects.create_user(
            username="solicitante",
            password="solicitante"
        )

        # Se crea un perro.
        dog = Dog.objects.create(
            name="Perro de prueba",
            has_special_needs=False,
            adoption_status=Dog.AdoptionStatusChoices.AVAILABLE
        )

        # Se crea una solicitud.
        application = AdoptionApplication.objects.create(
            user=applicant,
            dog=dog,
            comment="Solicitud de prueba."
        )

        # Se autentica al administrador.
        self.client.force_authenticate(user=admin_user)

        # Se intenta eliminar la solicitud.
        response = self.client.delete(
            f"/adopta_tu_canino/solicitud-adopcion/{application.id}/"
        )

        # La API debe indicar que la operación no está permitida.
        self.assertEqual(
            response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED
        )

        # Se comprueba el mensaje devuelto.
        self.assertEqual(
            response.data["detail"],
            "No se permite eliminar las solicitudes de adopción."
        )

        # Se comprueba que la solicitud continúa existiendo.
        self.assertTrue(
            AdoptionApplication.objects.filter(
                id=application.id
            ).exists()
        )
