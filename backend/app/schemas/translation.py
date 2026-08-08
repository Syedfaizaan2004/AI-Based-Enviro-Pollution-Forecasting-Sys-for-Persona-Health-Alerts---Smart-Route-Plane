from pydantic import BaseModel, Field
from typing import Dict, List




class TranslationBatchRequest(BaseModel):
    texts: List[str] = Field(default_factory=list, max_length=200)
    target_language: str
    source_language: str = "en-IN"


class TranslationBatchResponse(BaseModel):
    translations: Dict[str, str]
    target_language: str
