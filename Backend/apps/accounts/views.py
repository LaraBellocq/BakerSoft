import logging

from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.request import get_client_ip

from .serializers import LoginSerializer, RegisterSerializer

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

