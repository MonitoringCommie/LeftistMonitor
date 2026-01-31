"""Script to create initial superadmin user."""
import asyncio
import sys
import os

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import select
from src.database import async_session_maker
from src.auth.models import User, UserRole
from src.auth.security import get_password_hash


async def create_superadmin(email: str, username: str, password: str):
    """Create a superadmin user."""
    async with async_session_maker() as session:
        # Check if user already exists
        result = await session.execute(
            select(User).where((User.email == email) | (User.username == username))
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            print(f"User with email {email} or username {username} already exists.")
            return
        
        # Create superadmin
        user = User(
            email=email,
            username=username,
            hashed_password=get_password_hash(password),
            display_name="Super Admin",
            role=UserRole.SUPERADMIN,
            is_active=True,
            is_verified=True,
        )
        
        session.add(user)
        await session.commit()
        print(f"Superadmin created successfully!")
        print(f"  Email: {email}")
        print(f"  Username: {username}")
        print(f"  Role: superadmin")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python create_superadmin.py <email> <username> <password>")
        print("Example: python create_superadmin.py admin@leftistmonitor.org admin secretpassword123")
        sys.exit(1)
    
    email = sys.argv[1]
    username = sys.argv[2]
    password = sys.argv[3]
    
    if len(password) < 8:
        print("Password must be at least 8 characters.")
        sys.exit(1)
    
    asyncio.run(create_superadmin(email, username, password))
