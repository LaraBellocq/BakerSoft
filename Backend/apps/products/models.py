from django.db import models


class TipoProducto(models.Model):
    ESTADO_ACTIVO = "Activo"
    ESTADO_INACTIVO = "Inactivo"
    ESTADO_CHOICES = (
        (ESTADO_ACTIVO, "Activo"),
        (ESTADO_INACTIVO, "Inactivo"),
    )

    id_tipoproducto = models.AutoField(
        primary_key=True,
        db_column="id_TipoProducto",
    )
    nombre = models.CharField(
        max_length=50,
        unique=True,
        db_column="nombre_TP",
    )
    descripcion = models.CharField(
        max_length=255,
        blank=True,
        default="",
        db_column="descripcion_TP",
    )
    estado = models.CharField(
        max_length=8,
        choices=ESTADO_CHOICES,
        default=ESTADO_ACTIVO,
        db_column="estado",
    )

    class Meta:
        db_table = "TipoProducto"
        ordering = ["nombre"]
        verbose_name = "Tipo de producto"
        verbose_name_plural = "Tipos de producto"

    def __str__(self) -> str:
        return f"{self.nombre} ({self.estado})"
