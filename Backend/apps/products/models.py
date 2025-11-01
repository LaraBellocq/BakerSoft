from django.db import models

from apps.common.mixins import TimeStampedModel


class ProductType(TimeStampedModel):
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ["nombre"]
        verbose_name = "Tipo de producto"
        verbose_name_plural = "Tipos de producto"

    def __str__(self) -> str:
        return f"{self.nombre} ({self.codigo})"
