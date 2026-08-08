import asyncio
import getpass
import sys
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.enums import UserRole
from app.core.security import get_password_hash

async def main():
    print("--- Create Superuser (Admin) ---")
    email = input("Email: ").strip()
    username = input("Username: ").strip()
    password = getpass.getpass("Password: ")
    confirm_password = getpass.getpass("Confirm Password: ")
    
    if not email or not username or not password:
        print("Error: All fields are required.")
        sys.exit(1)
        
    if password != confirm_password:
        print("Error: Passwords do not match.")
        sys.exit(1)
        
    async with AsyncSessionLocal() as db:
        stmt = select(User).where((User.email == email) | (User.username == username))
        result = await db.execute(stmt)
        existing_user = result.scalars().first()
        
        if existing_user:
            if existing_user.email == email:
                print(f"Error: User with email {email} already exists.")
            else:
                print(f"Error: Username {username} is already taken.")
            sys.exit(1)
            
        hashed_password = get_password_hash(password)
        new_admin = User(
            email=email,
            username=username,
            hashed_password=hashed_password,
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )
        
        db.add(new_admin)
        await db.commit()
        print(f"Success: Superuser '{username}' ({email}) created successfully!")

if __name__ == "__main__":
    asyncio.run(main())
