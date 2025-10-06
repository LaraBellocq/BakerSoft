import logging

from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .serializers import RegisterSerializer

logger = logging.getLogger(__name__)


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
