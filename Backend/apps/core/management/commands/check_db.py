from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from django.db.utils import OperationalError


class Command(BaseCommand):
    help = "Verifica la conexion al motor configurado en DATABASES."

    def handle(self, *args, **options):
        try:
            connection.ensure_connection()
        except OperationalError as exc:
            raise CommandError(f"No se pudo conectar a la base de datos: {exc!s}") from exc

        if not connection.is_usable():
            raise CommandError("La conexion se establecio pero no esta utilizable.")

        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()

        self.stdout.write(self.style.SUCCESS("Conexion a la base de datos verificada correctamente."))
