from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, LocationViewSet, TemperamentViewSet, DogViewSet, PhotographViewSet, VideoViewSet, AdoptionApplicationViewSet, CurrentUserView, chatbot

router = DefaultRouter()

# Registrar en el router los endpoints que queremos. De modo que los genera automáticamente:
# GET (List) - GET - POST - PUT - PATCH - DELETE.
router.register(r'usuarios', UserViewSet, basename='user')
router.register(r'ubicaciones', LocationViewSet, basename='ubication')
router.register(r'temperamentos', TemperamentViewSet, basename='temperament')
router.register(r'perros', DogViewSet, basename='dog')
router.register(r'fotografias', PhotographViewSet, basename='photograph')
router.register(r'videos', VideoViewSet, basename='video')
router.register(r'solicitud-adopcion', AdoptionApplicationViewSet, basename='adoptation-application')

urlpatterns = [

     path(
            "usuarios/me/",
            CurrentUserView.as_view(),
            name="current-user"
        ),

    path(
            "chatbot/", 
            chatbot, 
            name="chatbot"
        ),

    path("", include(router.urls)) # urlpatterns = router.urls
   
]