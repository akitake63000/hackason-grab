import os

FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "")
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "")
LOCAL_IMAGE_PATH = os.getenv("LOCAL_IMAGE_PATH", "")
DEBUG_AUTH = os.getenv("DEBUG_AUTH", "false").lower() == "true"
