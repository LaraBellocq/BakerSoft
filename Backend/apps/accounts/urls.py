from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ForgotPasswordView,
    LoginView,
    RegisterView,
    ResetPasswordValidateView,
    ResetPasswordView,
)

app_name = "accounts"

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/password/forgot/", ForgotPasswordView.as_view(), name="auth-password-forgot"),
    path("auth/password/reset/validate/", ResetPasswordValidateView.as_view(), name="auth-password-reset-validate"),
    path("auth/password/reset/", ResetPasswordView.as_view(), name="auth-password-reset"),
]
