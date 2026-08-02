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