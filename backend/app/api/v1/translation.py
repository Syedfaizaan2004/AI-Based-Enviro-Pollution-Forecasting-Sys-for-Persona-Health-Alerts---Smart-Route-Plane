from fastapi import APIRouter, Header, HTTPException, Query
from typing import Dict, Optional
import asyncio
from app.schemas.translation import (
    TranslationBatchRequest,
    TranslationBatchResponse,
)
from app.services.translation_service import TranslationService

router = APIRouter(prefix="/translation", tags=["Translation"])

SUPPORTED_LANGUAGES = {
    "en-IN": "English",
    "as-IN": "Assamese",
    "bn-IN": "Bengali",
    "brx-IN": "Bodo",
    "doi-IN": "Dogri",
    "gu-IN": "Gujarati",
    "hi-IN": "Hindi",
    "kn-IN": "Kannada",
    "kok-IN": "Konkani",
    "ks-IN": "Kashmiri",
    "mai-IN": "Maithili",
    "ml-IN": "Malayalam",
    "mni-IN": "Manipuri",
    "mr-IN": "Marathi",
    "ne-IN": "Nepali",
    "od-IN": "Odia",
    "pa-IN": "Punjabi",
    "sa-IN": "Sanskrit",
    "sat-IN": "Santali",
    "sd-IN": "Sindhi",
    "ta-IN": "Tamil",
    "te-IN": "Telugu",
    "ur-IN": "Urdu",
}

LANGUAGE_ALIASES = {
    "en": "en-IN",
    "as": "as-IN",
    "bn": "bn-IN",
    "brx": "brx-IN",
    "doi": "doi-IN",
    "gu": "gu-IN",
    "hi": "hi-IN",
    "kn": "kn-IN",
    "kok": "kok-IN",
    "ks": "ks-IN",
    "mai": "mai-IN",
    "ml": "ml-IN",
    "mni": "mni-IN",
    "mr": "mr-IN",
    "ne": "ne-IN",
    "or": "od-IN",
    "od": "od-IN",
    "pa": "pa-IN",
    "sa": "sa-IN",
    "sat": "sat-IN",
    "sd": "sd-IN",
    "ta": "ta-IN",
    "te": "te-IN",
    "ur": "ur-IN",
}

STATIC_UI_KEYS = [
    "Dashboard", "Login", "Signup", "Profile", "Settings", "Logout",
    "Save", "Cancel", "Edit", "Delete", "Add", "Update",
    "Air Quality Index", "Health Advice", "Predictions", "Routes",
    "History", "Analytics", "Notifications", "Admin",
    "Enterprise System Management", "User Profile", "System Monitor",
    "Personalized Health Alerts", "Smart Route Planner", "Smart Routes",
    "Prediction", "Health", "Overview", "Administration", "System Admin",
    "Sign out", "Search city for AQI...", "General Preferences",
    "Language & Region", "Appearance", "AQI Standard", "Smart Route Default",
    "Custom AQI Alert Threshold", "Save Preferences", "Saving...",
    "Real-time Air Quality", "Welcome back", "Get Started",
]


def normalize_language_code(language: Optional[str]) -> str:
    raw_lang = language or "en-IN"
    first_lang = raw_lang.split(",")[0].split(";")[0].strip()
    if not first_lang:
        return "en-IN"

    normalized_parts = first_lang.replace("_", "-").split("-")
    base_code = normalized_parts[0].lower()
    region_code = normalized_parts[1].upper() if len(normalized_parts) > 1 else ""
    normalized = f"{base_code}-{region_code}" if region_code else base_code

    if normalized in SUPPORTED_LANGUAGES:
        return normalized
    if base_code in LANGUAGE_ALIASES:
        return LANGUAGE_ALIASES[base_code]

    raise HTTPException(status_code=400, detail="Unsupported translation language")



@router.post("/translate-batch", response_model=TranslationBatchResponse)
async def translate_batch(req: TranslationBatchRequest):
    target_lang = normalize_language_code(req.target_language)
    unique_texts = list(dict.fromkeys(text.strip() for text in req.texts if text and text.strip()))

    if target_lang == "en-IN":
        return TranslationBatchResponse(
            translations={text: text for text in unique_texts},
            target_language=target_lang,
        )

    service = TranslationService()
    
    # Call the new batch method which handles Redis + 1 API call
    result = await service.translate_batch(
        texts=unique_texts,
        target_lang=target_lang,
        source_lang=req.source_language,
    )

    return result


@router.get("/static", response_model=Dict[str, str])
async def get_static_translations(
    lng: str = Query(None, description="Language code requested by i18next"),
    accept_language: str = Header(None, alias="Accept-Language")
):
    """
    Returns a translation dictionary for all static UI strings.
    This replaces frontend JSON files.
    """
    target_lang = normalize_language_code(lng or accept_language)

    if target_lang == "en-IN":
        return {key: key for key in STATIC_UI_KEYS}

    service = TranslationService()
    
    # Call the new batch method to translate all static strings in 1 API call
    result = await service.translate_batch(
        texts=STATIC_UI_KEYS,
        target_lang=target_lang
    )

    return result.translations
