"""
Email verification API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from src.database import get_db
from src.auth.models import User
from src.auth.security import get_current_user
from src.auth.email_verification import email_verification_service


router = APIRouter(prefix="/auth", tags=["email-verification"])


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class VerifyEmailRequest(BaseModel):
    token: str


class VerificationResponse(BaseModel):
    success: bool
    message: str


@router.post("/send-verification", response_model=VerificationResponse)
async def send_verification_email(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Send a verification email to the current user.
    Rate limited to once per 5 minutes.
    """
    if current_user.email_verified:
        return VerificationResponse(
            success=False,
            message="Email is already verified"
        )
    
    success, message = await email_verification_service.send_verification(
        current_user.id,
        current_user.email,
    )
    
    return VerificationResponse(success=success, message=message)


@router.post("/verify-email", response_model=VerificationResponse)
async def verify_email(
    request: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Verify email using the token from the verification email.
    """
    # Check if token was already used
    if await email_verification_service.is_token_used(request.token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This verification link has already been used"
        )
    
    # Verify the token
    data = email_verification_service.verify_token(request.token)
    if data is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification link"
        )
    
    user_id = data.get("user_id")
    email = data.get("email")
    
    # Find the user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check email matches
    if user.email != email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address has changed since verification was sent"
        )
    
    # Check if already verified
    if user.email_verified:
        return VerificationResponse(
            success=True,
            message="Email is already verified"
        )
    
    # Mark email as verified
    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(email_verified=True, email_verified_at=db.func.now())
    )
    await db.commit()
    
    # Mark token as used
    await email_verification_service.mark_token_used(request.token)
    
    return VerificationResponse(
        success=True,
        message="Email verified successfully"
    )


@router.post("/resend-verification", response_model=VerificationResponse)
async def resend_verification_email(
    request: ResendVerificationRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Resend verification email to an unverified user.
    Rate limited to once per 5 minutes.
    """
    # Find user by email
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    # Always return success to prevent email enumeration
    if user is None:
        return VerificationResponse(
            success=True,
            message="If the email exists, a verification link has been sent"
        )
    
    if user.email_verified:
        return VerificationResponse(
            success=True,
            message="If the email exists, a verification link has been sent"
        )
    
    success, _ = await email_verification_service.send_verification(
        user.id,
        user.email,
    )
    
    # Always return same message regardless of success
    return VerificationResponse(
        success=True,
        message="If the email exists, a verification link has been sent"
    )


@router.get("/verification-status")
async def get_verification_status(
    current_user: User = Depends(get_current_user),
):
    """Get the current user"s email verification status."""
    return {
        "email": current_user.email,
        "verified": current_user.email_verified,
        "verified_at": current_user.email_verified_at,
    }
