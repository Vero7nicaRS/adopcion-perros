from django.contrib import admin

from adopciones.models import User, Location, Temperament, Dog, AdoptionApplication ,Photograph, Video

# Register your models here.

# Para gestionar los datos de los modelos desde la interfaz de Django (panel de administración),
# se deben indicar los modelos utilizados en la aplicación:
# Usuarios, Ubicaciones, Caracter, Solicitud Adopcion, Perros, Fotografías y Vídeos

admin.site.register(User) 
admin.site.register(Location) 
admin.site.register(Temperament)
admin.site.register(AdoptionApplication)
admin.site.register(Dog)
admin.site.register(Photograph)
admin.site.register(Video)