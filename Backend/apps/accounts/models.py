import secrets
from datetime import timedelta
from hashlib import sha256
from typing import Any, Dict, Optional

from django.conf import settings
from django.db import models
from django.utils import timezone


class LoginAttempt(models.Model):
    email = models.CharField(max_length=254)
    ip = models.GenericIPAddressField(null=True, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="login_attempts",
    )
    success = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["email", "created_at"]),
            models.Index(fields=["user", "created_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover - repr helper
        status = "success" if self.success else "failure"
        return f"LoginAttempt(email={self.email}, status={status}, ip={self.ip})"


class AccountLock(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="account_lock",
    )
    locked_until = models.DateTimeField(null=True, blank=True)
    consecutive_failures = models.PositiveIntegerField(default=0)
    lockouts_last_24h = models.PositiveIntegerField(default=0)
    last_lock_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "locked_until"]),
        ]

    def __str__(self) -> str:  # pragma: no cover - repr helper
        return (
            f"AccountLock(user={self.user_id}, locked_until={self.locked_until}, "
            f"consecutive_failures={self.consecutive_failures}, lockouts_last_24h={self.lockouts_last_24h})"
        )

    def reset_failures(self) -> bool:
        was_locked = bool(self.locked_until)
        if self.consecutive_failures or self.locked_until:
            self.consecutive_failures = 0
            self.locked_until = None
            self.save(update_fields=["consecutive_failures", "locked_until", "updated_at"])
        return was_locked


class SecurityEvent(models.Model):
    event_type = models.CharField(max_length=64)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="security_events",
    )
    email = models.CharField(max_length=254, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["event_type", "created_at"]),
            models.Index(fields=["email", "created_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover - repr helper
        return f"SecurityEvent(type={self.event_type}, email={self.email})"

    @classmethod
    def record(
        cls,
        event_type: str,
        *,
        user=None,
        email: Optional[str] = None,
        ip: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> "SecurityEvent":
        return cls.objects.create(
            event_type=event_type,
            user=user,
            email=email or "",
            ip=ip,
            metadata=metadata or {},
        )


class PasswordResetRequest(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="password_reset_requests",
    )
    token_hash = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    ip = models.CharField(max_length=45, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover - repr helper
        return f"PasswordResetRequest(user={self.user_id}, expires_at={self.expires_at.isoformat()})"

    @staticmethod
    def _hash_token(token: str) -> str:
        return sha256(token.encode("utf-8")).hexdigest()

    def is_valid(self) -> bool:
        if self.used_at is not None:
            return False
        if timezone.now() > self.expires_at:
            return False
        return True

    def mark_used(self) -> None:
        if self.used_at is None:
            self.used_at = timezone.now()
            self.save(update_fields=["used_at"])

    @classmethod
    def create_for_user(cls, user, ip: str | None = None, user_agent: str | None = None) -> str:
        now = timezone.now()
        cls.objects.filter(
            user=user,
            used_at__isnull=True,
            expires_at__gt=now,
        ).update(used_at=now)

        for _ in range(5):
            raw_token = secrets.token_urlsafe(48)
            token_hash = cls._hash_token(raw_token)
            if not cls.objects.filter(token_hash=token_hash).exists():
                break
        else:
            raise RuntimeError("No se pudo generar un token de restablecimiento único")

        cls.objects.create(
            user=user,
            token_hash=token_hash,
            expires_at=now + timedelta(minutes=15),
            ip=ip or "",
            user_agent=user_agent or "",
        )
        return raw_token

    @classmethod
    def find_valid_by_token(cls, token: str):
        token_hash = cls._hash_token(token)
        try:
            instance = cls.objects.get(token_hash=token_hash)
        except cls.DoesNotExist:
            return None
        if not instance.is_valid():
            return None
        return instance

