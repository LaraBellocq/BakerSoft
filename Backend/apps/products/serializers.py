from django.db.models import Q
from rest_framework import serializers

from .models import ProductType


class ProductTypeCreateSerializer(serializers.ModelSerializer):
    descripcion = serializers.CharField(allow_blank=True, required=False)
    activo = serializers.BooleanField(required=False, default=True)

    class Meta:
        model = ProductType
        fields = ("codigo", "nombre", "descripcion", "activo")

    def validate(self, attrs):
        codigo = attrs.get("codigo", "")
        nombre = attrs.get("nombre", "")
        if ProductType.objects.filter(
            Q(codigo__iexact=codigo) | Q(nombre__iexact=nombre)
        ).exists():
            raise serializers.ValidationError({"detail": "El código o nombre ya existen."})
        return attrs
