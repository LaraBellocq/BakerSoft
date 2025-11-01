from typing import Any, Dict

from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

from apps.common.validators import normalize_email, validate_password_policy
from .models import PasswordResetRequest

PASSWORD_POLICY_MESSAGE = "Debe tener al menos 8 caracteres, incluir letras, números y un caracter especial"


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
            raise serializers.ValidationError(PASSWORD_POLICY_MESSAGE)
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


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, trim_whitespace=False)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        request = self.context.get('request')
        email_raw = attrs.get('email', '')
        password = attrs.get('password')
        email = normalize_email(email_raw)
        attrs['email'] = email

        user = authenticate(request=request, username=email, password=password)
        if user is None:
            User = get_user_model()
            try:
                user_obj = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                raise serializers.ValidationError({'detail': 'Credenciales inválidas'})
            if not user_obj.is_active:
                raise serializers.ValidationError({'detail': 'Usuario inactivo', 'inactive': True})
            raise serializers.ValidationError({'detail': 'Credenciales inválidas'})

        if not user.is_active:
            raise serializers.ValidationError({'detail': 'Usuario inactivo', 'inactive': True})

        attrs['user'] = user
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value: str) -> str:
        return normalize_email(value)


class ResetPasswordValidateSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        token = attrs.get("token")
        reset_request = PasswordResetRequest.find_valid_by_token(token)
        if reset_request is None:
            raise serializers.ValidationError({"detail": "Token inválido o expirado"})
        self.context["reset_request"] = reset_request
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    token = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    password = serializers.CharField(write_only=True, required=True, trim_whitespace=False, min_length=8)
    password2 = serializers.CharField(write_only=True, required=True, trim_whitespace=False, min_length=8)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        token = attrs.get("token")
        email_raw = attrs.get("email", "")
        password = attrs.get("password")
        password2 = attrs.get("password2")

        email = normalize_email(email_raw)
        attrs["email"] = email

        User = get_user_model()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user is None:
            raise serializers.ValidationError({"email": "No existe una cuenta con ese email"})

        reset_request = None
        if token:
            reset_request = PasswordResetRequest.find_valid_by_token(token)
            if reset_request is None or reset_request.user_id != user.pk:
                raise serializers.ValidationError({"detail": "Token inválido o expirado"})

        if password != password2:
            raise serializers.ValidationError({"password2": "Las contraseñas no coinciden"})

        if not validate_password_policy(password):
            raise serializers.ValidationError({"password": PASSWORD_POLICY_MESSAGE})

        attrs["reset_request"] = reset_request
        attrs["user"] = user
        return attrs


