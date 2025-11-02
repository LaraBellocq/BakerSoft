from django.apps import apps as django_apps
from rest_framework import serializers

from .models import TipoProducto


class TipoProductoListSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="id_tipoproducto")

    class Meta:
        model = TipoProducto
        fields = ("id", "nombre", "descripcion", "estado")


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


class TipoProductoUpdateSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(required=True, max_length=50, allow_blank=False)
    descripcion = serializers.CharField(required=False, allow_blank=True, max_length=255)
    activo = serializers.BooleanField(required=False)

    class Meta:
        model = TipoProducto
        fields = ("nombre", "descripcion", "activo")

    def validate_nombre(self, value: str) -> str:
        nombre = (value or "").strip()
        if not nombre:
            raise serializers.ValidationError("El nombre no puede estar vac\u00edo.")

        queryset = TipoProducto.objects.filter(nombre__iexact=nombre)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Ya existe un tipo de producto con ese nombre.")

        return nombre

    def validate(self, attrs):
        activo = attrs.get("activo")
        if activo is not None:
            attrs["estado"] = (
                TipoProducto.ESTADO_ACTIVO if activo else TipoProducto.ESTADO_INACTIVO
            )
        return attrs

    def update(self, instance: TipoProducto, validated_data):
        instance.nombre = validated_data.get("nombre", instance.nombre)

        if "descripcion" in validated_data:
            instance.descripcion = validated_data.get("descripcion") or ""

        if "estado" in validated_data:
            instance.estado = validated_data["estado"]

        instance.save()
        return instance


class TipoProductoEstadoUpdateSerializer(serializers.Serializer):
    activo = serializers.BooleanField()

    def update(self, instance: TipoProducto, validated_data):
        activo = validated_data["activo"]
        nuevo_estado = TipoProducto.ESTADO_ACTIVO if activo else TipoProducto.ESTADO_INACTIVO

        if instance.estado != nuevo_estado:
            instance.estado = nuevo_estado

        instance.save(update_fields=["estado"])

        producto_model = self._get_producto_model()
        if producto_model is not None:
            producto_model.objects.filter(tipo_producto=instance).update(estado=nuevo_estado)

        return instance

    def _get_producto_model(self):
        try:
            return django_apps.get_model("products", "Producto")
        except LookupError:
            return None
