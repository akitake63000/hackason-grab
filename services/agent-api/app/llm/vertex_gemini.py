import os
import re
import json
from typing import Any

from google import genai
from google.genai.types import HttpOptions

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_ENABLED = os.getenv("GEMINI_ENABLED", "true").lower() == "true"
GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "")
GOOGLE_CLOUD_LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "global")
USE_VERTEXAI = os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "false").lower() == "true"

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        if USE_VERTEXAI:
            _client = genai.Client(
                vertexai=True,
                project=GOOGLE_CLOUD_PROJECT,
                location=GOOGLE_CLOUD_LOCATION,
                http_options=HttpOptions(api_version="v1"),
            )
        else:
            _client = genai.Client(http_options=HttpOptions(api_version="v1"))
    return _client


def gemini_enabled() -> bool:
    return GEMINI_ENABLED and bool(GEMINI_MODEL)


def generate_text(prompt: str) -> str:
    client = _get_client()
    response = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
    return response.text or ""


def extract_json(text: str) -> dict[str, Any]:
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("No JSON object found in response")
    return json.loads(match.group(0))
