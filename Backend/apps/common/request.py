"""Request helper utilities."""

from typing import Optional


def get_client_ip(request) -> str:
    """Return best-effort client IP using X-Forwarded-For then REMOTE_ADDR."""
    x_forwarded_for: Optional[str] = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
        if ip:
            return ip
    return request.META.get("REMOTE_ADDR", "") or ""
