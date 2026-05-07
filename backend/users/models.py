"""
FFZone – Custom User Model
Extends AbstractUser; extra fields stored in MongoDB via users app views.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Django auth user – used for session/JWT only.
    Full profile (uid, rank, badges, etc.) stored in MongoDB users collection.
    """
    phone = models.CharField(max_length=15, blank=True, null=True, unique=True)
    is_banned = models.BooleanField(default=False)
    is_admin_user = models.BooleanField(default=False)  # FFZone admin flag

    class Meta:
        db_table = "ffzone_users"

    def __str__(self):
        return self.email or self.username
