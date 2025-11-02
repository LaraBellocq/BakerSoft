import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.products.models import TipoProducto


pytestmark = pytest.mark.django_db

URL = "/api/v1/tipo-producto/"


def _authenticated_client():
    User = get_user_model()
    user = User.objects.create_user(
        username="admin@example.com",
        email="admin@example.com",
        password="Clave#2025",
        is_active=True,
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def test_crear_tipo_producto_exitoso():
    client = _authenticated_client()
    payload = {
        "nombre": "Pastelería",
        "descripcion": "Productos dulces y tortas",
        "activo": True,
    }

    resp = client.post(URL, payload, format="json")

    assert resp.status_code == 201
    assert resp.data["message"] == "Tipo de producto creado correctamente."
    assert "id" in resp.data
    tipo = TipoProducto.objects.get(nombre__iexact="Pastelería")
    assert tipo.estado == TipoProducto.ESTADO_ACTIVO


def test_nombre_duplicado_devuelve_error():
    TipoProducto.objects.create(
        nombre="Pastelería",
        descripcion="Dulces",
        estado=TipoProducto.ESTADO_ACTIVO,
    )
    client = _authenticated_client()
    resp = client.post(URL, {"nombre": "pasteleria"}, format="json")
    assert resp.status_code == 400
    assert resp.data["error"] == "Ya existe un tipo de producto con ese nombre."


def test_activo_false_guarda_inactivo():
    client = _authenticated_client()
    resp = client.post(
        URL,
        {"nombre": "Sandwichería", "activo": False},
        format="json",
    )
    assert resp.status_code == 201
    tipo = TipoProducto.objects.get(nombre="Sandwichería")
    assert tipo.estado == TipoProducto.ESTADO_INACTIVO
