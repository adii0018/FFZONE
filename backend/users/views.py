"""
FFZone – Users App Views
Handles: Register (OTP), Login, Profile, OTP generation, Admin player management
All player profile data lives in MongoDB; Django auth model is auth-only.
"""

import random
import string
from datetime import datetime, timedelta

from django.contrib.auth import get_user_model, authenticate
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from ffzone_backend.db import get_db
from .serializers import RegisterSerializer, LoginSerializer, ProfileUpdateSerializer

User = get_user_model()


# ── Helper ────────────────────────────────────────────────────────────────────

def _rank_from_stats(kills: int, wins: int) -> str:
    score = kills + wins * 5
    if score < 20:   return "Bronze"
    if score < 60:   return "Silver"
    if score < 150:  return "Gold"
    if score < 300:  return "Platinum"
    return "Diamond"


def _tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access":  str(refresh.access_token),
    }


# ── Logout ────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Blacklist refresh token on logout."""
    try:
        token = RefreshToken(request.data.get("refresh"))
        token.blacklist()
    except Exception:
        pass
    return Response({"message": "Logged out."})


# ── Register ──────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """Register a new player with OTP verification."""
    ser = RegisterSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=400)

    data  = ser.validated_data
    email = data["email"]

    # Check duplicate email
    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already registered."}, status=400)

    # Create Django auth user
    user = User.objects.create_user(
        username=email,
        email=email,
        password=data["password"],
        phone=data["phone"],
        first_name=data["name"],
    )

    # Store extended profile in MongoDB
    try:
        db = get_db()
        db.users.insert_one({
            "django_id": user.id,
            "name":      data["name"],
            "email":     email,
            "phone":     data["phone"],
            "uid":       data["uid"],
            "rank":      "Bronze",
            "badges":    [],
            "kills":     0,
            "wins":      0,
            "matches":   0,
            "avatar_url": "",
            "is_banned":  False,
            "is_admin":   False,
            "created_at": datetime.utcnow(),
        })
    except Exception as e:
        # If MongoDB fails, we should probably delete the Django user to allow retry
        user.delete()
        return Response({"error": str(e)}, status=500)

    tokens = _tokens_for_user(user)
    return Response({"message": "Registration successful.", **tokens}, status=201)


# ── Login ─────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """Authenticate and return JWT tokens."""
    ser = LoginSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=400)

    user = authenticate(
        request,
        username=ser.validated_data["email"],
        password=ser.validated_data["password"],
    )
    if not user:
        return Response({"error": "Invalid credentials."}, status=401)

    if user.is_banned:
        return Response({"error": "Your account has been banned."}, status=403)

    try:
        db = get_db()
        profile = db.users.find_one({"django_id": user.id}, {"_id": 0})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

    tokens = _tokens_for_user(user)
    return Response({
        **tokens,
        "user": {
            "id":          user.id,
            "email":       user.email,
            "name":        user.first_name,
            "is_admin":    user.email == settings.ADMIN_EMAIL,
            "rank":        (profile or {}).get("rank", "Bronze"),
            "avatar_url":  (profile or {}).get("avatar_url", ""),
            "uid":         (profile or {}).get("uid", ""),
        }
    })


# ── Profile ───────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_profile(request):
    """Return the authenticated player's full profile."""
    db      = get_db()
    profile = db.users.find_one({"django_id": request.user.id})
    if not profile:
        return Response({"error": "Profile not found."}, status=404)

    profile["_id"] = str(profile["_id"])
    return Response(profile)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update player's name, UID, avatar."""
    db = get_db()
    update = {}
    if "name" in request.data:
        update["name"] = request.data["name"]
        request.user.first_name = request.data["name"]
        request.user.save()
    if "uid" in request.data:
        update["uid"] = request.data["uid"]
    if "phone" in request.data:
        update["phone"] = request.data["phone"]

    if request.FILES.get("avatar"):
        from django.core.files.storage import default_storage
        avatar = request.FILES["avatar"]
        path   = default_storage.save(f"avatars/{request.user.id}_{avatar.name}", avatar)
        update["avatar_url"] = f"/media/{path}"

    if update:
        db.users.update_one({"django_id": request.user.id}, {"$set": update})

    return Response({"message": "Profile updated."})


# ── Public Profile ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def public_profile(request, user_id):
    """Return a player's public profile."""
    db = get_db()
    try:
        profile = db.users.find_one({"django_id": int(user_id)})
    except ValueError:
        return Response({"error": "Invalid user ID."}, status=400)

    if not profile:
        return Response({"error": "User not found."}, status=404)

    # Return only public fields
    return Response({
        "id":         str(profile["_id"]),
        "name":       profile.get("name", ""),
        "uid":        profile.get("uid", ""),
        "rank":       profile.get("rank", "Bronze"),
        "badges":     profile.get("badges", []),
        "kills":      profile.get("kills", 0),
        "wins":       profile.get("wins", 0),
        "matches":    profile.get("matches", 0),
        "avatar_url": profile.get("avatar_url", ""),
    })


# ── Admin – Player Management ─────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_list_players(request):
    """Admin: list all players with pagination."""
    if request.user.email != settings.ADMIN_EMAIL:
        return Response({"error": "Admin access required."}, status=403)

    db      = get_db()
    players = list(db.users.find({}, {"password": 0}))
    for p in players:
        p["_id"] = str(p["_id"])
    return Response(players)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_ban_player(request, user_id):
    """Admin: ban or unban a player."""
    if request.user.email != settings.ADMIN_EMAIL:
        return Response({"error": "Admin access required."}, status=403)

    action = request.data.get("action", "ban")  # 'ban' or 'unban'
    banned = action == "ban"

    try:
        django_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    django_user.is_banned = banned
    django_user.save()

    db = get_db()
    db.users.update_one({"django_id": int(user_id)}, {"$set": {"is_banned": banned}})

    # Create notification for the player
    db.notifications.insert_one({
        "user_id":    int(user_id),
        "message":    f"Your account has been {'banned' if banned else 'reinstated'} by admin.",
        "type":       "ban",
        "read":       False,
        "created_at": datetime.utcnow(),
    })

    return Response({"message": f"Player {'banned' if banned else 'unbanned'}."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_warn_player(request, user_id):
    """Admin: send a warning notification to a player."""
    if request.user.email != settings.ADMIN_EMAIL:
        return Response({"error": "Admin access required."}, status=403)

    reason = request.data.get("reason", "Violation of tournament rules.")
    db     = get_db()
    db.notifications.insert_one({
        "user_id":    int(user_id),
        "message":    f"⚠️ Warning from admin: {reason}",
        "type":       "warning",
        "read":       False,
        "created_at": datetime.utcnow(),
    })
    return Response({"message": "Warning sent."})


# ── Notifications ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_notifications(request):
    """Return unread notifications for the authenticated user."""
    db    = get_db()
    notifs = list(db.notifications.find(
        {"user_id": request.user.id},
        sort=[("created_at", -1)],
    ).limit(50))
    for n in notifs:
        n["_id"] = str(n["_id"])
    return Response(notifs)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request):
    """Mark all notifications as read."""
    db = get_db()
    db.notifications.update_many(
        {"user_id": request.user.id, "read": False},
        {"$set": {"read": True}},
    )
    return Response({"message": "All notifications marked read."})
