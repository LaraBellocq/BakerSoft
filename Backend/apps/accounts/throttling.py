from django.conf import settings
from rest_framework.throttling import SimpleRateThrottle

from apps.common.request import get_client_ip


class LoginIPRateThrottle(SimpleRateThrottle):
    scope = "login_ip"

    def get_rate(self):
        return settings.SECURITY_LOGIN_IP_RATE

    def get_cache_key(self, request, view):
        ident = get_client_ip(request)
        if not ident:
            return None
        return f"login:ip:{ident}"
