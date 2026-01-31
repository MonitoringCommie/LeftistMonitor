"""Authentication dependencies for FastAPI."""
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from .models import User, UserRole, Permission
from .security import decode_token

# Security scheme
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Get the current authenticated user from JWT token.
    
    Returns None if no token provided (for optional auth).
    Raises HTTPException if token is invalid.
    """
    if credentials is None:
        return None
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )
    
    return user


async def get_current_user_required(
    user: Optional[User] = Depends(get_current_user),
) -> User:
    """Require authentication - raises if no user."""
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_permission(permission: Permission):
    """Dependency factory to require a specific permission."""
    async def permission_checker(
        user: User = Depends(get_current_user_required),
    ) -> User:
        if not user.has_permission(permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission.value} required",
            )
        return user
    return permission_checker


def require_any_permission(permissions: List[Permission]):
    """Dependency factory to require any of the specified permissions."""
    async def permission_checker(
        user: User = Depends(get_current_user_required),
    ) -> User:
        user_perms = user.get_permissions()
        if not any(p in user_perms for p in permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: one of {[p.value for p in permissions]} required",
            )
        return user
    return permission_checker


def require_all_permissions(permissions: List[Permission]):
    """Dependency factory to require all specified permissions."""
    async def permission_checker(
        user: User = Depends(get_current_user_required),
    ) -> User:
        user_perms = user.get_permissions()
        missing = [p for p in permissions if p not in user_perms]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: missing {[p.value for p in missing]}",
            )
        return user
    return permission_checker


def require_role(role: UserRole):
    """Dependency factory to require a minimum role level."""
    async def role_checker(
        user: User = Depends(get_current_user_required),
    ) -> User:
        if not user.has_role(role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role denied: {role.value} or higher required",
            )
        return user
    return role_checker


# Convenience dependencies for common role checks
require_editor = require_role(UserRole.EDITOR)
require_moderator = require_role(UserRole.MODERATOR)
require_admin = require_role(UserRole.ADMIN)
require_superadmin = require_role(UserRole.SUPERADMIN)
