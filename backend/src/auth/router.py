"""Authentication and user management API routes."""
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from ..database import get_db
from .models import (
    User, UserRole, Permission, ROLE_PERMISSIONS,
    UserCreate, UserUpdate, UserRoleUpdate, UserResponse, 
    TokenResponse, LoginRequest
)
from .security import (
    verify_password, get_password_hash, create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from .dependencies import (
    get_current_user, get_current_user_required,
    require_permission, require_role
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ============== Public Auth Endpoints ==============

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user account."""
    # Check if email already exists
    result = await db.execute(
        select(User).where(
            or_(User.email == user_data.email, User.username == user_data.username)
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        if existing.email == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )
    
    # Create new user
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        display_name=user_data.display_name or user_data.username,
        role=UserRole.VIEWER,  # Default role
    )
    
    db.add(user)
    await db.flush()
    await db.refresh(user)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        last_login=user.last_login,
        permissions=[p.value for p in user.get_permissions()],
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Login and get access token."""
    # Find user by email
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    await db.flush()
    
    # Create token
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            bio=user.bio,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at,
            last_login=user.last_login,
            permissions=[p.value for p in user.get_permissions()],
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user_required),
):
    """Get current authenticated user's info."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        display_name=current_user.display_name,
        avatar_url=current_user.avatar_url,
        bio=current_user.bio,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        last_login=current_user.last_login,
        permissions=[p.value for p in current_user.get_permissions()],
    )


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's profile."""
    if user_data.email and user_data.email != current_user.email:
        result = await db.execute(select(User).where(User.email == user_data.email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use",
            )
        current_user.email = user_data.email
    
    if user_data.username and user_data.username != current_user.username:
        result = await db.execute(select(User).where(User.username == user_data.username))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )
        current_user.username = user_data.username
    
    if user_data.display_name is not None:
        current_user.display_name = user_data.display_name
    if user_data.bio is not None:
        current_user.bio = user_data.bio
    if user_data.avatar_url is not None:
        current_user.avatar_url = user_data.avatar_url
    
    current_user.updated_at = datetime.utcnow()
    await db.flush()
    
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        display_name=current_user.display_name,
        avatar_url=current_user.avatar_url,
        bio=current_user.bio,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        last_login=current_user.last_login,
        permissions=[p.value for p in current_user.get_permissions()],
    )


# ============== Admin User Management ==============

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    role: Optional[UserRole] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_permission(Permission.MANAGE_USERS)),
    db: AsyncSession = Depends(get_db),
):
    """List all users (admin only)."""
    query = select(User)
    
    if role:
        query = query.where(User.role == role)
    
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                User.email.ilike(search_term),
                User.username.ilike(search_term),
                User.display_name.ilike(search_term),
            )
        )
    
    query = query.order_by(User.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()
    
    return [
        UserResponse(
            id=u.id,
            email=u.email,
            username=u.username,
            display_name=u.display_name,
            avatar_url=u.avatar_url,
            bio=u.bio,
            role=u.role,
            is_active=u.is_active,
            is_verified=u.is_verified,
            created_at=u.created_at,
            last_login=u.last_login,
            permissions=[p.value for p in u.get_permissions()],
        )
        for u in users
    ]


@router.get("/users/count")
async def get_user_count(
    current_user: User = Depends(require_permission(Permission.MANAGE_USERS)),
    db: AsyncSession = Depends(get_db),
):
    """Get total user count by role."""
    result = await db.execute(
        select(User.role, func.count(User.id)).group_by(User.role)
    )
    counts = {role.value: 0 for role in UserRole}
    for role, count in result.all():
        counts[role.value] = count
    counts["total"] = sum(counts.values())
    return counts


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    current_user: User = Depends(require_permission(Permission.MANAGE_USERS)),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific user by ID (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        last_login=user.last_login,
        permissions=[p.value for p in user.get_permissions()],
    )


@router.put("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: uuid.UUID,
    role_data: UserRoleUpdate,
    current_user: User = Depends(require_permission(Permission.MANAGE_ROLES)),
    db: AsyncSession = Depends(get_db),
):
    """Update a user's role and permissions (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Prevent demoting yourself if you're the only superadmin
    if user.id == current_user.id and role_data.role != UserRole.SUPERADMIN:
        count_result = await db.execute(
            select(func.count(User.id)).where(User.role == UserRole.SUPERADMIN)
        )
        superadmin_count = count_result.scalar()
        if superadmin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot demote the only superadmin",
            )
    
    # Only superadmins can create other superadmins
    if role_data.role == UserRole.SUPERADMIN and current_user.role != UserRole.SUPERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins can create other superadmins",
        )
    
    user.role = role_data.role
    if role_data.extra_permissions is not None:
        user.extra_permissions = role_data.extra_permissions
    if role_data.denied_permissions is not None:
        user.denied_permissions = role_data.denied_permissions
    
    user.updated_at = datetime.utcnow()
    await db.flush()
    
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        last_login=user.last_login,
        permissions=[p.value for p in user.get_permissions()],
    )


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: uuid.UUID,
    is_active: bool,
    current_user: User = Depends(require_permission(Permission.MANAGE_USERS)),
    db: AsyncSession = Depends(get_db),
):
    """Enable or disable a user account (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Prevent disabling yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot disable your own account",
        )
    
    user.is_active = is_active
    user.updated_at = datetime.utcnow()
    await db.flush()
    
    return {"message": f"User {'enabled' if is_active else 'disabled'} successfully"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.SUPERADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Delete a user (superadmin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )
    
    await db.delete(user)
    await db.flush()
    
    return {"message": "User deleted successfully"}


# ============== Role & Permission Info ==============

@router.get("/roles")
async def list_roles():
    """Get all available roles and their permissions."""
    return {
        role.value: {
            "name": role.value,
            "permissions": [p.value for p in ROLE_PERMISSIONS.get(role, [])],
        }
        for role in UserRole
    }


@router.get("/permissions")
async def list_permissions():
    """Get all available permissions."""
    return [
        {
            "value": p.value,
            "category": p.value.split(":")[0],
            "action": p.value.split(":")[1],
        }
        for p in Permission
    ]
