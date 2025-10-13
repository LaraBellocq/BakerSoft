import logging
import time
from datetime import timedelta
from typing import Optional

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import mail_admins, send_mail
from django.db import transaction
from django.urls import reverse
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import Throttled
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.request import get_client_ip
from apps.common.validators import normalize_email

from .models import AccountLock, LoginAttempt, PasswordResetRequest, SecurityEvent
from .serializers import (
    ForgotPasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    ResetPasswordValidateSerializer,
)
from .throttling import LoginIPRateThrottle

logger = logging.getLogger(__name__)
security_logger = logging.getLogger("accounts.security")


def _build_reset_link(request, token: str) -> str:
    frontend_url = settings.FRONTEND_RESET_URL
    if frontend_url:
        separator = "&" if "?" in frontend_url else "?"
        return f"{frontend_url}{separator}token={token}"
    validate_path = reverse("v1-accounts:auth-password-reset-validate")
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
    send_mail(subject, message, getattr(settings, "DEFAULT_FROM_EMAIL", None), [recipient])


def _get_reset_request_for_logging(token: Optional[str]) -> Optional[PasswordResetRequest]:
    if not token:
        return None
    token_hash = PasswordResetRequest._hash_token(token)
    return PasswordResetRequest.objects.select_related("user").filter(token_hash=token_hash).first()


def _record_login_attempt(email: str, ip: Optional[str], user, success: bool) -> None:
    LoginAttempt.objects.create(
        email=normalize_email(email),
        ip=ip or None,
        user=user,
        success=success,
    )


def _register_failure(user, ip: Optional[str]):
    with transaction.atomic():
        lock, _ = AccountLock.objects.select_for_update().get_or_create(user=user)
        now = timezone.now()
        if lock.locked_until and lock.locked_until <= now:
            lock.locked_until = None
        lock.consecutive_failures += 1
        locked_applied = False
        alert_triggered = False
        if lock.consecutive_failures >= settings.SECURITY_LOGIN_MAX_CONSECUTIVE_FAILURES:
            lock.consecutive_failures = 0
            lock.locked_until = now + timedelta(minutes=settings.SECURITY_LOGIN_LOCK_MINUTES)
            if not lock.last_lock_at or now - lock.last_lock_at > timedelta(hours=24):
                lock.lockouts_last_24h = 0
            lock.lockouts_last_24h += 1
            lock.last_lock_at = now
            locked_applied = True
            if lock.lockouts_last_24h >= settings.SECURITY_LOGIN_ALERT_THRESHOLD:
                alert_triggered = True
        lock.save()
    if locked_applied:
        SecurityEvent.record(
            "lock_applied",
            user=user,
            email=user.email,
            ip=ip,
            metadata={"locked_until": lock.locked_until.isoformat()},
        )
    return lock, locked_applied, alert_triggered


def _notify_security_alert(user, ip: Optional[str], lockouts_count: int) -> None:
    subject = "Alerta de seguridad: múltiples bloqueos de cuenta"
    message = (
        "Se detectaron múltiples bloqueos de la cuenta.\n\n"
        f"Usuario: {user.email}\n"
        f"IP más reciente: {ip or 'desconocida'}\n"
        f"Bloqueos en 24h: {lockouts_count}\n"
        f"Fecha: {timezone.now().isoformat()}\n"
    )
    if getattr(settings, "ADMINS", None):
        mail_admins(subject, message)
    else:
        User = get_user_model()
        staff_emails = list(
            User.objects.filter(is_staff=True, is_active=True)
            .exclude(email="")
            .values_list("email", flat=True)
        )
        if staff_emails:
            send_mail(subject, message, getattr(settings, "DEFAULT_FROM_EMAIL", None), staff_emails)
    SecurityEvent.record(
        "security_alert",
        user=user,
        email=user.email,
        ip=ip,
        metadata={"lockouts_last_24h": lockouts_count},
    )


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
    throttle_classes = [LoginIPRateThrottle, AnonRateThrottle]

    def throttled(self, request, wait):
        client_ip = get_client_ip(request)
        email = normalize_email(request.data.get("email", "")) if hasattr(request, "data") else ""
        if email:
            _record_login_attempt(email, client_ip, None, False)
        time.sleep(settings.SECURITY_LOGIN_RESPONSE_DELAY_SECONDS)
        security_logger.warning(
            "ip_rate_limited",
            extra={"email": email, "ts": timezone.now().isoformat(), "ip": client_ip},
        )
        SecurityEvent.record(
            "ip_rate_limited",
            email=email,
            ip=client_ip,
            metadata={"wait": wait, "max_attempts": settings.SECURITY_LOGIN_IP_ATTEMPTS, "window_seconds": settings.SECURITY_LOGIN_IP_WINDOW_SECONDS},
        )
        raise Throttled(detail="Demasiados intentos. Intente más tarde.", wait=wait)

    def post(self, request, *args, **kwargs):
        client_ip = get_client_ip(request)
        raw_email = request.data.get("email", "")
        normalized_email = normalize_email(raw_email)
        User = get_user_model()
        user = User.objects.filter(email__iexact=normalized_email).first() if normalized_email else None

        now = timezone.now()
        if user:
            lock = AccountLock.objects.filter(user=user).first()
            if lock and lock.locked_until and lock.locked_until > now:
                _record_login_attempt(normalized_email, client_ip, user, False)
                security_logger.warning(
                    "login_blocked",
                    extra={"email": user.email, "ts": now.isoformat(), "ip": client_ip, "user_id": user.id},
                )
                SecurityEvent.record(
                    "lock_denied",
                    user=user,
                    email=user.email,
                    ip=client_ip,
                    metadata={"locked_until": lock.locked_until.isoformat()},
                )
                return Response(
                    {"detail": "Cuenta bloqueada temporalmente. Intente en 15 minutos."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = LoginSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            security_logger.warning(
                "login_failed",
                extra={"email": normalized_email, "ts": timezone.now().isoformat(), "ip": client_ip},
            )
            _record_login_attempt(normalized_email or raw_email, client_ip, user, False)

            if user:
                lock, locked_applied, alert_triggered = _register_failure(user, client_ip)
                if locked_applied:
                    security_logger.warning(
                        "lock_applied",
                        extra={"email": user.email, "ts": timezone.now().isoformat(), "ip": client_ip, "user_id": user.id},
                    )
                    if alert_triggered:
                        security_logger.error(
                            "security_alert",
                            extra={"email": user.email, "ts": timezone.now().isoformat(), "ip": client_ip, "user_id": user.id},
                        )
                        _notify_security_alert(user, client_ip, lock.lockouts_last_24h)
                    return Response(
                        {"detail": "Cuenta bloqueada temporalmente. Intente en 15 minutos."},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            return Response({"detail": "Credenciales inválidas"}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data["user"]
        with transaction.atomic():
            lock, _ = AccountLock.objects.select_for_update().get_or_create(user=user)
            was_locked = bool(lock.locked_until and lock.locked_until <= timezone.now())
            lock.consecutive_failures = 0
            lock.locked_until = None
            lock.save(update_fields=["consecutive_failures", "locked_until", "updated_at"])
        if was_locked:
            SecurityEvent.record(
                "lock_expired",
                user=user,
                email=user.email,
                ip=client_ip,
            )
            security_logger.info(
                "lock_expired",
                extra={"email": user.email, "ts": timezone.now().isoformat(), "ip": client_ip, "user_id": user.id},
            )

        security_logger.info(
            "login_success",
            extra={"email": user.email, "ts": timezone.now().isoformat(), "ip": client_ip, "user_id": user.id},
        )
        _record_login_attempt(user.email, client_ip, user, True)
        refresh = RefreshToken.for_user(user)
        nombre = getattr(user, "first_name", "") or getattr(user, "username", "")
        user_payload = {
            "id": user.pk,
            "email": user.email,
            "nombre": nombre,
        }
        data = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": user_payload,
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
        security_logger.warning(
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
                security_logger.warning(
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
        security_logger.info(
            'password_reset_succeeded',
            extra={'email': user.email, 'ts': timezone.now().isoformat(), 'ip': client_ip},
        )
        return Response({"message": "Contraseña actualizada"}, status=status.HTTP_200_OK)
