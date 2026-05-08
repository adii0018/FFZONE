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
        try:
            if not settings.MONGO_URI:
                raise ValueError("MONGO_URI is not set in environment variables!")
            
            _client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
            # Ensure connection is valid
            _client.admin.command('ping')
            
            _db = _client[settings.MONGO_DB_NAME]
            _ensure_indexes(_db)
            print("Successfully connected to MongoDB Atlas")
        except Exception as e:
            print(f"CRITICAL: Failed to connect to MongoDB! Error: {e}")
            print(f"Used MONGO_URI starting with: {settings.MONGO_URI[:25]}...")
            _db = None
            # We raise a custom exception that can be caught in views
            raise ConnectionError(f"Database connection failed. Please check if your IP is whitelisted in MongoDB Atlas. Error: {str(e)}")
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
