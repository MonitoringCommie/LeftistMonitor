"""
Email verification system for user registration.
Uses itsdangerous for secure token generation and optional SMTP/SendGrid for delivery.
"""

import os
import secrets
from datetime import datetime, timedelta
from typing import Optional
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from pydantic import BaseModel, EmailStr

from src.cache import cache_get, cache_set, cache_delete


# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60  # 24 hours in seconds
RATE_LIMIT_SECONDS = 300  # 5 minutes between verification emails


class EmailVerificationToken(BaseModel):
    """Token data for email verification."""
    user_id: int
    email: str
    created_at: datetime


class EmailService:
    """
    Email service for sending verification emails.
    Supports multiple backends: SMTP, SendGrid, or console (dev).
    """
    
    def __init__(self):
        self.backend = os.getenv("EMAIL_BACKEND", "console")
        self.from_email = os.getenv("EMAIL_FROM", "noreply@leftistmonitor.org")
        self.sendgrid_key = os.getenv("SENDGRID_API_KEY")
        self.smtp_host = os.getenv("SMTP_HOST", "localhost")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.base_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    async def send_verification_email(self, to_email: str, token: str) -> bool:
        """Send verification email using configured backend."""
        verification_url = f"{self.base_url}/verify-email?token={token}"
        
        subject = "Verify your LeftistMonitor account"
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">LeftistMonitor</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Verify Your Email</h2>
                <p style="color: #666; line-height: 1.6;">
                    Thank you for registering with LeftistMonitor. Please click the button below 
                    to verify your email address and activate your account.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" 
                       style="background: #dc2626; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Verify Email
                    </a>
                </div>
                <p style="color: #999; font-size: 12px;">
                    If you did not create an account, you can safely ignore this email.
                    This link will expire in 24 hours.
                </p>
                <p style="color: #999; font-size: 12px;">
                    If the button does not work, copy and paste this URL into your browser:<br>
                    <a href="{verification_url}" style="color: #dc2626;">{verification_url}</a>
                </p>
            </div>
            <div style="padding: 20px; text-align: center; color: #999; font-size: 11px;">
                LeftistMonitor - Documenting History for Liberation
            </div>
        </body>
        </html>
        """
        
        text_body = f"""
        Verify Your LeftistMonitor Account
        
        Thank you for registering. Please visit the following link to verify your email:
        
        {verification_url}
        
        This link will expire in 24 hours.
        
        If you did not create an account, you can safely ignore this email.
        """
        
        if self.backend == "console":
            return await self._send_console(to_email, subject, text_body, verification_url)
        elif self.backend == "sendgrid":
            return await self._send_sendgrid(to_email, subject, html_body, text_body)
        elif self.backend == "smtp":
            return await self._send_smtp(to_email, subject, html_body, text_body)
        else:
            print(f"Unknown email backend: {self.backend}")
            return False
    
    async def _send_console(self, to: str, subject: str, body: str, url: str) -> bool:
        """Print email to console (development)."""
        print("=" * 60)
        print(f"EMAIL TO: {to}")
        print(f"SUBJECT: {subject}")
        print("-" * 60)
        print(f"VERIFICATION URL: {url}")
        print("=" * 60)
        return True
    
    async def _send_sendgrid(self, to: str, subject: str, html: str, text: str) -> bool:
        """Send email via SendGrid API."""
        if not self.sendgrid_key:
            print("SendGrid API key not configured")
            return False
        
        try:
            import httpx
            
            response = await httpx.AsyncClient().post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {self.sendgrid_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "personalizations": [{"to": [{"email": to}]}],
                    "from": {"email": self.from_email},
                    "subject": subject,
                    "content": [
                        {"type": "text/plain", "value": text},
                        {"type": "text/html", "value": html},
                    ],
                },
            )
            return response.status_code in (200, 201, 202)
        except Exception as e:
            print(f"SendGrid error: {e}")
            return False
    
    async def _send_smtp(self, to: str, subject: str, html: str, text: str) -> bool:
        """Send email via SMTP."""
        try:
            import smtplib
            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText
            
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = to
            
            msg.attach(MIMEText(text, "plain"))
            msg.attach(MIMEText(html, "html"))
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                if self.smtp_user and self.smtp_password:
                    server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_email, to, msg.as_string())
            
            return True
        except Exception as e:
            print(f"SMTP error: {e}")
            return False


class EmailVerificationService:
    """Service for managing email verification tokens."""
    
    def __init__(self):
        self.serializer = URLSafeTimedSerializer(SECRET_KEY)
        self.email_service = EmailService()
    
    def generate_token(self, user_id: int, email: str) -> str:
        """Generate a secure verification token."""
        data = {"user_id": user_id, "email": email, "nonce": secrets.token_hex(8)}
        return self.serializer.dumps(data, salt="email-verification")
    
    def verify_token(self, token: str) -> Optional[dict]:
        """
        Verify a token and return the data if valid.
        
        Returns None if token is invalid or expired.
        """
        try:
            data = self.serializer.loads(
                token,
                salt="email-verification",
                max_age=VERIFICATION_TOKEN_EXPIRY,
            )
            return data
        except SignatureExpired:
            return None
        except BadSignature:
            return None
    
    async def can_send_email(self, user_id: int) -> bool:
        """Check if we can send another verification email (rate limiting)."""
        key = f"email_verification_sent:{user_id}"
        last_sent = await cache_get(key)
        return last_sent is None
    
    async def record_email_sent(self, user_id: int) -> None:
        """Record that a verification email was sent."""
        key = f"email_verification_sent:{user_id}"
        await cache_set(key, "1", ttl=RATE_LIMIT_SECONDS)
    
    async def send_verification(self, user_id: int, email: str) -> tuple[bool, str]:
        """
        Send a verification email if rate limit allows.
        
        Returns (success, message).
        """
        if not await self.can_send_email(user_id):
            return False, "Please wait before requesting another verification email"
        
        token = self.generate_token(user_id, email)
        success = await self.email_service.send_verification_email(email, token)
        
        if success:
            await self.record_email_sent(user_id)
            return True, "Verification email sent"
        else:
            return False, "Failed to send verification email"
    
    async def mark_token_used(self, token: str) -> None:
        """Mark a token as used to prevent reuse."""
        key = f"email_token_used:{token[:32]}"
        await cache_set(key, "1", ttl=VERIFICATION_TOKEN_EXPIRY)
    
    async def is_token_used(self, token: str) -> bool:
        """Check if a token has already been used."""
        key = f"email_token_used:{token[:32]}"
        return await cache_get(key) is not None


# Singleton instance
email_verification_service = EmailVerificationService()
