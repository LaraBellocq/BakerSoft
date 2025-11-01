from django.http import JsonResponse

def ping(_request):
    return JsonResponse({"status": "ok"})

def api_v1_root(_request):
    return JsonResponse({
        "version": "v1",
        "endpoints": {
            "ping": "/api/ping/",
            "register": "/api/v1/auth/register/",
            "tipo-producto-create": "/api/v1/tipo-producto/",
            # "login": "/api/v1/auth/login/",  # cuando exista
        }
    })
