"""
FFZone – Payments App Views
Handles: QR screenshot upload, Razorpay order + webhook, admin approval/rejection.
"""

import hmac
import hashlib
import uuid
from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId

from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response

from ffzone_backend.db import get_db

try:
    import razorpay
    rz_client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )
except Exception:
    rz_client = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _oid(id_str):
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        return None


def _fmt(doc):
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc


# ── QR / Manual Payment ───────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def submit_qr_payment(request, tournament_id):
    """
    Player submits QR payment proof.
    Uploads screenshot, stores registration with status='pending'.
    """
    db = get_db()
    user_id = request.user.id

    # Duplicate check
    existing = db.registrations.find_one({
        "tournament_id": tournament_id,
        "user_id":       user_id,
    })
    if existing:
        return Response({"error": "You have already registered for this tournament."}, status=400)

    # Tournament must exist and have open slots
    t = db.tournaments.find_one({"_id": _oid(tournament_id)})
    if not t:
        return Response({"error": "Tournament not found."}, status=404)
    if t.get("status") not in ("upcoming", "live"):
        return Response({"error": "Tournament is not accepting registrations."}, status=400)

    filled = db.registrations.count_documents({
        "tournament_id": tournament_id, "status": "approved"
    })
    if filled >= t.get("max_slots", 0):
        return Response({"error": "Tournament is full."}, status=400)

    transaction_id = request.data.get("transaction_id", "")
    if not transaction_id:
        return Response({"error": "Transaction ID is required."}, status=400)

    # Duplicate transaction ID check
    dup = db.registrations.find_one({"transaction_id": transaction_id})
    if dup:
        return Response({"error": "This transaction ID has already been used."}, status=400)

    # Upload screenshot
    screenshot_url = ""
    if request.FILES.get("screenshot"):
        ss   = request.FILES["screenshot"]
        path = default_storage.save(f"screenshots/{uuid.uuid4()}_{ss.name}", ss)
        screenshot_url = f"/media/{path}"
    else:
        return Response({"error": "Payment screenshot is required."}, status=400)

    # Create registration doc
    doc = {
        "user_id":        user_id,
        "user_name":      request.user.first_name,
        "tournament_id":  tournament_id,
        "payment_method": "qr",
        "transaction_id": transaction_id,
        "screenshot":     screenshot_url,
        "status":         "pending",    # pending | approved | rejected
        "approved_at":    None,
        "created_at":     datetime.utcnow(),
    }
    result = db.registrations.insert_one(doc)

    # Notify admin (store generic admin notification)
    db.notifications.insert_one({
        "user_id":    0,              # 0 = admin notification
        "message":    f"New payment proof submitted by {request.user.first_name} for '{t.get('title')}'",
        "type":       "payment_proof",
        "read":       False,
        "created_at": datetime.utcnow(),
    })

    return Response({
        "message": "Payment proof submitted. Awaiting admin approval.",
        "registration_id": str(result.inserted_id),
    }, status=201)


# ── Razorpay Payment ──────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_razorpay_order(request, tournament_id):
    """Create a Razorpay order for the tournament entry fee."""
    if not rz_client:
        return Response({"error": "Razorpay not configured."}, status=503)

    db = get_db()
    user_id = request.user.id

    # Duplicate check
    existing = db.registrations.find_one({
        "tournament_id": tournament_id,
        "user_id":       user_id,
    })
    if existing:
        return Response({"error": "Already registered."}, status=400)

    t = db.tournaments.find_one({"_id": _oid(tournament_id)})
    if not t:
        return Response({"error": "Tournament not found."}, status=404)

    amount_paise = t["entry_fee"] * 100  # Razorpay uses paise
    order = rz_client.order.create({
        "amount":   amount_paise,
        "currency": "INR",
        "notes":    {"tournament_id": tournament_id, "user_id": str(user_id)},
    })

    return Response({
        "order_id":   order["id"],
        "amount":     amount_paise,
        "currency":   "INR",
        "key":        settings.RAZORPAY_KEY_ID,
        "tournament": {"title": t["title"], "entry_fee": t["entry_fee"]},
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_razorpay_payment(request, tournament_id):
    """Verify Razorpay payment signature and auto-approve registration."""
    razorpay_order_id   = request.data.get("razorpay_order_id")
    razorpay_payment_id = request.data.get("razorpay_payment_id")
    razorpay_signature  = request.data.get("razorpay_signature")

    if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
        return Response({"error": "Incomplete payment data."}, status=400)

    # Verify signature
    msg = f"{razorpay_order_id}|{razorpay_payment_id}"
    expected_sig = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        msg.encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_sig, razorpay_signature):
        return Response({"error": "Invalid payment signature."}, status=400)

    db = get_db()
    t  = db.tournaments.find_one({"_id": _oid(tournament_id)})

    # Create auto-approved registration
    doc = {
        "user_id":        request.user.id,
        "user_name":      request.user.first_name,
        "tournament_id":  tournament_id,
        "payment_method": "razorpay",
        "transaction_id": razorpay_payment_id,
        "screenshot":     "",
        "status":         "approved",
        "approved_at":    datetime.utcnow(),
        "created_at":     datetime.utcnow(),
    }
    result = db.registrations.insert_one(doc)

    db.notifications.insert_one({
        "user_id":    request.user.id,
        "message":    f"✅ Payment confirmed for '{t.get('title', '')}'. You're in!",
        "type":       "payment_approved",
        "read":       False,
        "created_at": datetime.utcnow(),
    })

    return Response({
        "message": "Payment verified. You are registered!",
        "registration_id": str(result.inserted_id),
    })


# ── Admin – Approval Queue ────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_pending_payments(request):
    """Admin: list all pending payment proofs."""
    if not request.user.is_admin_user:
        return Response({"error": "Admin access required."}, status=403)

    db       = get_db()
    t_id     = request.GET.get("tournament_id")
    query    = {"status": "pending", "payment_method": "qr"}
    if t_id:
        query["tournament_id"] = t_id

    pending  = list(db.registrations.find(query).sort("created_at", 1))
    for p in pending:
        p["_id"] = str(p["_id"])
    return Response(pending)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_payment(request, registration_id):
    """Admin: approve a pending payment registration."""
    if not request.user.is_admin_user:
        return Response({"error": "Admin access required."}, status=403)

    db  = get_db()
    oid = _oid(registration_id)
    reg = db.registrations.find_one({"_id": oid})
    if not reg:
        return Response({"error": "Registration not found."}, status=404)

    db.registrations.update_one(
        {"_id": oid},
        {"$set": {"status": "approved", "approved_at": datetime.utcnow()}},
    )

    # Fetch tournament title for notification
    t = db.tournaments.find_one({"_id": _oid(reg["tournament_id"])}, {"title": 1})
    db.notifications.insert_one({
        "user_id":    reg["user_id"],
        "message":    f"✅ Your payment for '{t.get('title', 'tournament')}' was approved! Check My Matches for room info.",
        "type":       "payment_approved",
        "read":       False,
        "created_at": datetime.utcnow(),
    })

    return Response({"message": "Payment approved."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_payment(request, registration_id):
    """Admin: reject a pending payment registration."""
    if not request.user.is_admin_user:
        return Response({"error": "Admin access required."}, status=403)

    reason = request.data.get("reason", "Payment proof not valid.")
    db     = get_db()
    oid    = _oid(registration_id)
    reg    = db.registrations.find_one({"_id": oid})
    if not reg:
        return Response({"error": "Registration not found."}, status=404)

    db.registrations.update_one(
        {"_id": oid},
        {"$set": {"status": "rejected", "reject_reason": reason}},
    )

    t = db.tournaments.find_one({"_id": _oid(reg["tournament_id"])}, {"title": 1})
    db.notifications.insert_one({
        "user_id":    reg["user_id"],
        "message":    f"❌ Payment rejected for '{t.get('title', 'tournament')}'. Reason: {reason}",
        "type":       "payment_rejected",
        "read":       False,
        "created_at": datetime.utcnow(),
    })

    return Response({"message": "Payment rejected."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_registrations_for_tournament(request, tournament_id):
    """Admin: list all registrations for a tournament."""
    if not request.user.is_admin_user:
        return Response({"error": "Admin access required."}, status=403)

    db   = get_db()
    regs = list(db.registrations.find({"tournament_id": tournament_id}).sort("created_at", -1))
    for r in regs:
        r["_id"] = str(r["_id"])
    return Response(regs)
