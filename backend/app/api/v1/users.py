from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.user import UserRead, UserUpdate, PasswordChange
from app.models.user import User
from app.api.deps import get_current_user
from app.repositories.user import UserRepository
from app.services.user_service import UserService
from app.core.security import verify_password, get_password_hash
from app.core.redis import redis_client

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserRead)
async def update_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_repo = UserRepository()
    if user_in.username:
        # Check if username taken
        existing = await user_repo.get_by_username(db, user_in.username)
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=400, detail="Username taken")
            
    return await user_repo.update(db, db_obj=current_user, obj_in=user_in.model_dump(exclude_unset=True))

@router.patch("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid current password")
        
    user_repo = UserRepository()
    await user_repo.update(db, db_obj=current_user, obj_in={"hashed_password": get_password_hash(password_data.new_password)})
    
    # In a real app we might increment a token version to invalidate all existing refresh tokens
    return {"message": "Password updated successfully"}

@router.delete("/me")
async def delete_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_service = UserService()
    await user_service.soft_delete_user(db, current_user)
    return {"message": "Account deactivated"}
