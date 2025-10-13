import secrets
from datetime import timedelta
from hashlib import sha256

from django.conf import settings
from django.db import models
from django.utils import timezone


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

    def __str__(self) -> str:
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

        instance = cls.objects.create(
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
