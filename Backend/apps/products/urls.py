from django.urls import path

from .views import TipoProductoCreateView

app_name = "products"

urlpatterns = [
    path("tipo-producto/", TipoProductoCreateView.as_view(), name="tipo-producto-create"),
]
