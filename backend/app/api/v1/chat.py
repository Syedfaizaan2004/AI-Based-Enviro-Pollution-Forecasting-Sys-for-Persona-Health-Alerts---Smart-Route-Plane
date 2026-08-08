from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from app.services.chat_service import ChatService
from app.api.deps import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    reply: str

@router.post("", response_model=ChatResponse)
async def chat_with_bot(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        service = ChatService()
        messages_dict = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        reply = await service.get_chat_response(messages_dict)
        return ChatResponse(reply=reply)
    except ValueError as e:
        raise HTTPException(status_code=503, detail="Chat service is currently unavailable.")
