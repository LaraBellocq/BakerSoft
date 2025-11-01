from django.urls import path

from .views import ProductTypeCreateView

app_name = "products"

urlpatterns = [
    path("tipo-producto/", ProductTypeCreateView.as_view(), name="tipo-producto-create"),
]
