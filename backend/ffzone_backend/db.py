"""
FFZone – MongoDB connection singleton.
All business data (tournaments, registrations, results, etc.) goes here.
Django's ORM is only used for auth user session management.
"""

from pymongo import MongoClient
from django.conf import settings


_client = None
_db = None


def get_db():
    """Return the MongoDB database instance (singleton)."""
    global _client, _db
    if _db is None:
        _client = MongoClient(settings.MONGO_URI)
        _db = _client[settings.MONGO_DB_NAME]
        _ensure_indexes(_db)
    return _db


def _ensure_indexes(db):
    """Create indexes for performance and uniqueness."""
    # Users
    db.users.create_index("email", unique=True)
    db.users.create_index("phone", unique=True)

    # Tournaments
    db.tournaments.create_index("status")
    db.tournaments.create_index("mode")
    db.tournaments.create_index("start_time")

    # Registrations – one registration per user per tournament
    db.registrations.create_index(
        [("user_id", 1), ("tournament_id", 1)], unique=True
    )
    db.registrations.create_index("status")

    # Results
    db.results.create_index([("tournament_id", 1), ("user_id", 1)], unique=True)

    # Team Finder
    db.team_finder.create_index("tournament_id")
    db.team_finder.create_index("mode")

    # Notifications
    db.notifications.create_index("user_id")
    db.notifications.create_index("read")
