from django.http import JsonResponse


def ping(request):
    """Simple health-check endpoint returning a static payload."""
    return JsonResponse({"status": "ok"})
