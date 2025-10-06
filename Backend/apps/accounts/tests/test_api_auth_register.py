import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


pytestmark = pytest.mark.django_db

URL = "/api/v1/auth/register/"


def test_register_success_201():
    client = APIClient()
    payload = {
        "nombre_completo": "Josefa Méndez",
        "email": "josefa@example.com",
        "password": "Clave#2025",
        "password2": "Clave#2025",
    }
    resp = client.post(URL, payload, format="json")
    assert resp.status_code == 201
    assert resp.data["message"] == "Registro exitoso"
    User = get_user_model()
    u = User.objects.get(email__iexact="josefa@example.com")
    assert u.is_active is True
    assert u.check_password("Clave#2025") is True


def test_missing_fields_400():
    client = APIClient()
    resp = client.post(URL, {"email": "a@b.com"}, format="json")
    assert resp.status_code == 400
    assert "nombre_completo" in resp.data
    assert "password" in resp.data
    assert "password2" in resp.data


def test_invalid_email_400():
    client = APIClient()
    payload = {
        "nombre_completo": "X",
        "email": "invalido",
        "password": "Clave#2025",
        "password2": "Clave#2025",
    }
    resp = client.post(URL, payload, format="json")
    assert resp.status_code == 400
    assert "email" in resp.data


def test_email_duplicate_400():
    User = get_user_model()
    User.objects.create_user(username="dup@x.com", email="dup@x.com", password="Clave#2025")
    client = APIClient()
    payload = {
        "nombre_completo": "X",
        "email": "Dup@x.com",
        "password": "Clave#2025",
        "password2": "Clave#2025",
    }
    resp = client.post(URL, payload, format="json")
    assert resp.status_code == 400
    assert resp.data["email"][0] == "Ya existe una cuenta con ese email"


def test_password_policy_400():
    client = APIClient()
    payload = {
        "nombre_completo": "X",
        "email": "x@example.com",
        "password": "soloLetras",
        "password2": "soloLetras",
    }
    resp = client.post(URL, payload, format="json")
    assert resp.status_code == 400
    assert "password" in resp.data


def test_password_mismatch_400():
    client = APIClient()
    payload = {
        "nombre_completo": "X",
        "email": "x2@example.com",
        "password": "Clave#2025",
        "password2": "Clave#2026",
    }
    resp = client.post(URL, payload, format="json")
    assert resp.status_code == 400
    assert "password2" in resp.data
