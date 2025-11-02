import logging

from django.http import Http404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response

from apps.common.request import get_client_ip

from .models import TipoProducto
from .serializers import (
    TipoProductoCreateSerializer,
    TipoProductoEstadoUpdateSerializer,
    TipoProductoListSerializer,
    TipoProductoUpdateSerializer,
)

logger = logging.getLogger(__name__)


class TipoProductoCreateView(generics.CreateAPIView):
    serializer_class = TipoProductoCreateSerializer
    permission_classes = [permissions.AllowAny]

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


class TipoProductoUpdateView(generics.UpdateAPIView):
    serializer_class = TipoProductoUpdateSerializer
    permission_classes = [permissions.AllowAny]
    queryset = TipoProducto.objects.all()
    lookup_field = "id_tipoproducto"
    http_method_names = ["put"]

    def get_object(self):
        try:
            return super().get_object()
        except Http404 as exc:
            raise NotFound(detail={"error": "No se encontr\u00f3 el tipo de producto solicitado."}) from exc

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {"message": "Tipo de producto actualizado correctamente."},
            status=status.HTTP_200_OK,
        )


class TipoProductoEstadoUpdateView(generics.UpdateAPIView):
    serializer_class = TipoProductoEstadoUpdateSerializer
    permission_classes = [permissions.AllowAny]
    queryset = TipoProducto.objects.all()
    lookup_field = "id_tipoproducto"
    http_method_names = ["patch"]

    def get_object(self):
        try:
            return super().get_object()
        except Http404 as exc:
            raise NotFound(detail={"error": "No se encontr\u00f3 el tipo de producto solicitado."}) from exc

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        activo = serializer.validated_data["activo"]
        message = (
            "Tipo de producto reactivado correctamente."
            if activo
            else "Tipo de producto desactivado correctamente."
        )
        return Response({"message": message}, status=status.HTTP_200_OK)


class TipoProductoListView(generics.ListAPIView):
    serializer_class = TipoProductoListSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id_tipoproducto"
    queryset = TipoProducto.objects.all()

    def dispatch(self, request, *args, **kwargs):
        if request.method.lower() == "post":
            return TipoProductoCreateView.as_view()(request, *args, **kwargs)
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        queryset = TipoProducto.objects.all()

        estado = (self.request.query_params.get("estado") or "").strip()
        if estado:
            queryset = queryset.filter(estado__iexact=estado)

        search = (self.request.query_params.get("search") or "").strip()
        if search:
            queryset = queryset.filter(nombre__icontains=search)

        return queryset.order_by("nombre")

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        if not queryset.exists():
            return Response({"message": "Sin resultados."}, status=status.HTTP_200_OK)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
