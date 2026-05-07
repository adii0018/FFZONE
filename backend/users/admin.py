"""FFZone – Register User model with Django admin"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class FFZoneUserAdmin(UserAdmin):
    list_display  = ("email", "first_name", "is_admin_user", "is_banned", "is_active")
    list_filter   = ("is_admin_user", "is_banned", "is_active")
    search_fields = ("email", "first_name", "phone")
    ordering      = ("-date_joined",)
    fieldsets     = UserAdmin.fieldsets + (
        ("FFZone", {"fields": ("phone", "is_admin_user", "is_banned")}),
    )
