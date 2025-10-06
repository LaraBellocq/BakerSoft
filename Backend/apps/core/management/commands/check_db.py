from django.core.management.base import BaseCommand
from django.db import connections


class Command(BaseCommand):
    help = "Verifica conexion a la base de datos"

    def handle(self, *args, **kwargs):
        for alias in connections:
            conn = connections[alias]
            conn.cursor()
            self.stdout.write(self.style.SUCCESS(f"DB '{alias}' OK"))
