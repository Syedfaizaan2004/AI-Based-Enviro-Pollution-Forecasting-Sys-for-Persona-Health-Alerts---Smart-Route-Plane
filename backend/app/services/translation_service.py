import logging
import hashlib
from sqlalchemy.future import select
from app.api_clients.sarvam_client import SarvamClient
from app.services.cache_service import CacheManager
from app.core.database import AsyncSessionLocal
from app.models.translation import Translation

logger = logging.getLogger(__name__)

class TranslationService:
    def _generate_cache_key(self, text: str, target_lang: str) -> str:
        text_hash = hashlib.sha256(f"{target_lang}:{text}".encode('utf-8')).hexdigest()
        return f"translation:{target_lang}:{text_hash}"



    async def translate_batch(self, texts: list[str], target_lang: str, source_lang: str = "en-IN"):
        from app.schemas.translation import TranslationBatchResponse
        
        # Don't translate if target is english
        if target_lang.startswith('en'):
            return TranslationBatchResponse(
                translations={text: text for text in texts},
                target_language=target_lang
            )
            
        translations = {}
        missing_texts = []
        
        for text in texts:
            cache_key = self._generate_cache_key(text, target_lang)
            cached_text = await CacheManager.get(cache_key)
            if cached_text:
                translations[text] = cached_text
            else:
                missing_texts.append(text)
                
        if not missing_texts:
            return TranslationBatchResponse(
                translations=translations,
                target_language=target_lang
            )
            
        try:
            client = SarvamClient()
            
            # To guarantee EXACTLY 1 API call to Sarvam, we join all missing strings with a delimiter (newline)
            # This is the industry-standard way to batch when an API only accepts a single string field.
            joined_missing_text = "\n".join(missing_texts)
            
            # Exactly 1 API Call
            data = await client.translate(joined_missing_text, target_lang, source_lang)
            translated_joined_text = data.get("translated_text", joined_missing_text)
            
            # Split the translated block back into individual strings
            translated_texts = translated_joined_text.split("\n")
            
            # Safety fallback in case the AI messed up the newlines
            if len(translated_texts) != len(missing_texts):
                logger.warning(f"Sarvam API batch split mismatch: {len(translated_texts)} vs {len(missing_texts)}")
                # Fallback to English for this rare edge case
                translated_texts = missing_texts
            
            for i, original_text in enumerate(missing_texts):
                translated_text = translated_texts[i]
                translations[original_text] = translated_text
                
                # Cache it
                cache_key = self._generate_cache_key(original_text, target_lang)
                await CacheManager.set(cache_key, translated_text, ttl_seconds=2592000)
                
        except Exception as e:
            logger.error(f"Sarvam API batch translation failed: {str(e)}")
            for text in missing_texts:
                translations[text] = text
                
        return TranslationBatchResponse(
            translations=translations,
            target_language=target_lang
        )
