from rest_framework import serializers

from .models import TipoProducto


class TipoProductoCreateSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(required=True, max_length=50, allow_blank=False)
    descripcion = serializers.CharField(required=False, allow_blank=True, max_length=255)
    activo = serializers.BooleanField(required=False)

    class Meta:
        model = TipoProducto
        fields = ("nombre", "descripcion", "activo")

    def validate(self, attrs):
        nombre = attrs.get("nombre", "").strip()
        if not nombre:
            raise serializers.ValidationError({"error": "El campo 'nombre' es obligatorio."})

        if TipoProducto.objects.filter(nombre__iexact=nombre).exists():
            raise serializers.ValidationError({"error": "Ya existe un tipo de producto con ese nombre."})

        attrs["nombre"] = nombre
        return attrs

    def create(self, validated_data):
        activo = validated_data.pop("activo", True)
        estado = TipoProducto.ESTADO_ACTIVO if activo else TipoProducto.ESTADO_INACTIVO

        descripcion = validated_data.get("descripcion", "") or ""

        tipo_producto = TipoProducto.objects.create(
            nombre=validated_data["nombre"],
            descripcion=descripcion,
            estado=estado,
        )
        return tipo_producto
