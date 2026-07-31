from django.db import models
from django.contrib.auth.models import AbstractUser

from django.conf import settings
# Create your models here.

# --------------------------
#       USER
# --------------------------
class User(AbstractUser):

    birth_date  = models.DateField(
        null=True,
        blank=True
    )
    phone = models.CharField(
        max_length=20,
        blank=True
    )
    updated_at = models.DateTimeField(auto_now=True ) 

    def __str__(self):
        return self.username
    
# --------------------------
#       TEMPERAMENT
# --------------------------
# Almacena el caracter del animal
class Temperament(models.Model):
    name = models.CharField(max_length=50 , unique=True)
    
    def __str__(self):
        return f"{self.name} - ID {self.id}"

# --------------------------
#       LOCATION
# --------------------------
class Location(models.Model):
    name = models.CharField(max_length=150)

    locality = models.CharField(
        max_length=100,
        blank=True
    )

    province = models.CharField(
        max_length=100,
        blank=True
    )

    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    def __str__(self):
        return self.name

# --------------------------
#       DOG
# --------------------------
class Dog(models.Model):

    class SexOption(models.TextChoices):
        MALE = "MALE", "Macho"
        FEMALE = "FEMALE" , "Hembra"

    class SizeOption(models.TextChoices):
        SMALL = "SMALL", "Pequeño"
        MEDIUM = "MEDIUM", "Mediano"
        LARGE = "LARGE", "Grande"
    
    class AdoptionStatusChoices(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Disponible"
        UNAVAILABLE = "UNAVAILABLE", "No disponible"
        ADOPTED = "ADOPTED", "Adoptado"

    class CompatibleOption(models.TextChoices):
        YES = "YES", "Sí"
        NO = "NO", "No"
        UNKNOWN = "UNKNOWN", "Desconocido"

    class AgeUnit(models.TextChoices):
        MONTHS = "MONTHS", "Meses"
        YEARS = "YEARS", "Años"
        
    name = models.CharField(max_length=150)
    
    estimated_age = models.PositiveIntegerField(null=True, blank= True) 
    estimated_age_unit = models.CharField(
        max_length=10,
        choices=AgeUnit.choices,
        default=AgeUnit.YEARS
    )

    sex = models.CharField(
        max_length=10,
        choices=SexOption.choices,
        default=SexOption.MALE
    )
    size = models.CharField(
        max_length=10,
        choices=SizeOption.choices,
        default=SizeOption.MEDIUM
    )

    # Si no se indica, es que es una raza desconocida
    breed = models.CharField(max_length=100, blank=True)

    # Un perro puede tener distintos tipos de caracter: juguetón, miedoso, sociable...
    temperament = models.ManyToManyField( # N:N (Un perro puede tener MUCHOS tipos de caracter - Un caracter puede tenerlo MUCHOS perros)
        Temperament,
        blank=True,
        related_name="dogs",
    )
    description = models.TextField(blank=True)
    dog_compatibility = models.CharField(
        max_length=11,
        choices=CompatibleOption.choices,
        default=CompatibleOption.UNKNOWN,
    )

    cat_compatibility = models.CharField(
        max_length=11,
        choices=CompatibleOption.choices,
        default=CompatibleOption.UNKNOWN,
    )
    children_compatibility = models.CharField(
        max_length=11,
        choices=CompatibleOption.choices,
        default=CompatibleOption.UNKNOWN,
    )


    has_special_needs = models.BooleanField(blank=True)
    special_needs_description = models.TextField(blank= True)

    is_sterilized = models.BooleanField(default=False)
    is_vaccinated = models.BooleanField(default=False)
    looking_for_home_since = models.DateField(null=True, blank = True)
    
    location = models.ForeignKey(  # 1:N (Un perro está en UNA ubicación - Una ubicación tiene MUCHOS perros)
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="dogs"
    )
    adoption_status = models.CharField(
        max_length=20,
        choices=AdoptionStatusChoices.choices,
        default=AdoptionStatusChoices.AVAILABLE
    )

    def __str__(self):
        return f"{self.name} ({self.sex}, {self.estimated_age}) - ID {self.id}"
  

# --------------------------
#       PHOTOGRAPH
# --------------------------
class Photograph(models.Model):
    dog = models.ForeignKey(
        Dog,
        on_delete=models.CASCADE,
        related_name="photographs"
    )

    imagen = models.ImageField(upload_to="dogs/photographs/")
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    is_main = models.BooleanField(default = False) # Identify the main dog photograph 
    def __str__(self):
        return self.title


# --------------------------
#       VÍDEO
# --------------------------
class Video(models.Model):
    dog = models.ForeignKey(
        Dog,
        on_delete=models.CASCADE,
        related_name="videos"
    )

    file = models.FileField(upload_to="dogs/videos/")
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.title
    
# --------------------------
#    ADOPTION APPLICATION
# --------------------------
class AdoptionApplication (models.Model):
    class ApplicationStatus(models.TextChoices):
        PENDING = "PENDING", "Pendiente"
        ACCEPTED = "ACCEPTED", "Aceptada"
        REJECTED = "REJECTED", "Rechazada"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="adoption_applications"
    )

    dog = models.ForeignKey(
        Dog,
        on_delete=models.CASCADE,
        related_name="adoption_applications"
    )


    status = models.CharField(
        max_length=20,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.PENDING
    )

    comment = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    # Constraints to ensure that a user can only submit one adoption application per dog.
    # Avoid duplicate applications for the same dog by the same user.
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "dog"],
                name="unique_user_dog_application"
            )
        ]
    def __str__(self):
        return ( 
            f"Solicitud de adopción de {self.user.username} " 
            f"para {self.dog.name} - Estado: {self.status}"
        )
#Serializers obtener información más sencilla del modelo.

