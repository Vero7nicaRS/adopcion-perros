<p align="center">
  <img src="docs/logo_adopta_tu_canino.png" alt="Logo Adopta tu Canino" width="180">
</p>


# Adopta tu canino 🐶

## 📌 Descripción del proyecto
Aplicación web desarrollada como Trabajo Fin de Máster (TFM) cuyo objetivo es facilitar el proceso de adopción de perros por parte de protectoras y asociaciones, al igual que para los usuarios interesados en adoptar una nueva mascota.

La aplicación permite consultar la información de los perros disponibles para adopción, incluyendo datos como su edad, raza, tamaño, carácter, compatibilidad con otros animales, necesidades especiales, fotografías y vídeos.

Los usuarios podrán registrarse, iniciar sesión y enviar solicitudes de adopción para los perros disponibles. Por otra parte, los usuarios autorizados podrán gestionar la información de los animales y gestionar las solicitudes recibidas, pudiendo rechazarlas o aceptarlas.

Además, la aplicación incorpora un chatbot orientado a ayudar a los usuarios en la búsqueda de un perro compatible con su estilo de vida y preferencias. A través de una conversación en lenguaje natural, el chatbot recopia información del usuario y proporciona recomendaciones utilizando un sistema de reglas de negocio.

## 🆗 Funcionalidades implementadas

- Visualización del listado de perros disponibles para adopción.
- Visualización de la información de cada perro.
- Filtrado de perros según sus características.
- Gestión de perros mediante una API REST.
- Gestión de fotografías y vídeos asociados a los perros.
- Creación y consulta de solicitudes de adopción.
- Aceptación y rechazo de solicitudes mediante endpoints específicos.
- Actualización automática del estado de adopción de un perro cuando una solicitud es aceptada.
- Registro e inicio de sesión de usuarios.
- Autenticación mediante JSON Web Token (JWT).
- Gestión de perros y solicitudes por usuarios autorizados.
- Recomendaciones de adopción mediante un chatbot.

## 👷🏽‍♀️ Funcionalidades previstas

- Actualización de la gestión de perros.
- Gestionar las fotografías y vídeos asociado a los perros.
- Gestionar la ubicación asociada a los perros.
- Filtrado de información mediante parámetros de consulta.
- Migración de la base de datos de SQLite a MySQL.

## 👩🏼‍💻 Tecnologías utilizadas 
### Backend
- Python
- Django
- Django REST Framework
- SQLite para desarrollo local
- API de OpenAI
- JWT

### Frontend
- React
- Vite
- React Router
- React Bootstrap
- CSS
- Boostrap Icons

### Tecnologías previstas
- MySQL

## 📁 Estructura del proyecto
```text
dog_adoption/
├── backend/
├── frontend/
├── docs/
    ├── logo_adopta_tu_canino.png
├── .gitignore
├── README.md
```

### Arquitectura del proyecto
La aplicación está estructurada en dos partes principales:
- **Backend**: desarrollado con Django. Se encarga de la lógica de negocio, el acceso a la base de datos, la autenticación y la exposición con la API REST.
- **Frontend**: desarrollado con React y Vite. Se encarga de la interfaz de usuario y la comunicación con la API del backend.

Gracias a esta separación, se permite distribuir las responsabilidades de la aplicación y facilitar su mantenimiento y evolución.

##  ⚙ Ejecutar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/Vero7nicaRS/adopcion-perros.git
cd dog_adoption
```

### 2. Configuración del Backend

Acceder a la carpeta "backend":
```bash
cd backend
```

Crear el entorno virtual:
```bash
python -m venv .venv
```

Activar el entorno virtual:
```bash
# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

Instalar las dependencias:
```bash
pip install -r requirements.txt
```

Migraciones y ejecución del programa:
```bash
python manage.py migrate
python manage.py runserver
```

El backend estará disponible en:
```bash
http://127.0.0.1:8000/
```

### 3. Configuración del Frontend

Desde la raíz del proyecto, acceder a la carpeta "frontend":
```bash
cd frontend
```

Instalar las dependencias:
```bash
npm install
```

Ejecutar el proyecto:
Introducir la siguiente línea de comando: 

```bash
npm run dev
```

El frontend estará disponible en:
```text
http://localhost:5173/

```

## Endpoints desarrollados
Los siguientes endpoints son orientativos y se actualizarán conforme avance el desarrollo de la aplicación.

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/token/` | Iniciar sesión y obtener los tokens de autenticación |
| POST | `/api/token/refresh/` | Renovar el token de acceso |
| GET | `/adopta_tu_canino/usuarios/me/` | Obtener la información del usuario autenticado |


### Perros

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /adopta_tu_canino/perros | Obtener todos los perros |
| GET | /adopta_tu_canino/perros/:id | Obtener un perro en concreto |
| POST | /adopta_tu_canino/perros | Crear un perro |
| PUT | /adopta_tu_canino/perros/:id | Modificar un perro |
| PATCH | /adopta_tu_canino/perros/:id | Modificación parcial de un perro  |

### Solicitudes de adopción

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /adopta_tu_canino/solicitud-adopcion/ | Obtener todas las solicitudes |
| GET | /adopta_tu_canino/solicitud-adopcion/:id | Obtener una solicitud concreta |
| POST | /adopta_tu_canino/solicitud-adopcion/ | Crear una solicitud de adopción |
| PATCH | /adopta_tu_canino/solicitud-adopcion/:id/accept_status/ | Aceptar una solicitud pendiente |
| PATCH | /adopta_tu_canino/solicitud-adopcion/:id/reject_status/ | Rechazar una solicitud pendiente |
| DELETE | /adopta_tu_canino/solicitud-adopcion/:id | Eliminar una solicitud |

Las solicitudes de adopción no pueden modificarse directamente mediante los métodos PUT o PATCH una vez enviadas. Los cambios de estado se realizan mediante los endpoints específicos de aceptación y rechazo

### Chatbot
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/adopta_tu_canino/chatbot/` | Enviar información al chatbot y obtener una respuesta o recomendaciones |

**NOTA**: La API dispone además de endpoints auxiliares para la gestión de usuarios, ubicaciones, temperamentos, fotografías y vídeos. Algunos de ellos se utilizan internamente por las funcionalidades de gestión de la aplicación.

## 📹 Recursos multimedia

Por motivos de tamaño, este repositorio no incluye la carpeta `backend/media/`, donde se almacenan las fotografías y los vídeos asociados a los perros.


## Estado del proyecto

🚧 En desarrollo.

El proyecto se encuentra en fase de desarrollo y actualmente dispone de las principales funcionalidades previstas para el proceso de adopción, incluyendo la gestión de usuarios, perros y solicitudes de adopción, así como el sistema de recomendación mediante chatbot.

## 👩🏽‍💻 Autor

Verónica Rodríguez Sánchez

Trabajo de Fin de Máster

Máster en Desarrollo de Aplicaciones Web