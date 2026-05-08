"""
FFZone – Root URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

from django.views.static import serve
import re

urlpatterns = [
    # Django admin (for superuser management)
    path("django-admin/", admin.site.urls),

    # JWT refresh (access tokens issued by custom login view)
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # App routers
    path("api/auth/", include("users.urls")),
    path("api/tournaments/", include("tournaments.urls")),
    path("api/payments/", include("payments.urls")),

    # Serve media files even in production
    path('media/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
]
