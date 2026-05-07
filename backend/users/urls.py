"""
FFZone – Users URL Routes
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path("register/",        views.register,             name="register"),
    path("login/",           views.login,                name="login"),
    path("logout/",          views.logout_view,          name="logout"),
    path("token/refresh/",   TokenRefreshView.as_view(), name="token_refresh"),

    # Profile
    path("profile/",         views.my_profile,           name="my_profile"),
    path("profile/update/",  views.update_profile,       name="update_profile"),
    path("profile/<int:user_id>/", views.public_profile,  name="public_profile"),

    # Notifications
    path("notifications/",      views.my_notifications,        name="my_notifications"),
    path("notifications/read/", views.mark_notifications_read, name="mark_read"),

    # Admin – Players
    path("admin/players/",               views.admin_list_players, name="admin_players"),
    path("admin/players/<int:user_id>/ban/",  views.admin_ban_player,  name="admin_ban"),
    path("admin/players/<int:user_id>/warn/", views.admin_warn_player, name="admin_warn"),
]
