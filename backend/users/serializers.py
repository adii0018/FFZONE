"""
FFZone – Users App Serializers
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    name       = serializers.CharField(max_length=100)
    email      = serializers.EmailField()
    phone      = serializers.CharField(max_length=15)
    password   = serializers.CharField(min_length=6, write_only=True)
    uid        = serializers.CharField(max_length=20)   # Free Fire UID


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ProfileUpdateSerializer(serializers.Serializer):
    name     = serializers.CharField(max_length=100, required=False)
    uid      = serializers.CharField(max_length=20, required=False)
    phone    = serializers.CharField(max_length=15, required=False)
    avatar   = serializers.ImageField(required=False)


class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class UserPublicSerializer(serializers.Serializer):
    """Lightweight profile for public display."""
    id         = serializers.CharField()
    name       = serializers.CharField()
    uid        = serializers.CharField()
    rank       = serializers.CharField()
    badges     = serializers.ListField()
    avatar_url = serializers.CharField()
    kills      = serializers.IntegerField()
    wins       = serializers.IntegerField()
    matches    = serializers.IntegerField()
