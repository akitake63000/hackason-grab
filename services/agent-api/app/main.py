from typing import List, Optional
import math
import uuid
from datetime import datetime, timedelta, timezone
import json
import re

import os

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import firestore as admin_firestore
from pydantic import BaseModel

from .analysis.hair_density import compute_density_index
from .auth import get_current_uid
from .firebase import get_firestore_client
from .storage import download_image_bytes
from .llm.vertex_gemini import gemini_enabled, generate_text, GEMINI_MODEL

app = FastAPI(title="HairGuard Agent API")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzePhotoRequest(BaseModel):
    photoId: str
    storagePath: str
    capturedAt: Optional[str] = None
    roiPreset: Optional[str] = None


class QualityInfo(BaseModel):
    score: float
    warnings: List[str]


class AnalyzePhotoResponse(BaseModel):
    densityIndex: float
    deltaVsPrev: float
    deltaVsBase: float
    quality: QualityInfo
    analysisId: str


class Location(BaseModel):
    lat: float
    lng: float
    accuracyM: Optional[float] = None


class FoodSniperRequest(BaseModel):
    message: str
    location: Optional[Location] = None
    radiusM: Optional[int] = 800


class FoodItem(BaseModel):
    name: str
    why: str


class StoreCandidate(BaseModel):
    name: str
    distanceM: Optional[int]
    confidence: float
    note: str


class FoodSniperResponse(BaseModel):
    items: List[FoodItem]
    stores: List[StoreCandidate]
    shoppingList: List[str]


class ReportGenerateRequest(BaseModel):
    periodDays: Optional[int] = 7


class ReportGenerateResponse(BaseModel):
    reportId: str
    highlights: List[str]
    nextActions: List[str]
    rawText: str


class MentalShieldRequest(BaseModel):
    threadId: Optional[str] = "default"
    message: str
    mode: Optional[str] = "balanced"


class MentalShieldCard(BaseModel):
    agent: str
    text: str


class MentalShieldResponse(BaseModel):
    cards: List[MentalShieldCard]
    summary: str
    threadId: str


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/v1/photos/analyze", response_model=AnalyzePhotoResponse)
def analyze_photo(
    payload: AnalyzePhotoRequest, uid: str = Depends(get_current_uid)
) -> AnalyzePhotoResponse:
    try:
        image_bytes = download_image_bytes(payload.storagePath)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Failed to load image") from exc

    try:
        result = compute_density_index(image_bytes, payload.roiPreset)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Failed to analyze image") from exc

    db = get_firestore_client()
    analysis_collection = (
        db.collection("analysisResults").document(uid).collection("items")
    )

    prev_docs = (
        analysis_collection.order_by(
            "computedAt", direction=admin_firestore.Query.DESCENDING
        )
        .limit(1)
        .get()
    )
    base_docs = (
        analysis_collection.order_by(
            "computedAt", direction=admin_firestore.Query.ASCENDING
        )
        .limit(1)
        .get()
    )

    prev_density = None
    if prev_docs:
        prev_density = prev_docs[0].to_dict().get("densityIndex")

    base_density = None
    if base_docs:
        base_density = base_docs[0].to_dict().get("densityIndex")

    delta_vs_prev = (
        float(result.density_index - prev_density)
        if prev_density is not None
        else 0.0
    )
    delta_vs_base = (
        float(result.density_index - base_density)
        if base_density is not None
        else 0.0
    )

    analysis_id = f"analysis_{payload.photoId}"

    analysis_collection.document(analysis_id).set(
        {
            "photoId": payload.photoId,
            "computedAt": admin_firestore.SERVER_TIMESTAMP,
            "roi": result.roi,
            "densityIndex": result.density_index,
            "deltaVsPrev": delta_vs_prev,
            "deltaVsBase": delta_vs_base,
            "quality": {
                "score": result.quality.score,
                "warnings": result.quality.warnings,
            },
            "method": "pil_threshold_v1",
        }
    )

    db.collection("photos").document(uid).collection("items").document(
        payload.photoId
    ).set({"status": "done"}, merge=True)

    return AnalyzePhotoResponse(
        densityIndex=result.density_index,
        deltaVsPrev=delta_vs_prev,
        deltaVsBase=delta_vs_base,
        quality=QualityInfo(
            score=result.quality.score, warnings=result.quality.warnings
        ),
        analysisId=analysis_id,
    )


def _haversine_distance_m(lat1: float, lng1: float, lat2: float, lng2: float) -> int:
    radius = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return int(radius * c)


def _extract_food_items(message: str) -> List[FoodItem]:
    catalog = [
        ("レバー", "鉄・ビタミンB群など（一般論）"),
        ("卵", "タンパク質とビオチンの補給（一般論）"),
        ("ナッツ", "ビタミンE・亜鉛（一般論）"),
        ("鮭", "タンパク質とオメガ3（一般論）"),
        ("納豆", "タンパク質・ミネラル（一般論）"),
        ("牡蠣", "亜鉛を意識しやすい（一般論）"),
        ("鶏むね", "高タンパクで続けやすい（一般論）"),
    ]

    items: List[FoodItem] = []
    for name, why in catalog:
        if name in message:
            items.append(FoodItem(name=name, why=why))

    if not items:
        items = [
            FoodItem(name="卵", why="タンパク質とビオチンの補給（一般論）"),
            FoodItem(name="ナッツ", why="ビタミンE・亜鉛（一般論）"),
        ]

    return items


def _build_store_candidates(
    location: Optional[Location], radius_m: int, items: List[FoodItem]
) -> List[StoreCandidate]:
    if location is None:
        return []

    dummy_stores = [
        {
            "name": "スーパーA",
            "lat": location.lat + 0.0012,
            "lng": location.lng + 0.0007,
            "type": "supermarket",
        },
        {
            "name": "コンビニB",
            "lat": location.lat - 0.0009,
            "lng": location.lng + 0.0004,
            "type": "convenience",
        },
        {
            "name": "ドラッグストアC",
            "lat": location.lat + 0.0018,
            "lng": location.lng - 0.0006,
            "type": "drugstore",
        },
    ]

    candidates: List[StoreCandidate] = []
    for store in dummy_stores:
        distance = _haversine_distance_m(
            location.lat, location.lng, store["lat"], store["lng"]
        )
        if distance > radius_m:
            continue

        base_confidence = {
            "supermarket": 0.75,
            "convenience": 0.55,
            "drugstore": 0.45,
        }.get(store["type"], 0.4)

        confidence = min(0.9, base_confidence + 0.05 * len(items))
        note = "惣菜/精肉があれば入手しやすい" if store["type"] == "supermarket" else "代替案があると安心"

        candidates.append(
            StoreCandidate(
                name=store["name"],
                distanceM=distance,
                confidence=confidence,
                note=note,
            )
        )

    candidates.sort(key=lambda c: (c.distanceM or 0))
    return candidates


@app.post("/api/v1/food-sniper/recommend", response_model=FoodSniperResponse)
def recommend_food_sniper(
    payload: FoodSniperRequest, uid: str = Depends(get_current_uid)
) -> FoodSniperResponse:
    items = _extract_food_items(payload.message)
    radius = payload.radiusM or 800
    stores = _build_store_candidates(payload.location, radius, items)

    shopping_list = [f"{item.name}" for item in items]
    if "卵" not in shopping_list:
        shopping_list.append("卵（代替）")

    db = get_firestore_client()
    request_id = f"food_{uuid.uuid4().hex}"
    db.collection("foodRequests").document(uid).collection("items").document(
        request_id
    ).set(
        {
            "createdAt": admin_firestore.SERVER_TIMESTAMP,
            "query": payload.message,
            "location": payload.location.model_dump() if payload.location else None,
            "recommendations": [item.dict() for item in items],
            "stores": [store.dict() for store in stores],
            "shoppingList": shopping_list,
        }
    )

    return FoodSniperResponse(items=items, stores=stores, shoppingList=shopping_list)


def _to_datetime(value) -> Optional[datetime]:
    if isinstance(value, datetime):
        return value
    if hasattr(value, "to_datetime"):
        return value.to_datetime()
    return None


def _safe_json_load(text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            raise
        return json.loads(match.group(0))


def _generate_report_with_llm(
    series: list[tuple[datetime, float]], period_days: int
) -> Optional[ReportGenerateResponse]:
    if not gemini_enabled():
        return None

    payload = [
        {"date": dt.date().isoformat(), "densityIndex": value}
        for dt, value in series
    ]

    prompt = (
        "あなたは薄毛対策の習慣化エージェントです。"
        "以下のJSONデータを基に、短い週次レポートを日本語で作成してください。"
        "医療診断はしないでください。一般的な生活改善の範囲にとどめてください。\n"
        "出力は必ず次のJSON形式のみ:\n"
        "{\n"
        '  "highlights": ["..."],\n'
        '  "nextActions": ["..."],\n'
        '  "rawText": "..." \n'
        "}\n"
        "highlightsは2〜3件、nextActionsは2〜3件、rawTextは要約文。\n"
        f"入力: {{\"periodDays\": {period_days}, \"series\": {payload}}}\n"
    )

    try:
        text = generate_text(prompt)
        data = _safe_json_load(text)
    except Exception:  # noqa: BLE001
        return None

    highlights = data.get("highlights") or []
    next_actions = data.get("nextActions") or []
    raw_text = data.get("rawText") or ""

    if not isinstance(highlights, list) or not isinstance(next_actions, list):
        return None

    return ReportGenerateResponse(
        reportId="",
        highlights=[str(item) for item in highlights][:3],
        nextActions=[str(item) for item in next_actions][:3],
        rawText=str(raw_text),
    )


@app.post("/api/v1/reports/generate", response_model=ReportGenerateResponse)
def generate_report(
    payload: ReportGenerateRequest, uid: str = Depends(get_current_uid)
) -> ReportGenerateResponse:
    period_days = payload.periodDays or 7
    period_days = max(1, min(period_days, 30))

    db = get_firestore_client()
    analysis_ref = db.collection("analysisResults").document(uid).collection("items")
    docs = (
        analysis_ref.order_by(
            "computedAt", direction=admin_firestore.Query.DESCENDING
        )
        .limit(50)
        .get()
    )

    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=period_days)
    series = []
    for doc in docs:
        data = doc.to_dict()
        ts = data.get("computedAt") or data.get("createdAt")
        computed_at = _to_datetime(ts)
        if not computed_at:
            continue
        if computed_at.tzinfo is None:
            computed_at = computed_at.replace(tzinfo=timezone.utc)
        if computed_at < cutoff:
            continue
        density = data.get("densityIndex")
        if isinstance(density, (int, float)):
            series.append((computed_at, float(density)))

    series.sort(key=lambda item: item[0])

    highlights: List[str] = []
    next_actions: List[str] = []
    raw_text = ""
    model_label = "rule_based_v1"

    llm_report = _generate_report_with_llm(series, period_days)
    if llm_report:
        highlights = llm_report.highlights
        next_actions = llm_report.nextActions
        raw_text = llm_report.rawText
        model_label = f"gemini:{GEMINI_MODEL}"
    else:
        if not series:
            highlights.append("期間内の測定データがありません。")
            next_actions.append("週1回の写真チェックインを続けましょう。")
            next_actions.append("撮影条件（光・角度・距離）を揃えましょう。")
        else:
            first = series[0][1]
            latest = series[-1][1]
            delta = latest - first
            highlights.append(
                f"{period_days}日で密度指数は {latest:.3f}（変化 {delta:+.3f}）でした。"
            )
            if delta < 0:
                highlights.append(
                    "一時的なブレの可能性があるため、撮影条件を再確認してください。"
                )
            else:
                highlights.append("安定して推移しているため、継続できています。")

            next_actions.append("次回も同じ条件で撮影して比較精度を上げる。")
            next_actions.append("睡眠時間を確保し、タンパク質を意識する。")

        raw_text = "\n".join(highlights + ["---"] + next_actions)

    report_id = f"report_{uuid.uuid4().hex}"
    db.collection("reports").document(uid).collection("items").document(report_id).set(
        {
            "createdAt": admin_firestore.SERVER_TIMESTAMP,
            "period": {
                "from": cutoff.date().isoformat(),
                "to": now.date().isoformat(),
                "days": period_days,
            },
            "highlights": highlights,
            "nextActions": next_actions,
            "rawText": raw_text,
            "llm": {"model": model_label},
        }
    )

    return ReportGenerateResponse(
        reportId=report_id,
        highlights=highlights,
        nextActions=next_actions,
        rawText=raw_text,
    )


def _contains_risk_keywords(message: str) -> bool:
    keywords = [
        "出血",
        "痛い",
        "強いかゆみ",
        "赤み",
        "炎症",
        "円形脱毛",
        "急に",
        "発熱",
        "膿",
        "ただれ",
    ]
    return any(key in message for key in keywords)


def _compose_mental_shield(message: str) -> tuple[List[MentalShieldCard], str]:
    risk = _contains_risk_keywords(message)

    llm_cards, llm_summary = _generate_mental_with_llm(message)
    if llm_cards and llm_summary:
        return llm_cards, llm_summary

    encourager = (
        "不安に感じるのは自然な反応です。今ここで一緒に整理しましょう。"
        "継続できている点を思い出せていますか？"
    )
    coach = (
        "今日の最小の一手は「同条件で写真を撮る」か「睡眠を30分確保する」。"
        "1つだけやり切ろう。"
    )
    doctor = (
        "一般論として、抜け毛は睡眠・ストレス・栄養の影響を受けます。"
        "ただし診断はできません。"
    )

    if risk:
        doctor += " 皮膚の痛み・強い赤み・円形の脱毛などがある場合は受診も検討してください。"
    else:
        doctor += " 変化が急でなければ、同条件での経過観察が有効です。"

    cards = [
        MentalShieldCard(agent="encourager", text=encourager),
        MentalShieldCard(agent="coach", text=coach),
        MentalShieldCard(agent="doctor", text=doctor),
    ]
    summary = "今日の最小の一手: 「同条件の写真チェックイン」か「睡眠の確保」。"
    return cards, summary


def _generate_mental_with_llm(
    message: str,
) -> tuple[Optional[List[MentalShieldCard]], Optional[str]]:
    if not gemini_enabled():
        return None, None

    prompt = (
        "あなたは薄毛対策のメンタル支援エージェントです。"
        "以下の相談内容に対して、3人格（encourager/coach/doctor）の短い回答と"
        "まとめを日本語で返してください。診断はしないでください。\n"
        "出力は必ず次のJSON形式のみ:\n"
        "{\n"
        '  "cards": [\n'
        '    {"agent": "encourager", "text": "..."},\n'
        '    {"agent": "coach", "text": "..."},\n'
        '    {"agent": "doctor", "text": "..."}\n'
        "  ],\n"
        '  "summary": "..." \n'
        "}\n"
        f"相談内容: {message}\n"
    )

    try:
        text = generate_text(prompt)
        data = _safe_json_load(text)
    except Exception:  # noqa: BLE001
        return None, None

    cards_data = data.get("cards")
    summary = data.get("summary")
    if not isinstance(cards_data, list) or not summary:
        return None, None

    cards: List[MentalShieldCard] = []
    for item in cards_data:
        agent = str(item.get("agent", ""))
        text_value = str(item.get("text", ""))
        if agent not in {"encourager", "coach", "doctor"} or not text_value:
            continue
        cards.append(MentalShieldCard(agent=agent, text=text_value))

    if len(cards) < 3:
        return None, None

    return cards, str(summary)


@app.post("/api/v1/mental-shield/chat", response_model=MentalShieldResponse)
def mental_shield_chat(
    payload: MentalShieldRequest, uid: str = Depends(get_current_uid)
) -> MentalShieldResponse:
    thread_id = payload.threadId or "default"
    cards, summary = _compose_mental_shield(payload.message)

    db = get_firestore_client()
    messages_ref = (
        db.collection("conversations")
        .document(uid)
        .collection("threads")
        .document(thread_id)
        .collection("messages")
    )

    messages_ref.add(
        {
            "role": "user",
            "agent": "user",
            "text": payload.message,
            "createdAt": admin_firestore.SERVER_TIMESTAMP,
        }
    )

    for card in cards:
        messages_ref.add(
            {
                "role": "agent",
                "agent": card.agent,
                "text": card.text,
                "createdAt": admin_firestore.SERVER_TIMESTAMP,
            }
        )

    messages_ref.add(
        {
            "role": "agent",
            "agent": "orchestrator",
            "text": summary,
            "createdAt": admin_firestore.SERVER_TIMESTAMP,
        }
    )

    return MentalShieldResponse(cards=cards, summary=summary, threadId=thread_id)
