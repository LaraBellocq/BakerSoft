import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.products.models import ProductType


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
        "codigo": "PAN01",
        "nombre": "Pan Tradicional",
        "descripcion": "Productos elaborados con masa madre.",
    }

    resp = client.post(URL, payload, format="json")

    assert resp.status_code == 201
    assert resp.data["message"] == "Tipo de producto creado correctamente."
    assert ProductType.objects.filter(codigo="PAN01").exists()


def test_codigo_o_nombre_duplicados_retorna_error():
    client = _authenticated_client()
    ProductType.objects.create(
        codigo="PAN01",
        nombre="Pan Tradicional",
        descripcion="Productos elaborados con masa madre.",
    )

    resp_codigo = client.post(
        URL,
        {"codigo": "pan01", "nombre": "Nuevo nombre"},
        format="json",
    )
    assert resp_codigo.status_code == 400
    assert resp_codigo.data["detail"][0] == "El código o nombre ya existen."

    resp_nombre = client.post(
        URL,
        {"codigo": "PAN02", "nombre": "pan tradicional"},
        format="json",
    )
    assert resp_nombre.status_code == 400
    assert resp_nombre.data["detail"][0] == "El código o nombre ya existen."
