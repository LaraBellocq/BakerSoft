from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),

    # Exponer /api/ping/ desde core/urls.py
    path("", include(("apps.core.urls", "core"))),

    # Prefijo único v1: cada app define sus subrutas SIN "api/v1/" adentro
    path("api/v1/", include(("apps.accounts.urls", "accounts"), namespace="v1-accounts")),
    path("api/v1/", include(("apps.core.urls", "core"), namespace="v1-core")),
    path("api/v1/", include(("apps.products.urls", "products"), namespace="v1-products")),
]
