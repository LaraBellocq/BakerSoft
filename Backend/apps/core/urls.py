from django.urls import path
from .views import ping, api_v1_root

urlpatterns = [
    # healthcheck fuera de la versión
    path("api/ping/", ping, name="ping"),

    # raíz de la API v1 (mapita). OJO: esto se incluye bajo /api/v1/
    path("", api_v1_root, name="api-v1-root"),
]
