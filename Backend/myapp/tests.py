from django.db import connection
from django.db.utils import OperationalError
from django.test import TestCase


class DatabaseConnectionTest(TestCase):
    def test_connection_is_usable(self):
        try:
            connection.ensure_connection()
        except OperationalError as exc:
            self.fail(f'Database connection failed: {exc!s}')
        self.assertTrue(connection.is_usable())

