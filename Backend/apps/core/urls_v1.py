from django.urls import path
from .views import api_v1_root

app_name = "core_v1"

urlpatterns = [
    path("", api_v1_root, name="api-v1-root"),  # Se monta en /api/v1/
]
