"""Authentication and user management API routes."""
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response, Cookie
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from ..database import get_db
from .models import (
    User, UserRole, Permission, ROLE_PERMISSIONS,
    UserCreate, UserUpdate, UserRoleUpdate, UserResponse,
    TokenResponse, LoginRequest, RefreshTokenRequest,
    TwoFactorSetupResponse, TwoFactorVerifyRequest, TwoFactorDisableRequest,
    BackupCodeVerifyRequest
)
from .security import (
    verify_password, get_password_hash, create_access_token, create_refresh_token,
    decode_refresh_token, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS,
    generate_totp_secret, encrypt_totp_secret, decrypt_totp_secret,
    get_totp_uri, generate_qr_code_base64, verify_totp,
    generate_backup_codes, verify_backup_code
)
from .dependencies import (
    get_current_user, get_current_user_required,
    require_permission, require_role
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _create_user_response(user: User) -> UserResponse:
    """Helper to create UserResponse from User model."""
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
        two_factor_enabled=user.two_factor_enabled,
        created_at=user.created_at,
        last_login=user.last_login,
        permissions=[p.value for p in user.get_permissions()],
    )


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

    return _create_user_response(user)


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Login and get access + refresh tokens.

    If 2FA is enabled, totp_code is required.
    """
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

    # Check 2FA if enabled
    if user.two_factor_enabled:
        if not credentials.totp_code:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="2FA code required",
                headers={"X-2FA-Required": "true"},
            )

        # Try TOTP verification first
        try:
            secret = decrypt_totp_secret(user.two_factor_secret)
            if not verify_totp(secret, credentials.totp_code):
                # Try backup code
                if user.two_factor_backup_codes:
                    valid, idx = verify_backup_code(credentials.totp_code, user.two_factor_backup_codes)
                    if valid:
                        # Remove used backup code
                        codes = list(user.two_factor_backup_codes)
                        codes.pop(idx)
                        user.two_factor_backup_codes = codes
                    else:
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid 2FA code",
                        )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid 2FA code",
                    )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid 2FA code",
            )

    # Update last login and generate new token family
    user.last_login = datetime.utcnow()
    token_family = user.generate_refresh_token_family()
    await db.flush()

    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )
    refresh_token = create_refresh_token(
        user_id=str(user.id),
        token_family=token_family
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=_create_user_response(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token using refresh token.

    Implements token rotation: each refresh invalidates the old token
    and issues a new refresh token.
    """
    # Decode refresh token
    payload = decode_refresh_token(request.refresh_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_id = payload.get("sub")
    token_family = payload.get("family")

    if not user_id or not token_family:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token payload",
        )

    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    # Verify token family (detect reuse attacks)
    if user.refresh_token_family != token_family:
        # Token family mismatch - possible token reuse attack
        # Invalidate all tokens for this user
        user.invalidate_refresh_tokens()
        await db.flush()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked. Please login again.",
        )

    # Rotate token: generate new family
    new_token_family = user.generate_refresh_token_family()
    await db.flush()

    # Create new tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )
    new_refresh_token = create_refresh_token(
        user_id=str(user.id),
        token_family=new_token_family
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=_create_user_response(user),
    )


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db),
):
    """Logout and invalidate all refresh tokens."""
    current_user.invalidate_refresh_tokens()
    await db.flush()

    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user_required),
):
    """Get current authenticated user's info."""
    return _create_user_response(current_user)


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

    return _create_user_response(current_user)


# ============== Two-Factor Authentication ==============

@router.post("/2fa/setup", response_model=TwoFactorSetupResponse)
async def setup_two_factor(
    current_user: User = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db),
):
    """Initiate 2FA setup. Returns secret, QR code, and backup codes.

    User must call /2fa/verify to complete setup.
    """
    if current_user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is already enabled",
        )

    # Generate TOTP secret
    secret = generate_totp_secret()

    # Generate provisioning URI and QR code
    uri = get_totp_uri(secret, current_user.email)
    qr_code = generate_qr_code_base64(uri)

    # Generate backup codes
    plain_codes, hashed_codes = generate_backup_codes(8)

    # Store encrypted secret and hashed backup codes (not enabled yet)
    current_user.two_factor_secret = encrypt_totp_secret(secret)
    current_user.two_factor_backup_codes = hashed_codes
    await db.flush()

    return TwoFactorSetupResponse(
        secret=secret,
        qr_code_uri=qr_code,
        backup_codes=plain_codes,
    )


@router.post("/2fa/verify")
async def verify_two_factor(
    request: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db),
):
    """Verify TOTP code and enable 2FA.

    Must be called after /2fa/setup with a valid code from authenticator app.
    """
    if current_user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is already enabled",
        )

    if not current_user.two_factor_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA setup not initiated. Call /2fa/setup first.",
        )

    # Verify the code
    try:
        secret = decrypt_totp_secret(current_user.two_factor_secret)
        if not verify_totp(secret, request.totp_code):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid TOTP code. Please try again.",
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error verifying 2FA code",
        )

    # Enable 2FA
    current_user.two_factor_enabled = True
    current_user.two_factor_verified_at = datetime.utcnow()
    await db.flush()

    return {"message": "2FA has been enabled successfully"}


@router.post("/2fa/disable")
async def disable_two_factor(
    request: TwoFactorDisableRequest,
    current_user: User = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db),
):
    """Disable 2FA. Requires password and either TOTP code or backup code."""
    if not current_user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled",
        )

    # Verify password
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
        )

    # Verify TOTP or backup code
    if request.totp_code:
        try:
            secret = decrypt_totp_secret(current_user.two_factor_secret)
            if not verify_totp(secret, request.totp_code):
                # Try as backup code
                if current_user.two_factor_backup_codes:
                    valid, _ = verify_backup_code(request.totp_code, current_user.two_factor_backup_codes)
                    if not valid:
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid 2FA code",
                        )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid 2FA code",
                    )
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error verifying 2FA code",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA code required to disable 2FA",
        )

    # Disable 2FA
    current_user.two_factor_enabled = False
    current_user.two_factor_secret = None
    current_user.two_factor_backup_codes = []
    current_user.two_factor_verified_at = None
    await db.flush()

    return {"message": "2FA has been disabled"}


@router.post("/2fa/backup-codes/regenerate")
async def regenerate_backup_codes(
    request: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db),
):
    """Regenerate backup codes. Requires current TOTP code."""
    if not current_user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled",
        )

    # Verify TOTP code
    try:
        secret = decrypt_totp_secret(current_user.two_factor_secret)
        if not verify_totp(secret, request.totp_code):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid TOTP code",
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error verifying 2FA code",
        )

    # Generate new backup codes
    plain_codes, hashed_codes = generate_backup_codes(8)
    current_user.two_factor_backup_codes = hashed_codes
    await db.flush()

    return {"backup_codes": plain_codes}


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

    return [_create_user_response(u) for u in users]


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

    return _create_user_response(user)


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

    return _create_user_response(user)


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

    # If disabling, also invalidate their tokens
    if not is_active:
        user.invalidate_refresh_tokens()

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
