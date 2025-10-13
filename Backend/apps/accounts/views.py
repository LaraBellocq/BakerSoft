import logging
from typing import Optional

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.urls import reverse
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.request import get_client_ip

from .models import PasswordResetRequest
from .serializers import (
    ForgotPasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    ResetPasswordValidateSerializer,
)

logger = logging.getLogger(__name__)


def _build_reset_link(request, token: str) -> str:
    frontend_url = settings.FRONTEND_RESET_URL
    if frontend_url:
        separator = '&' if '?' in frontend_url else '?'
        return f"{frontend_url}{separator}token={token}"
    validate_path = reverse('v1-accounts:auth-password-reset-validate')
    return request.build_absolute_uri(f"{validate_path}?token={token}")


def _send_password_reset_email(recipient: str, reset_link: str) -> None:
    subject = "Restablecer contraseña"
    message = (
        "Hola,\n\n"
        "Recibimos una solicitud para restablecer tu contraseña. "
        "Podés hacerlo con el siguiente enlace (válido por 15 minutos):\n"
        f"{reset_link}\n\n"
        "Si no solicitaste este cambio, ignorá este correo.\n"
    )
    send_mail(subject, message, getattr(settings, 'DEFAULT_FROM_EMAIL', None), [recipient])


def _get_reset_request_for_logging(token: Optional[str]) -> Optional[PasswordResetRequest]:
    if not token:
        return None
    token_hash = PasswordResetRequest._hash_token(token)
    return PasswordResetRequest.objects.select_related('user').filter(token_hash=token_hash).first()


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        try:
            logger.info("Registro de usuario", extra={"email": user.email, "ts": timezone.now().isoformat()})
        except Exception:
            logger.info(f"Registro de usuario: {getattr(user, 'email', '')}")
        return Response({"message": "Registro exitoso", "next": "/login"}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        client_ip = get_client_ip(request)
        if not serializer.is_valid():
            errors = serializer.errors
            email = serializer.initial_data.get('email', '')
            logger.warning('login_failed', extra={'email': email, 'ts': timezone.now().isoformat(), 'ip': client_ip})
            if 'inactive' in errors:
                detail = str(errors.get('detail', ['Usuario inactivo'])[0])
                return Response({'detail': detail}, status=status.HTTP_403_FORBIDDEN)
            if 'detail' in errors and len(errors) == 1:
                return Response({'detail': str(errors['detail'][0])}, status=status.HTTP_400_BAD_REQUEST)
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data['user']
        logger.info('login_success', extra={'email': user.email, 'ts': timezone.now().isoformat(), 'ip': client_ip})
        refresh = RefreshToken.for_user(user)
        nombre = getattr(user, 'first_name', '') or getattr(user, 'username', '')
        user_payload = {
            'id': user.pk,
            'email': user.email,
            'nombre': nombre,
        }
        data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_payload,
        }
        return Response(data, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        client_ip = get_client_ip(request)
        user_agent = (request.META.get('HTTP_USER_AGENT') or '')[:255]
        User = get_user_model()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        log_email = email
        if user:
            token = PasswordResetRequest.create_for_user(user, ip=client_ip, user_agent=user_agent)
            reset_link = _build_reset_link(request, token)
            _send_password_reset_email(user.email, reset_link)
            log_email = user.email
        logger.info(
            'password_reset_requested',
            extra={'email': log_email, 'ts': timezone.now().isoformat(), 'ip': client_ip},
        )
        return Response({"message": "Si existe una cuenta, enviamos un enlace"}, status=status.HTTP_200_OK)


class ResetPasswordValidateView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]

    def get(self, request, *args, **kwargs):
        serializer = ResetPasswordValidateSerializer(data={'token': request.query_params.get('token')})
        if serializer.is_valid():
            return Response({"valid": True}, status=status.HTTP_200_OK)

        client_ip = get_client_ip(request)
        logger.warning(
            'password_reset_failed',
            extra={'email': 'unknown', 'ts': timezone.now().isoformat(), 'ip': client_ip, 'reason': 'invalid_or_expired'},
        )
        errors = serializer.errors
        detail = errors.get('detail')
        if detail:
            return Response({'detail': str(detail[0])}, status=status.HTTP_400_BAD_REQUEST)
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = ResetPasswordSerializer(data=request.data)
        client_ip = get_client_ip(request)
        if not serializer.is_valid():
            errors = serializer.errors
            if 'detail' in errors:
                token = request.data.get('token')
                reset_request = _get_reset_request_for_logging(token)
                log_email = reset_request.user.email if reset_request else 'unknown'
                logger.warning(
                    'password_reset_failed',
                    extra={'email': log_email, 'ts': timezone.now().isoformat(), 'ip': client_ip, 'reason': 'invalid_or_expired'},
                )
                return Response({'detail': str(errors['detail'][0])}, status=status.HTTP_400_BAD_REQUEST)
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        reset_request = serializer.validated_data['reset_request']
        user = reset_request.user
        password = serializer.validated_data['password']
        user.set_password(password)
        user.save(update_fields=['password'])
        reset_request.mark_used()
        user.password_reset_requests.filter(used_at__isnull=True).exclude(pk=reset_request.pk).update(used_at=timezone.now())
        logger.info(
            'password_reset_succeeded',
            extra={'email': user.email, 'ts': timezone.now().isoformat(), 'ip': client_ip},
        )
        return Response({"message": "Contraseña actualizada"}, status=status.HTTP_200_OK)
