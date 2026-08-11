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
        existing_users = result.scalars().all()
        
        if existing_users:
            email_user = next((user for user in existing_users if user.email == email), None)
            username_user = next((user for user in existing_users if user.username == username), None)

            if email_user and username_user and email_user.id != username_user.id:
                print("Error: Email and username belong to different existing users.")
                sys.exit(1)

            existing_user = email_user or username_user

            if existing_user.email != email:
                print(f"Error: Username {username} is already taken.")
                sys.exit(1)

            if existing_user.username != username:
                print(
                    f"Error: User with email {email} already exists as "
                    f"username '{existing_user.username}'."
                )
                sys.exit(1)

            if existing_user.role != UserRole.ADMIN:
                print("Error: Existing user is not an admin. Refusing to modify the account.")
                sys.exit(1)

            changes = []
            if not existing_user.is_active:
                existing_user.is_active = True
                changes.append("activated")
            if existing_user.is_deleted:
                existing_user.is_deleted = False
                existing_user.deleted_at = None
                changes.append("restored")
            if not existing_user.is_verified:
                existing_user.is_verified = True
                changes.append("verified")

            if not changes:
                print(f"Info: Admin '{username}' ({email}) already exists and is active.")
                return

            await db.commit()
            print(
                f"Success: Admin '{username}' ({email}) "
                f"{', '.join(changes)} successfully!"
            )
            return
            
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
