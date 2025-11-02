from django.urls import path

from .views import (
    TipoProductoEstadoUpdateView,
    TipoProductoListView,
    TipoProductoUpdateView,
)

app_name = "products"

tipo_producto_root_view = TipoProductoListView.as_view()

urlpatterns = [
    path("tipo-producto/", tipo_producto_root_view, name="tipo-producto-list"),
    path("tipo-producto/", tipo_producto_root_view, name="tipo-producto-create"),
    path(
        "tipo-producto/<int:id_tipoproducto>/",
        TipoProductoUpdateView.as_view(),
        name="tipo-producto-update",
    ),
    path(
        "tipo-producto/<int:id_tipoproducto>/estado/",
        TipoProductoEstadoUpdateView.as_view(),
        name="tipo-producto-estado",
    ),
]
