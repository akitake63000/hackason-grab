from __future__ import annotations

from dataclasses import dataclass
import io

import numpy as np
from PIL import Image, ImageFilter


@dataclass
class QualityInfo:
    score: float
    warnings: list[str]


@dataclass
class DensityResult:
    density_index: float
    quality: QualityInfo
    roi: dict[str, float]


def _roi_from_preset(height: int, width: int, preset: str | None) -> tuple[int, int, int, int]:
    if preset == "crown":
        x = int(width * 0.2)
        y = int(height * 0.15)
        w = int(width * 0.6)
        h = int(height * 0.6)
        return x, y, w, h

    x = int(width * 0.2)
    y = int(height * 0.2)
    w = int(width * 0.6)
    h = int(height * 0.6)
    return x, y, w, h


def _quality_from_gray(gray: np.ndarray) -> QualityInfo:
    warnings: list[str] = []
    mean_brightness = float(np.mean(gray))
    # 簡易ブラー指標（隣接差分の分散）でMVP判定
    diff_x = np.diff(gray.astype(np.float32), axis=1)
    diff_y = np.diff(gray.astype(np.float32), axis=0)
    blur_value = float(np.var(diff_x) + np.var(diff_y))

    if mean_brightness < 70:
        warnings.append("low_light")
    if mean_brightness > 200:
        warnings.append("overexposed")
    if blur_value < 80:
        warnings.append("blur")

    score = max(0.0, 1.0 - 0.2 * len(warnings))
    return QualityInfo(score=score, warnings=warnings)


def compute_density_index(image_bytes: bytes, preset: str | None) -> DensityResult:
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:  # noqa: BLE001
        raise ValueError("Invalid image data") from exc

    width, height = image.size
    x, y, w, h = _roi_from_preset(height, width, preset)
    roi = image.crop((x, y, x + w, y + h))

    gray_image = roi.convert("L").filter(ImageFilter.GaussianBlur(radius=2))
    gray = np.array(gray_image, dtype=np.uint8)

    # Otsuの代わりに中央値で簡易二値化
    threshold = int(np.median(gray))
    mask = gray < threshold
    hair_pixels = int(np.count_nonzero(mask))
    total_pixels = mask.size
    density_index = float(hair_pixels / total_pixels) if total_pixels else 0.0

    quality = _quality_from_gray(gray)
    roi_norm = {
        "x": x / width,
        "y": y / height,
        "w": w / width,
        "h": h / height,
    }

    return DensityResult(density_index=density_index, quality=quality, roi=roi_norm)
