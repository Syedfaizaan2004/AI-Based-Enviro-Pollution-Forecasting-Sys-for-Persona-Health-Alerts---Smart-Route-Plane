from fastapi import APIRouter
from app.schemas.translation import TranslationRequest, TranslationResponse
from app.services.translation_service import TranslationService

router = APIRouter(prefix="/translation", tags=["Translation"])

@router.post("/translate", response_model=TranslationResponse)
async def translate_text(req: TranslationRequest):
    service = TranslationService()
    return await service.translate(
        text=req.text,
        target_lang=req.target_language,
        source_lang=req.source_language
    )
