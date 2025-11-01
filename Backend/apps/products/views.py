import logging

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from apps.common.request import get_client_ip

from .serializers import ProductTypeCreateSerializer

logger = logging.getLogger(__name__)


class ProductTypeCreateView(generics.CreateAPIView):
    serializer_class = ProductTypeCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_type = serializer.save()

        if request.user and request.user.is_authenticated:
            user_id = request.user.pk
            user_email = getattr(request.user, "email", "")
        else:
            user_id = None
            user_email = ""

        logger.info(
            "product_type_created",
            extra={
                "codigo": product_type.codigo,
                "nombre": product_type.nombre,
                "user_id": user_id,
                "user_email": user_email,
                "ip": get_client_ip(request),
            },
        )

        headers = self.get_success_headers({"id": product_type.pk})
        return Response(
            {"message": "Tipo de producto creado correctamente."},
            status=status.HTTP_201_CREATED,
            headers=headers,
        )
