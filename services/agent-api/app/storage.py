import os
from pathlib import Path

from google.cloud import storage as gcs

from .config import FIREBASE_STORAGE_BUCKET, LOCAL_IMAGE_PATH

_storage_client: gcs.Client | None = None


def get_storage_client() -> gcs.Client:
    global _storage_client
    if _storage_client is None:
        _storage_client = gcs.Client()
    return _storage_client


def download_image_bytes(storage_path: str) -> bytes:
    if LOCAL_IMAGE_PATH and os.path.exists(LOCAL_IMAGE_PATH):
        with open(LOCAL_IMAGE_PATH, "rb") as f:
            return f.read()

    if not FIREBASE_STORAGE_BUCKET:
        raise RuntimeError("FIREBASE_STORAGE_BUCKET is not set")

    client = get_storage_client()
    bucket = client.bucket(FIREBASE_STORAGE_BUCKET)
    blob = bucket.blob(storage_path)
    return blob.download_as_bytes()
