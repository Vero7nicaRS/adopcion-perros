from django.db.migrations import serializer
from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from .models import  User, Temperament, Location, Dog, Photograph, Video, AdoptionApplication
from .serializer import UserSerializer, TemperamentSerializer, LocationSerializer, DogSerializer, PhotographSerializer, VideoSerializer, AdoptionApplicationSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny, IsAdminUser

from rest_framework.views import APIView
from rest_framework.decorators import api_view

from .chatbot import ( create_empty_preferences, extract_preferences, 
                      update_preferences, get_missing_preferences,
                      get_missing_preferences, get_next_question
                      )

from .recommendation import recommend_dogs
# --------------------------
#     USER VIEWSET
# --------------------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username') # Obtener la información
    serializer_class = UserSerializer 
    lookup_field = 'pk'
    def get_permissions(self):
        if self.action == "create": # Create --> Everyone 
            permission_classes = [AllowAny]
        else: # Another action --> Only Admin
            permission_classes = [IsAdminUser]

        return [
            permission()
            for permission in permission_classes
        ]


# --------------------------
#     CURRENT USER VIEW
# --------------------------
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "is_staff": request.user.is_staff
        })

# --------------------------
#     TEMPERAMENT VIEWSET
# --------------------------
class TemperamentViewSet(viewsets.ModelViewSet):
    queryset = Temperament.objects.all().order_by('name') # Obtener la información
    serializer_class = TemperamentSerializer 
    lookup_field = 'pk'


# --------------------------
#     LOCATION VIEWSET
# --------------------------
class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all().order_by('name') # Obtener la información
    serializer_class = LocationSerializer 
    lookup_field = 'pk'


# --------------------------
#     DOG VIEWSET
# --------------------------
class DogViewSet(viewsets.ModelViewSet):
    queryset = Dog.objects.all().order_by('name') # Obtener la información
    serializer_class = DogSerializer 
    lookup_field = 'pk'

    
# --------------------------
#     PHOTOGRAPH VIEWSET
# --------------------------
class PhotographViewSet(viewsets.ModelViewSet):
    queryset = Photograph.objects.all().order_by('title') # Obtener la información
    serializer_class = PhotographSerializer 
    lookup_field = 'pk'


# --------------------------
#     VIDEO VIEWSET
# --------------------------
class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all().order_by('title') # Obtener la información
    serializer_class = VideoSerializer 
    lookup_field = 'pk'


# --------------------------------
# ADOPTION APPLICATION VIEWSET
# --------------------------------
class AdoptionApplicationViewSet(viewsets.ModelViewSet):
#    queryset = AdoptionApplication.objects.all().order_by('status') # Obtener la información
    serializer_class = AdoptionApplicationSerializer
    lookup_field = 'pk'

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user 
        if user.is_staff:
            return AdoptionApplication.objects.all().order_by('status') # Obtener la información
        else:
            return AdoptionApplication.objects.filter(
                user=user
            ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
# detail=True  → actúa sobre un objeto → incluye /7/
# detail=False → actúa sobre la colección → no incluye /7/

# PATCH --> http://127.0.0.1:8000/adopta_tu_canino/7/accept_status/
# Steps:
# 1. Accept adoptation application (Aceptas la solicitud seleccionada).
# 2. Get dog linked (Obtienes el perro asociado)
# 3. Search all adoptation application related this dog. (Buscas todas las solicitudes de ese perro).
# 4. Reject all adoptation application except that (Excluyes la que acabas de aceptar).
# Cambias el estado del resto a REJECTED.
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def accept_status(self, request, pk=None):
        adoption_application = self.get_object() # Obtiene la información de la base de datos mediante la URL, que contiene la "PK"

        # Solo se pueden aceptar peticiones PENDIENTES
        if adoption_application.status != AdoptionApplication.ApplicationStatus.PENDING:
            return Response(
                {
                    "detail": "Solo se pueden aceptar solicitudes pendientes."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Change adoption application status 
        adoption_application.status = AdoptionApplication.ApplicationStatus.ACCEPTED # Cambia estado
        adoption_application.save(update_fields =["status"]) # Guarda cambios: actualiza el campo "status"
        
        # Change dog adoption status
        dog = adoption_application.dog
        dog.adoption_status = Dog.AdoptionStatusChoices.ADOPTED 
        dog.save(update_fields = ["adoption_status"])  # Guarda cambios: actualiza el campo "adoption_status"

        # Reject others adoptionApplication about this dog 
        AdoptionApplication.objects.filter(
            dog = dog
        ).exclude(
            pk = adoption_application.pk
        ).update( 
            status = AdoptionApplication.ApplicationStatus.REJECTED # Guarda cambios: actualiza directamente el campo "status"
        )
        serializer = self.get_serializer(adoption_application)
        return Response (
            serializer.data, 
            status = status.HTTP_200_OK,
        )

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def reject_status(self, request, pk=None):
        adoption_application = self.get_object() # Obtiene la información de la base de datos mediante la URL, que contiene la "PK"

        # Solo se pueden rechazar solicitudes pendientes 
        if adoption_application.status != AdoptionApplication.ApplicationStatus.PENDING:
            return Response(
                {
                    "detail": "Solo se pueden rechazar solicitudes pendientes."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Change adoption application status 
        adoption_application.status = AdoptionApplication.ApplicationStatus.REJECTED # Cambia estado
        adoption_application.save(update_fields =["status"]) # Guarda cambios: actualiza el campo "status"

        serializer = self.get_serializer(adoption_application)
        return Response (
            serializer.data, 
            status = status.HTTP_200_OK,
        )

# No se puede actualizar (PUT) de las solicitudes de adopción.
    def update(self, request, *args, **kwargs):
        return Response(
            {
                "detail": (
                    "Las solicitudes de adopción no se pueden modificar "
                    "una vez enviadas."
                )
            },
            status= status.HTTP_405_METHOD_NOT_ALLOWED,
        )

# No se puede actualizar (PATCH) de las solicitudes de adopción.
    def partial_update(self, request, *args, **kwargs):
        return Response(
            {
                "detail": (
                    "Las solicitudes de adopción no se pueden modificar "
                    "una vez enviadas."
                )
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )


# --------------------------------
#          CHATBOT API VIEW
# --------------------------------
@api_view(['POST'])
def chatbot(request):

    # {
    #   "message": "Vivo en un piso y tengo un gato"
    #   "preferences": null
    # } 
    #

    # 1. Obtiene el primer mensaje del usuario
    message = request.data.get("message")
    current_preferences = request.data.get("preferences")

    if not message:
        return Response(
            {
                "error": "El mensaje es obligatorio."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # 2. Crea el esqueleto de las preferencias del usuario vacío.
    # {
    #    "housing": None,
    #    "human_activity_level": None,
    #    "has_children": None,
    #    "has_dogs": None,
    #    "has_cats": None,
    #    "preferred_temperament": [],
    # }
    if current_preferences is None:
        current_preferences = create_empty_preferences()

    # 3. Comprueba qué información falta antes de analizar el mensaje del usuario.
    missing_preferences = get_missing_preferences(
        current_preferences
    )

    expected_preference = None

    if missing_preferences:
        expected_preference = missing_preferences[0]

    # 4. Extrae las preferencias del usuario en base al dato que está esperando el chatbot.
    new_preferences = extract_preferences(message, expected_preference)

    # 5. Actualiza las preferencias del usuario (vacio --> añade datos)
    updated_preferences = update_preferences(
        current_preferences,
        new_preferences
    )

    # 6. Comprueba qué información todavía no se ha obtenido
    missing_preferences = get_missing_preferences(
        updated_preferences
    )

    # 7. Si falta información por recabar, realiza preguntas
    if missing_preferences:
        next_question = get_next_question(
            updated_preferences
        )

        return Response(
            {
                "preferences": updated_preferences,
                "message": next_question,
                "recommendations": [],
                "finished": False # La conversación no ha finalizado todavía.
            },
            status=status.HTTP_200_OK
        )

    # 8 . Si tiene toda la información, devuelve las preferencias y un mensaje.
    #

    #{'dog': 
    #   <Dog: PerroNuevo2 (FEMALE, None) - ID 23>, 
    #   'compatibility': 
    #   {
    #       'excluded': False, 
    #       'score': 4, 
    #       'max_score': 5, 
    #       'activity_compatibility': 'GOOD', 
    #       'housing_compatibility': 'GOOD', 
    #       'children_evaluation': 'UNKNOWN', 
    #       .................
    #    }
    #}
    #
    recommendations = recommend_dogs(updated_preferences) 
    serialized_recommendations = []

    for recommendation in recommendations:
        dog = recommendation["dog"] # <Dog: PerroNuevo2 (FEMALE, None) - ID 23>,
        compatibility = recommendation["compatibility"] 
        # 'compatibility': 
        #   {
        #       'excluded': False, 
        # ........ 
        #   }

        serialized_recommendations.append({
            "dog": DogSerializer(dog).data,  # {'id': x, 'name': ... , 'estimated_age': ....}
            "compatibility": compatibility
        })

    # Si no hay recomendaciones, significa que no hay perros compatibles con las preferencias del usuario.
    if not serialized_recommendations:
        return Response(
            {
                "preferences": updated_preferences,
                "message": "No he encontrado ningún perro compatible con los criterios indicados.",
                "recommendations": [],
                "finished": True # La conversación ha finalizado.
            },
            status=status.HTTP_200_OK
        )
    return Response(
        {
            "preferences": updated_preferences,
            "message": "He encontrado algunos perros que podrían ser compatibles contigo 😀",
            "recommendations": serialized_recommendations,
            "finished": True # La conversación ha finalizado.
        },
        status=status.HTTP_200_OK
    )