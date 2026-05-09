"""
FFZone – Tournaments App Views
All tournament data stored in MongoDB Atlas.
Covers: CRUD, registrations, team-finder, results, analytics.
"""

from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.conf import settings

from ffzone_backend.db import get_db
from ffzone_backend.cloudinary_utils import upload_image


# ── Helpers ───────────────────────────────────────────────────────────────────

def _oid(id_str):
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        return None


def _fmt(doc):
    """Serialize a MongoDB document to JSON-safe dict."""
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


def _fmt_list(docs):
    return [_fmt(d) for d in docs]


# ── Public – List & Filter Tournaments ───────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def list_tournaments(request):
    """
    GET /api/tournaments/
    Query params: status, mode, map, page
    """
    db     = get_db()
    query  = {}
    status_filter = request.GET.get("status")
    mode_filter   = request.GET.get("mode")
    map_filter    = request.GET.get("map")

    if status_filter:
        query["status"] = status_filter
    if mode_filter:
        query["mode"] = mode_filter
    if map_filter:
        query["map"] = map_filter

    page  = int(request.GET.get("page", 1))
    limit = 12
    skip  = (page - 1) * limit

    total       = db.tournaments.count_documents(query)
    tournaments = list(
        db.tournaments.find(query, {"room_id": 0, "room_password": 0})
        .sort("start_time", 1)
        .skip(skip)
        .limit(limit)
    )

    # Attach filled_slots count
    for t in tournaments:
        t["filled_slots"] = db.registrations.count_documents({
            "tournament_id": str(t["_id"]),
            "status": "approved",
        })
        _fmt(t)

    return Response({"tournaments": tournaments, "total": total, "page": page})


@api_view(["GET"])
@permission_classes([AllowAny])
def tournament_detail(request, tournament_id):
    """GET /api/tournaments/<id>/"""
    db  = get_db()
    oid = _oid(tournament_id)
    if not oid:
        return Response({"error": "Invalid tournament ID."}, status=400)

    t = db.tournaments.find_one({"_id": oid})
    if not t:
        return Response({"error": "Tournament not found."}, status=404)

    # Hide room info from unapproved/non-authenticated users
    hide_room = True
    if request.user and request.user.is_authenticated:
        reg = db.registrations.find_one({
            "tournament_id": tournament_id,
            "user_id":       request.user.id,
            "status":        "approved",
        })
        hide_room = reg is None

    if hide_room:
        t.pop("room_id",       None)
        t.pop("room_password", None)

    t["filled_slots"] = db.registrations.count_documents({
        "tournament_id": tournament_id,
        "status": "approved",
    })

    _fmt(t)
    return Response(t)


# ── Admin – Create / Edit Tournament ─────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_tournament(request):
    """Admin: create a new tournament."""
    if request.user.email != settings.ADMIN_EMAIL:
        return Response({"error": "Admin access required."}, status=403)

    data = request.data
    required = ["title", "mode", "map", "entry_fee", "prize_pool", "max_slots", "start_time"]
    for field in required:
        if field not in data:
            return Response({"error": f"'{field}' is required."}, status=400)

    # Handle banner upload
    banner_url = ""
    if request.FILES.get("banner"):
        banner_url = upload_image(request.FILES["banner"], "banners")

    db  = get_db()
    doc = {
        "title":       data["title"],
        "mode":        data["mode"],        # Solo | Duo | Squad
        "map":         data["map"],         # Bermuda | Purgatory | Kalahari
        "entry_fee":   int(data["entry_fee"]),
        "prize_pool":  int(data["prize_pool"]),
        "max_slots":   int(data["max_slots"]),
        "start_time":  data["start_time"],
        "rules":       data.get("rules", ""),
        "banner":      banner_url,
        "status":      "upcoming",          # upcoming | live | completed | cancelled
        "room_id":     "",
        "room_password": "",
        "created_by":  request.user.id,
        "created_at":  datetime.utcnow(),
    }
    result = db.tournaments.insert_one(doc)
    return Response({"message": "Tournament created.", "id": str(result.inserted_id)}, status=201)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def update_tournament(request, tournament_id):
    """Admin: update tournament details or status."""
    if request.user.email != settings.ADMIN_EMAIL:
        return Response({"error": "Admin access required."}, status=403)

    db  = get_db()
    oid = _oid(tournament_id)
    if not oid:
        return Response({"error": "Invalid ID."}, status=400)

    update = {}
    allowed = ["title", "mode", "map", "entry_fee", "prize_pool", "max_slots",
               "start_time", "rules", "status"]
    for field in allowed:
        if field in request.data:
            val = request.data[field]
            update[field] = int(val) if field in ["entry_fee", "prize_pool", "max_slots"] else val

    if request.FILES.get("banner"):
        update["banner"] = upload_image(request.FILES["banner"], "banners")

    db.tournaments.update_one({"_id": oid}, {"$set": update})
    return Response({"message": "Tournament updated."})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_tournament(request, tournament_id):
    """Admin: delete a tournament."""
    if request.user.email != settings.ADMIN_EMAIL:
        return Response({"error": "Admin access required."}, status=403)

    db  = get_db()
    oid = _oid(tournament_id)
    db.tournaments.delete_one({"_id": oid})
    return Response({"message": "Tournament deleted."})


# ── Admin – Room ID Broadcast ─────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_room_info(request, tournament_id):
    """
    Admin: set Room ID & Password, auto-notify all approved players.
    """
    if request.user.email != settings.ADMIN_EMAIL:
        return Response({"error": "Admin access required."}, status=403)

    room_id  = request.data.get("room_id", "")
    room_pwd = request.data.get("room_password", "")

    if not room_id or not room_pwd:
        return Response({"error": "Room ID and password are required."}, status=400)

    db  = get_db()
    oid = _oid(tournament_id)
    t   = db.tournaments.find_one({"_id": oid}, {"title": 1})
    if not t:
        return Response({"error": "Tournament not found."}, status=404)

    db.tournaments.update_one(
        {"_id": oid},
        {"$set": {"room_id": room_id, "room_password": room_pwd}},
    )

    # Notify all approved players
    approved = db.registrations.find({"tournament_id": tournament_id, "status": "approved"})
    notifications = []
    for reg in approved:
        notifications.append({
            "user_id":    reg["user_id"],
            "message":    f"🎮 Room ID & Password released for '{t['title']}'! Room: {room_id} | Pass: {room_pwd}",
            "type":       "room_broadcast",
            "read":       False,
            "created_at": datetime.utcnow(),
        })

    if notifications:
        db.notifications.insert_many(notifications)

    return Response({"message": f"Room info set and broadcasted to {len(notifications)} players."})


# ── Registrations ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_registrations(request):
    """Player: list all tournaments they have registered for."""
    db    = get_db()
    regs  = list(db.registrations.find({"user_id": request.user.id}).sort("created_at", -1))

    for reg in regs:
        reg["_id"] = str(reg["_id"])
        # Fetch tournament details
        t = db.tournaments.find_one({"_id": _oid(reg["tournament_id"])})
        if t:
            reg["tournament"] = {
                "id":         str(t["_id"]),
                "title":      t.get("title"),
                "mode":       t.get("mode"),
                "map":        t.get("map"),
                "status":     t.get("status"),
                "start_time": t.get("start_time"),
                "prize_pool": t.get("prize_pool"),
                "banner":     t.get("banner", ""),
                # Room info only for approved players
                "room_id":       t.get("room_id", "") if reg.get("status") == "approved" else "",
                "room_password": t.get("room_password", "") if reg.get("status") == "approved" else "",
            }

    return Response(regs)


# ── Team Finder ───────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def list_team_finder(request):
    """Browse open team-finder posts."""
    db      = get_db()
    mode    = request.GET.get("mode")
    t_id    = request.GET.get("tournament_id")
    query   = {"is_filled": False}
    if mode:  query["mode"] = mode
    if t_id:  query["tournament_id"] = t_id

    posts = list(db.team_finder.find(query).sort("created_at", -1).limit(50))
    return Response(_fmt_list(posts))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_team_finder(request):
    """Player: post a team-finder request."""
    data = request.data
    db   = get_db()
    doc  = {
        "user_id":       request.user.id,
        "user_name":     request.user.first_name,
        "tournament_id": data.get("tournament_id", ""),
        "mode":          data.get("mode", "Squad"),
        "message":       data.get("message", ""),
        "is_filled":     False,
        "created_at":    datetime.utcnow(),
    }
    result = db.team_finder.insert_one(doc)
    return Response({"message": "Post created.", "id": str(result.inserted_id)}, status=201)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_team_filled(request, post_id):
    """Player: mark their team post as filled."""
    db  = get_db()
    oid = _oid(post_id)
    db.team_finder.update_one(
        {"_id": oid, "user_id": request.user.id},
        {"$set": {"is_filled": True}},
    )
    return Response({"message": "Team post marked as filled."})


# ── Match Results ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def tournament_results(request, tournament_id):
    """Public leaderboard for a tournament."""
    db      = get_db()
    results = list(
        db.results.find({"tournament_id": tournament_id})
        .sort([("kills", -1), ("rank", 1)])
    )
    return Response(_fmt_list(results))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_results(request, tournament_id):
    """Admin: bulk-submit kills and rankings."""
    if request.user.email != settings.ADMIN_EMAIL:
        return Response({"error": "Admin access required."}, status=403)

    entries = request.data.get("results", [])  # [{user_id, kills, rank, prize_won}]
    db      = get_db()
    t       = db.tournaments.find_one({"_id": _oid(tournament_id)}, {"title": 1})
    if not t:
        return Response({"error": "Tournament not found."}, status=404)

    for entry in entries:
        uid  = int(entry["user_id"])
        doc  = {
            "tournament_id": tournament_id,
            "user_id":       uid,
            "kills":         int(entry.get("kills", 0)),
            "rank":          int(entry.get("rank", 0)),
            "prize_won":     int(entry.get("prize_won", 0)),
            "updated_at":    datetime.utcnow(),
        }
        db.results.update_one(
            {"tournament_id": tournament_id, "user_id": uid},
            {"$set": doc},
            upsert=True,
        )

        # Update player's aggregate stats
        db.users.update_one(
            {"django_id": uid},
            {"$inc": {"kills": doc["kills"], "matches": 1}},
        )
        if doc["rank"] == 1:
            db.users.update_one({"django_id": uid}, {"$inc": {"wins": 1}})

        # Recalculate rank
        player = db.users.find_one({"django_id": uid})
        if player:
            from users.views import _rank_from_stats
            new_rank = _rank_from_stats(player.get("kills", 0), player.get("wins", 0))
            db.users.update_one({"django_id": uid}, {"$set": {"rank": new_rank}})

        # Notify prize winners
        if doc["prize_won"] > 0:
            db.notifications.insert_one({
                "user_id":    uid,
                "message":    f"🏆 You won ₹{doc['prize_won']} in '{t['title']}'! Congrats!",
                "type":       "prize",
                "read":       False,
                "created_at": datetime.utcnow(),
            })

    # Mark tournament as completed
    db.tournaments.update_one(
        {"_id": _oid(tournament_id)},
        {"$set": {"status": "completed"}},
    )

    return Response({"message": f"Results submitted for {len(entries)} players."})


# ── Public Stats ──────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def public_stats(request):
    """
    Public: platform-wide stats for the landing page badge.
    GET /api/tournaments/public-stats/
    """
    db = get_db()
    total_tournaments = db.tournaments.count_documents({})
    total_players     = db.users.count_documents({"is_admin": False})
    live_tournaments  = db.tournaments.count_documents({"status": "live"})

    # Total prize pool distributed (sum of prize_pool of completed tournaments)
    pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$prize_pool"}}},
    ]
    prize_result  = list(db.tournaments.aggregate(pipeline))
    total_prizes  = prize_result[0]["total"] if prize_result else 0

    return Response({
        "total_tournaments": total_tournaments,
        "total_players":     total_players,
        "live_tournaments":  live_tournaments,
        "total_prizes":      total_prizes,
    })


# ── Admin Analytics ───────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """Admin: global stats for the dashboard."""
    if request.user.email != settings.ADMIN_EMAIL:
        return Response({"error": "Admin access required."}, status=403)

    db = get_db()
    total_tournaments     = db.tournaments.count_documents({})
    live_tournaments      = db.tournaments.count_documents({"status": "live"})
    total_registrations   = db.registrations.count_documents({})
    pending_approvals     = db.registrations.count_documents({"status": "pending"})
    total_players         = db.users.count_documents({"is_admin": False})

    # Revenue = sum of entry_fees of all approved registrations
    pipeline = [
        {"$match": {"status": "approved"}},
        {"$lookup": {
            "from":         "tournaments",
            "localField":   "tournament_id",
            "foreignField": "_id",
            "as":           "t",
        }},
        {"$unwind": "$t"},
        {"$group": {"_id": None, "revenue": {"$sum": "$t.entry_fee"}}},
    ]
    revenue_result = list(db.registrations.aggregate(pipeline))
    total_revenue  = revenue_result[0]["revenue"] if revenue_result else 0

    # Per-tournament joins (last 10 tournaments)
    recent = list(db.tournaments.find({}).sort("created_at", -1).limit(10))
    chart_data = []
    for t in recent:
        t_id  = str(t["_id"])
        joins = db.registrations.count_documents({"tournament_id": t_id, "status": "approved"})
        chart_data.append({
            "title": t.get("title", "")[:20],
            "joins": joins,
            "revenue": joins * t.get("entry_fee", 0),
        })

    return Response({
        "total_tournaments":   total_tournaments,
        "live_tournaments":    live_tournaments,
        "total_registrations": total_registrations,
        "pending_approvals":   pending_approvals,
        "total_players":       total_players,
        "total_revenue":       total_revenue,
        "chart_data":          chart_data,
    })
