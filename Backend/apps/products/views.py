import logging

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from apps.common.request import get_client_ip

from .serializers import TipoProductoCreateSerializer

logger = logging.getLogger(__name__)


class TipoProductoCreateView(generics.CreateAPIView):
    serializer_class = TipoProductoCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tipo_producto = serializer.save()

        user = request.user if request.user and request.user.is_authenticated else None

        logger.info(
            "product_type_created",
            extra={
                "id": tipo_producto.id_tipoproducto,
                "nombre": tipo_producto.nombre,
                "estado": tipo_producto.estado,
                "user_id": getattr(user, "pk", None),
                "user_email": getattr(user, "email", ""),
                "ip": get_client_ip(request),
            },
        )

        headers = self.get_success_headers({"id": tipo_producto.id_tipoproducto})
        return Response(
            {
                "message": "Tipo de producto creado correctamente.",
                "id": tipo_producto.id_tipoproducto,
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )
