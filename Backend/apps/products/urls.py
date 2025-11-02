from django.urls import path

from .views import TipoProductoCreateView, TipoProductoUpdateView

app_name = "products"

urlpatterns = [
    path("tipo-producto/", TipoProductoCreateView.as_view(), name="tipo-producto-create"),
    path(
        "tipo-producto/<int:id_tipoproducto>/",
        TipoProductoUpdateView.as_view(),
        name="tipo-producto-update",
    ),
]
