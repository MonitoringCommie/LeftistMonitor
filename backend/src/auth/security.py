"""Security utilities for authentication."""
import os
import secrets
import base64
import io
from datetime import datetime, timedelta
from typing import Optional, Tuple, List
import bcrypt
from jose import JWTError, jwt
import pyotp
import qrcode
from cryptography.fernet import Fernet

# JWT settings
_jwt_secret = os.getenv("JWT_SECRET_KEY")
if not _jwt_secret or len(_jwt_secret) < 32:
    raise RuntimeError(
        "JWT_SECRET_KEY environment variable must be set and at least 32 characters long. "
        "Generate a secure key with: openssl rand -hex 32"
    )
SECRET_KEY = _jwt_secret
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # Short-lived access token
REFRESH_TOKEN_EXPIRE_DAYS = 7    # Long-lived refresh token

# 2FA Encryption key (must be set in env)
_totp_key = os.getenv("TOTP_ENCRYPTION_KEY")
if not _totp_key:
    raise RuntimeError(
        "TOTP_ENCRYPTION_KEY environment variable must be set. "
        "Generate a key with: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
    )

try:
    _fernet = Fernet(_totp_key.encode() if isinstance(_totp_key, str) else _totp_key)
    TOTP_ENCRYPTION_KEY = _totp_key
except Exception as e:
    raise RuntimeError(f"TOTP_ENCRYPTION_KEY is not a valid Fernet key: {e}")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )


def get_password_hash(password: str) -> str:
    """Hash a password."""
    # Truncate to 72 bytes for bcrypt
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token (short-lived)."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "type": "access",
        "iat": datetime.utcnow(),
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(user_id: str, token_family: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT refresh token (long-lived).

    Args:
        user_id: The user's ID
        token_family: Token family ID for rotation tracking
        expires_delta: Optional custom expiration

    Returns:
        Encoded JWT refresh token
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode = {
        "sub": user_id,
        "family": token_family,
        "exp": expire,
        "type": "refresh",
        "iat": datetime.utcnow(),
        "jti": secrets.token_hex(16),  # Unique token ID
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def decode_refresh_token(token: str) -> Optional[dict]:
    """Decode and verify a refresh token specifically.

    Returns None if invalid or not a refresh token.
    """
    payload = decode_token(token)
    if payload is None:
        return None

    # Verify it's a refresh token
    if payload.get("type") != "refresh":
        return None

    return payload


# ============== 2FA / TOTP Functions ==============

def generate_totp_secret() -> str:
    """Generate a new TOTP secret."""
    return pyotp.random_base32()


def encrypt_totp_secret(secret: str) -> str:
    """Encrypt a TOTP secret for storage."""
    encrypted = _fernet.encrypt(secret.encode())
    return base64.b64encode(encrypted).decode()


def decrypt_totp_secret(encrypted_secret: str) -> str:
    """Decrypt a stored TOTP secret."""
    encrypted = base64.b64decode(encrypted_secret.encode())
    decrypted = _fernet.decrypt(encrypted)
    return decrypted.decode()


def get_totp_uri(secret: str, email: str, issuer: str = "LeftistMonitor") -> str:
    """Generate a TOTP provisioning URI for QR code."""
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name=issuer)


def generate_qr_code_base64(uri: str) -> str:
    """Generate a QR code as base64 data URI."""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(uri)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)

    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_base64}"


def verify_totp(secret: str, code: str, window: int = 1) -> bool:
    """Verify a TOTP code.

    Args:
        secret: The TOTP secret (decrypted)
        code: The 6-digit code to verify
        window: Number of time windows to check (for clock drift)

    Returns:
        True if code is valid
    """
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=window)


def generate_backup_codes(count: int = 8) -> Tuple[List[str], List[str]]:
    """Generate backup codes for 2FA recovery.

    Returns:
        Tuple of (plain_codes, hashed_codes)
        - plain_codes: Show to user once
        - hashed_codes: Store in database
    """
    plain_codes = []
    hashed_codes = []

    for _ in range(count):
        # Generate a 10-character alphanumeric code
        code = secrets.token_hex(5).upper()
        # Format as XXXXX-XXXXX for readability
        formatted_code = f"{code[:5]}-{code[5:]}"
        plain_codes.append(formatted_code)
        # Hash for storage
        hashed_codes.append(get_password_hash(formatted_code))

    return plain_codes, hashed_codes


def verify_backup_code(code: str, hashed_codes: List[str]) -> Tuple[bool, int]:
    """Verify a backup code against stored hashes.

    Args:
        code: The backup code to verify
        hashed_codes: List of hashed backup codes

    Returns:
        Tuple of (is_valid, index_of_used_code)
        index is -1 if not valid
    """
    # Normalize code (remove dashes, uppercase)
    normalized = code.replace("-", "").upper()
    # Re-add dash for verification
    formatted = f"{normalized[:5]}-{normalized[5:]}" if len(normalized) == 10 else code

    for i, hashed in enumerate(hashed_codes):
        if verify_password(formatted, hashed):
            return True, i

    return False, -1
