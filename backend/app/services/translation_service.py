import logging
import hashlib
from fastapi import HTTPException
from app.api_clients.sarvam_client import SarvamClient
from app.schemas.translation import TranslationResponse
from app.services.cache_service import CacheManager

logger = logging.getLogger(__name__)

class TranslationService:
    def __init__(self):
        self.client = SarvamClient()

    def _generate_cache_key(self, text: str, target_lang: str) -> str:
        text_hash = hashlib.md5(text.encode('utf-8')).hexdigest()
        return f"translation:{target_lang}:{text_hash}"

    async def translate(self, text: str, target_lang: str, source_lang: str = "en-IN") -> TranslationResponse:
        cache_key = self._generate_cache_key(text, target_lang)
        cached_text = await CacheManager.get(cache_key)
        
        if cached_text:
            return TranslationResponse(
                original_text=text,
                translated_text=cached_text,
                target_language=target_lang,
                cached=True
            )

        try:
            data = await self.client.translate(text, target_lang, source_lang)
            translated_text = data.get("translated_text", text)
            
            # Cache for 30 days
            await CacheManager.set(cache_key, translated_text, ttl_seconds=2592000)
            
            return TranslationResponse(
                original_text=text,
                translated_text=translated_text,
                target_language=target_lang,
                cached=False
            )
        except Exception as e:
            logger.error(f"Sarvam API translation failed: {str(e)}")
            # Fallback to original text on failure so we don't break the UI
            return TranslationResponse(
                original_text=text,
                translated_text=text,
                target_language=target_lang,
                cached=False
            )
