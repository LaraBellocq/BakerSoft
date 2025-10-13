﻿from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import LoginView, RegisterView

app_name = "accounts"

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
]
