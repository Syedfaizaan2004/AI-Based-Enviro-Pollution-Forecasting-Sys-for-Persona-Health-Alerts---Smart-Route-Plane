from app.api_clients.base_client import BaseClient, APIClientError
from app.core.config import settings

class SarvamClient(BaseClient):
    def __init__(self):
        super().__init__(base_url="https://api.sarvam.ai/")
        self.api_key = settings.SARVAM_AI_KEY
        if not self.api_key:
            raise APIClientError("SARVAM_AI_KEY is not configured")
            
        self.headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json"
        }

    async def translate(self, text: str, target_lang: str, source_lang: str = "en-IN") -> dict:
        endpoint = "translate"
        payload = {
            "input": text,
            "source_language_code": source_lang,
            "target_language_code": target_lang,
            "speaker_gender": "Male",
            "mode": "formal",
            "model": "sarvam-translate:v1"
        }
        # Assuming BaseClient.post supports headers kwarg
        response = await self.post(endpoint, json=payload, headers=self.headers)
        return response.json()

    async def translate_batch(self, texts: list[str], target_lang: str, source_lang: str = "en-IN") -> dict:
        endpoint = "translate"
        payload = {
            "input": texts,
            "source_language_code": source_lang,
            "target_language_code": target_lang,
            "speaker_gender": "Male",
            "mode": "formal",
            "model": "sarvam-translate"
        }
        response = await self.post(endpoint, json=payload, headers=self.headers)
        return response.json()
