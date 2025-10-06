from typing import Any, Dict

from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.common.validators import normalize_email, validate_password_policy


class RegisterSerializer(serializers.Serializer):
    nombre_completo = serializers.CharField(required=True, max_length=150, allow_blank=False)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8, trim_whitespace=False)
    password2 = serializers.CharField(write_only=True, required=True, min_length=8, trim_whitespace=False)

    def validate_email(self, value: str) -> str:
        User = get_user_model()
        email_norm = normalize_email(value)
        if User.objects.filter(email__iexact=email_norm).exists():
            raise serializers.ValidationError("Ya existe una cuenta con ese email")
        return email_norm

    def validate_password(self, value: str) -> str:
        if not validate_password_policy(value):
            raise serializers.ValidationError(
                "Debe tener al menos 8 caracteres, incluir letras, números y un caracter especial"
            )
        return value

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        if attrs.get("password") != attrs.get("password2"):
            raise serializers.ValidationError({"password2": "Las contraseñas no coinciden"})
        return attrs

    def create(self, validated_data: Dict[str, Any]):
        User = get_user_model()
        nombre = validated_data["nombre_completo"].strip()
        email = validated_data["email"]
        password = validated_data["password"]

        user = User(
            email=email,
            is_active=True,
        )
        if hasattr(User, "username"):
            user.username = email

        if hasattr(User, "first_name"):
            user.first_name = nombre

        user.set_password(password)
        user.save()
        return user
