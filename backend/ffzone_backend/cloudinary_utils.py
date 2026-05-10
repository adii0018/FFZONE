"""
FFZone – Cloudinary Upload Helper
Replaces local default_storage for media uploads.
All images (banners, screenshots, avatars) go to Cloudinary.
"""

import os
import cloudinary
import cloudinary.uploader
from django.conf import settings

# Configure Cloudinary from env vars
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


def upload_image(file, folder: str) -> str:
    """
    Upload a file-like object to Cloudinary.
    Returns the secure HTTPS URL of the uploaded image.

    :param file: Django InMemoryUploadedFile or similar
    :param folder: Cloudinary folder name e.g. 'banners', 'screenshots', 'avatars'
    """
    result = cloudinary.uploader.upload(
        file,
        folder=f"ffzone/{folder}",
        resource_type="image",
        overwrite=False,
    )
    return result["secure_url"]


def delete_image(public_id: str) -> None:
    """Delete an image from Cloudinary by its public_id (optional cleanup)."""
    try:
        cloudinary.uploader.destroy(public_id)
    except Exception:
        pass
        