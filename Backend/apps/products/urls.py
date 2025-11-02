from django.urls import path

from .views import (
    TipoProductoDetailView,
    TipoProductoEstadoUpdateView,
    TipoProductoListView,
    TipoProductoUpdateView,
)

app_name = "products"

tipo_producto_root_view = TipoProductoListView.as_view()

urlpatterns = [
    path("tipo-producto/", tipo_producto_root_view, name="tipo-producto-list"),
    path("tipo-producto/", tipo_producto_root_view, name="tipo-producto-create"),
    path("tipo-producto/<int:id_tipoproducto>/", TipoProductoDetailView.as_view(), name="tipo-producto-detail"),
    path(
        "tipo-producto/<int:id_tipoproducto>/actualizar/",
        TipoProductoUpdateView.as_view(),
        name="tipo-producto-update",
    ),
    path(
        "tipo-producto/<int:id_tipoproducto>/estado/",
        TipoProductoEstadoUpdateView.as_view(),
        name="tipo-producto-estado",
    ),
]
