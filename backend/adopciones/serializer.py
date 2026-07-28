from rest_framework import serializers
from .models import  User, Temperament, Location, Dog, Photograph, Video, AdoptionApplication
from django.utils import timezone
# --------------------------------------------------------------------------------------------------------------------------
#                                   VALIDACIONES
# SERIALIZER: Se encarga de validar que los datos que se han pasado por el JSON (body) ---> Postman
#             sean los correctos. Para que así, la VIEW solamente tenga que implementar la funcionalidad
#             y no hacer comprobaciones.
#             Por tanto, el serializer se encarga de comprobar los datos de entrada (JSON - BODY)
# validate_<name_DEL_CAMPO_A_VALIDAR>
# 
# Serializer: permite definir que información de nuestro modelo vamos a mover hacia delante o hacia atrás
# cuando el usuario interactue con nosotros. Y que limitaciones estamos imponiendo y validaciones adicionales.
# Después del serializer, hay que dirigirse a la vista.
#
# A la hora de hacer peticiones, esta información es la que se va a mostrar.
#
# Ejemplo de petición:
# {
#    name: Pepe,
#    estimated_age: 6
#    looking_for_home_since: 2025-04-23
# }
# validate_name ... Comprueba el campo name.
# --------------------------------------------------------------------------------------------------------------------------

# --------------------------
#     USER SERIALIZER
# --------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:  # Se definen las características del Serializer, indicando "MODELO" y "CAMPOS" del Serializer.
        model = User # Modelo
        fields = ['id', 'username', 'first_name', 'last_name', 'email',
                'birth_date','phone', 'date_joined', 'updated_at',] # Atributos que estarán en la petición (A la hora de hacer peticiones, esta información es la que se va a mostrar.)
        read_only_fields = ['id', 'date_joined', 'updated_at'] # El usuario no puede modificarlas.

# --------------------------
#   TEMPERAMENT SERIALIZER
# --------------------------
class TemperamentSerializer(serializers.ModelSerializer):
    class Meta: # Se definen las características del Serializer, indicando "MODELO" y "CAMPOS" del Serializer.
        model = Temperament # Modelo
        fields = ["id","name"] # Atributos que estarán en la petición (A la hora de hacer peticiones, esta información es la que se va a mostrar.)
        read_only_fields = ["id"] # El usuario no puede modificarlas.

    # --- Validaciones de los campos ---
    def validate_name(self,value): # Se asegura que el campo "name" tenga valor
        if(not value or not value.strip()):
            raise serializers.ValidationError("El campo 'name' es obligatorio.")
        return value

# --------------------------
#     LOCATION SERIALIZER
# --------------------------
class LocationSerializer(serializers.ModelSerializer):
    class Meta: # Se definen las características del Serializer, indicando "MODELO" y "CAMPOS" del Serializer.
        model = Location # Modelo
        fields = ["id","name", "locality", "province", "latitude", "longitude"] # Atributos que estarán en la petición (A la hora de hacer peticiones, esta información es la que se va a mostrar.)
        read_only_fields = ["id"] # El usuario no puede modificarlas.

    # --- Validaciones de los campos ---    
    def validate_name(self,value): # Se asegura que el campo "name" tenga valor
        if(not value or not value.strip()):
            raise serializers.ValidationError("El campo 'name' es obligatorio.")
        return value
    
    def validate_latitude(self,value):
        if value is not None and not (-90 <= value <= 90):
            raise serializers.ValidationError(
                "La latitude debe estar entre -90 y 90."
            )
        return value
    def validate_longitude(self,value):
        if value is not None and not (-180 <= value <= 180):
            raise serializers.ValidationError(
                "La longitude debe estar entre -180 y 180."
            )
        return value
    
    # --- Validaciones generales ---   
    def validate (self,data):
        latitude = data.get("latitude")
        longitude = data.get("longitude")
        if (latitude is not None and longitude is None):
            raise serializers.ValidationError(
                { "longitude": "Debes indicar la longitude también." } 
            )

        if (latitude is None and longitude is not None):
            raise serializers.ValidationError( 
                { "latitude" : "Debes indicar la latitude también." }
            )
        return data 

    
    
# --------------------------
#   PHOTOGRAPH SERIALIZER
# --------------------------
class PhotographSerializer(serializers.ModelSerializer):
    class Meta: # Se definen las características del Serializer, indicando "MODELO" y "CAMPOS" del Serializer.
        model = Photograph # Modelo
        fields = ["id", "dog", "imagen", "title", "description", "created_at", "is_main"] # Atributos que estarán en la petición (A la hora de hacer peticiones, esta información es la que se va a mostrar.)
        read_only_fields = ["id" , "created_at"] # El usuario no puede modificarlas.


# --------------------------
#   VIDEO SERIALIZER
# --------------------------
class VideoSerializer(serializers.ModelSerializer):
    class Meta: # Se definen las características del Serializer, indicando "MODELO" y "CAMPOS" del Serializer.
        model = Video # Modelo
        fields = ["id", "dog", "file", "title", "description", "description", "created_at"] # Atributos que estarán en la petición (A la hora de hacer peticiones, esta información es la que se va a mostrar.)
        read_only_fields = ["id" , "created_at"] # El usuario no puede modificarlas.


    
# --------------------------
#     DOG SERIALIZER
# --------------------------
class DogSerializer(serializers.ModelSerializer):

    main_photograph = serializers.SerializerMethodField()
    temperament = TemperamentSerializer( # Use TemperamentSerializer to represent the id and name of the temperament.
        many=True,
        read_only=True
    )
    temperament_ids = serializers.PrimaryKeyRelatedField( # Use PrimaryKeyRelatedField to accept a list of temperament IDs.
        source='temperament',  # This tells the serializer to use the 'temperament' field in the Dog model.
        many=True, # Receive many PK
        queryset=Temperament.objects.all(), # These PK must be in Temperament.objects.all()
        write_only=True, # Write only 
    )


    photographs = PhotographSerializer(
        many=True,
        read_only=True
    )

    videos = VideoSerializer(
        many=True,
        read_only=True
    )

    location = LocationSerializer(
        read_only=True
    )

    class Meta: # Se definen las características del Serializer, indicando "MODELO" y "CAMPOS" del Serializer.
        model = Dog # Modelo
        fields = ["id","name", "estimated_age", "estimated_age_unit", 
                  "sex", "size", "breed", "temperament", "description", 
                  "dog_compatibility", "cat_compatibility", "children_compatibility", 
                  "has_special_needs","special_needs_description",
                  "is_sterilized", "is_vaccinated", "looking_for_home_since", 
                  "location", "adoption_status",
                  "main_photograph" , "temperament_ids",
                  "videos", "photographs"
                  ] # Atributos que estarán en la petición (A la hora de hacer peticiones, esta información es la que se va a mostrar.)
        read_only_fields = ["id"] # El usuario no puede modificarlas.

    # --- Validaciones de los campos ---
    def validate_name(self,value): # Se asegura que el campo "name" tenga valor
        if(not value or not value.strip()):
            raise serializers.ValidationError(
                "El campo 'name' es obligatorio."
            )
        return value
    
    def validate_looking_for_home_since(self,value):
        if(value is not None and value > timezone.now().date()):
            raise serializers.ValidationError(
                "La fecha no puede ser futura."
                )

        return value

    def get_main_photograph(self, dog):
        photograph = dog.photographs.filter(is_main=True).first()

        if photograph:
            return photograph.imagen.url

        return None
    # --- Validaciones generales ---   
    def validate(self,data):

        has_special_needs = data.get("has_special_needs")
        special_needs_description =  ( data.get("special_needs_description") or "").strip() 
        if(
            # Si tienes necesidades y no tiene una descripción, mostrar error.
            has_special_needs
            and not special_needs_description.strip()
        ):
             raise serializers.ValidationError( {
                  "special_needs_description":
                "Debes describir las necesidades especiales del perro."
             }
        )

        if (
            # Si no tienes necesidades y tiene una descripción, mostrar error.
            not has_special_needs and special_needs_description.strip()
        ):
            raise serializers.ValidationError( {
            "special_needs_description":
                "Debes seleccionar que sí hay necesidades especiales para el perro."
            }
        )
        return data


# ------------------------------------
#   ADOPTION APPLICATION SERIALIZER
# ------------------------------------
class AdoptionApplicationSerializer(serializers.ModelSerializer):
    class Meta: # Se definen las características del Serializer, indicando "MODELO" y "CAMPOS" del Serializer.
        model = AdoptionApplication # Modelo
        fields = ["id", "user", "dog", "status", "comment", "created_at"]
        read_only_fields = ["id" , "status", "created_at"] # El usuario no puede modificarlas.

    def validate(self, data):
        dog = data.get("dog")
        user = data.get("user")

        # Comprobar que el perro no esté adoptado.
        # Si está adoptado, lanzar un mensaje de error.
        if dog.adoption_status == Dog.AdoptionStatusChoices.ADOPTED:
            raise serializers.ValidationError( {
                "dog": "No se puede solicitar la adopción de un perro que ya ha sido adoptado."
            })

        # Si un mismo usuario realiza varias veces una solicitud en el mismo perro, 
        # lanza un mensaje de error.
        # Un usuario puede hacer UNA única solicitud en UN perro.
        application_exists = AdoptionApplication.objects.filter(
            dog = dog, 
            user = user
        ).exists()
        
        if application_exists: 
            raise serializers.ValidationError( {
                "dog": "Tienes ya una solicitud de adopción para este perro."
            })
        return data 