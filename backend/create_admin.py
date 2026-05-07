"""
FFZone – Create admin superuser automatically (run once).
Usage: python manage.py shell < create_admin.py
   OR: python create_admin.py  (with Django settings configured)
"""

import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ffzone_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from ffzone_backend.db import get_db
from datetime import datetime

User = get_user_model()

email    = 'admin@ffzone.com'
password = 'admin@123'

if not User.objects.filter(email=email).exists():
    user = User.objects.create_superuser(
        username=email,
        email=email,
        password=password,
        first_name='FFZone',
        is_admin_user=True,
    )
    # Also add to MongoDB users collection
    db = get_db()
    if not db.users.find_one({'email': email}):
        db.users.insert_one({
            'django_id':  user.id,
            'name':       'FFZone Admin',
            'email':      email,
            'phone':      '9999999999',
            'uid':        'ADMIN001',
            'rank':       'Diamond',
            'badges':     ['Founder', 'Admin'],
            'kills':      0,
            'wins':       0,
            'matches':    0,
            'avatar_url': '',
            'is_banned':  False,
            'is_admin':   True,
            'created_at': datetime.utcnow(),
        })
    print(f'✅ Admin created: {email} / {password}')
else:
    print('ℹ️  Admin already exists.')
