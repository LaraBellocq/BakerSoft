from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="TipoProducto",
            fields=[
                (
                    "id_tipoproducto",
                    models.AutoField(
                        primary_key=True,
                        serialize=False,
                        db_column="id_TipoProducto",
                    ),
                ),
                (
                    "nombre",
                    models.CharField(
                        max_length=50,
                        unique=True,
                        db_column="nombre_TP",
                    ),
                ),
                (
                    "descripcion",
                    models.CharField(
                        max_length=255,
                        blank=True,
                        default="",
                        db_column="descripcion_TP",
                    ),
                ),
                (
                    "estado",
                    models.CharField(
                        max_length=8,
                        choices=[("Activo", "Activo"), ("Inactivo", "Inactivo")],
                        default="Activo",
                        db_column="estado",
                    ),
                ),
            ],
            options={
                "db_table": "TipoProducto",
                "ordering": ["nombre"],
                "verbose_name": "Tipo de producto",
                "verbose_name_plural": "Tipos de producto",
            },
        ),
    ]
