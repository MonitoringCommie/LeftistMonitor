"""User and permission models."""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Table, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from pydantic import BaseModel, EmailStr, Field

from ..database import Base


class UserRole(str, Enum):
    """User roles with hierarchical permissions."""
    VIEWER = "viewer"           # Can view public data
    CONTRIBUTOR = "contributor" # Can suggest edits
    EDITOR = "editor"          # Can edit data
    MODERATOR = "moderator"    # Can approve edits, manage content
    ADMIN = "admin"            # Full access except system
    SUPERADMIN = "superadmin"  # Full system access


class Permission(str, Enum):
    """Granular permissions for fine-grained access control."""
    # Read permissions
    READ_PUBLIC = "read:public"
    READ_PRIVATE = "read:private"
    READ_ADMIN = "read:admin"
    
    # Write permissions
    WRITE_PEOPLE = "write:people"
    WRITE_EVENTS = "write:events"
    WRITE_BOOKS = "write:books"
    WRITE_CONFLICTS = "write:conflicts"
    WRITE_COUNTRIES = "write:countries"
    WRITE_ELECTIONS = "write:elections"
    WRITE_PARTIES = "write:parties"
    
    # Edit permissions
    EDIT_PEOPLE = "edit:people"
    EDIT_EVENTS = "edit:events"
    EDIT_BOOKS = "edit:books"
    EDIT_CONFLICTS = "edit:conflicts"
    EDIT_COUNTRIES = "edit:countries"
    
    # Delete permissions
    DELETE_PEOPLE = "delete:people"
    DELETE_EVENTS = "delete:events"
    DELETE_BOOKS = "delete:books"
    DELETE_CONFLICTS = "delete:conflicts"
    
    # Admin permissions
    MANAGE_USERS = "manage:users"
    MANAGE_ROLES = "manage:roles"
    MANAGE_PERMISSIONS = "manage:permissions"
    APPROVE_EDITS = "approve:edits"
    VIEW_ANALYTICS = "view:analytics"
    EXPORT_DATA = "export:data"
    IMPORT_DATA = "import:data"
    
    # System permissions
    SYSTEM_CONFIG = "system:config"
    SYSTEM_BACKUP = "system:backup"
    SYSTEM_LOGS = "system:logs"


# Role to permissions mapping
ROLE_PERMISSIONS = {
    UserRole.VIEWER: [
        Permission.READ_PUBLIC,
    ],
    UserRole.CONTRIBUTOR: [
        Permission.READ_PUBLIC,
        Permission.READ_PRIVATE,
    ],
    UserRole.EDITOR: [
        Permission.READ_PUBLIC,
        Permission.READ_PRIVATE,
        Permission.WRITE_PEOPLE,
        Permission.WRITE_EVENTS,
        Permission.WRITE_BOOKS,
        Permission.WRITE_CONFLICTS,
        Permission.EDIT_PEOPLE,
        Permission.EDIT_EVENTS,
        Permission.EDIT_BOOKS,
        Permission.EDIT_CONFLICTS,
    ],
    UserRole.MODERATOR: [
        Permission.READ_PUBLIC,
        Permission.READ_PRIVATE,
        Permission.WRITE_PEOPLE,
        Permission.WRITE_EVENTS,
        Permission.WRITE_BOOKS,
        Permission.WRITE_CONFLICTS,
        Permission.WRITE_COUNTRIES,
        Permission.WRITE_ELECTIONS,
        Permission.WRITE_PARTIES,
        Permission.EDIT_PEOPLE,
        Permission.EDIT_EVENTS,
        Permission.EDIT_BOOKS,
        Permission.EDIT_CONFLICTS,
        Permission.EDIT_COUNTRIES,
        Permission.DELETE_PEOPLE,
        Permission.DELETE_EVENTS,
        Permission.DELETE_BOOKS,
        Permission.APPROVE_EDITS,
        Permission.VIEW_ANALYTICS,
    ],
    UserRole.ADMIN: [
        Permission.READ_PUBLIC,
        Permission.READ_PRIVATE,
        Permission.READ_ADMIN,
        Permission.WRITE_PEOPLE,
        Permission.WRITE_EVENTS,
        Permission.WRITE_BOOKS,
        Permission.WRITE_CONFLICTS,
        Permission.WRITE_COUNTRIES,
        Permission.WRITE_ELECTIONS,
        Permission.WRITE_PARTIES,
        Permission.EDIT_PEOPLE,
        Permission.EDIT_EVENTS,
        Permission.EDIT_BOOKS,
        Permission.EDIT_CONFLICTS,
        Permission.EDIT_COUNTRIES,
        Permission.DELETE_PEOPLE,
        Permission.DELETE_EVENTS,
        Permission.DELETE_BOOKS,
        Permission.DELETE_CONFLICTS,
        Permission.MANAGE_USERS,
        Permission.APPROVE_EDITS,
        Permission.VIEW_ANALYTICS,
        Permission.EXPORT_DATA,
        Permission.IMPORT_DATA,
    ],
    UserRole.SUPERADMIN: [p for p in Permission],  # All permissions
}


# SQLAlchemy User model
class User(Base):
    """User database model."""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile
    display_name = Column(String(255))
    avatar_url = Column(String(500))
    bio = Column(String(1000))
    
    # Role and permissions
    role = Column(SQLEnum(UserRole), default=UserRole.VIEWER, nullable=False)
    extra_permissions = Column(ARRAY(String), default=[])
    denied_permissions = Column(ARRAY(String), default=[])
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Audit trail
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    def get_permissions(self) -> List[Permission]:
        """Get all permissions for this user."""
        # Start with role permissions
        perms = set(ROLE_PERMISSIONS.get(self.role, []))
        
        # Add extra permissions
        if self.extra_permissions:
            for p in self.extra_permissions:
                try:
                    perms.add(Permission(p))
                except ValueError:
                    pass
        
        # Remove denied permissions
        if self.denied_permissions:
            for p in self.denied_permissions:
                try:
                    perms.discard(Permission(p))
                except ValueError:
                    pass
        
        return list(perms)
    
    def has_permission(self, permission: Permission) -> bool:
        """Check if user has a specific permission."""
        return permission in self.get_permissions()
    
    def has_role(self, role: UserRole) -> bool:
        """Check if user has at least the specified role level."""
        role_hierarchy = [
            UserRole.VIEWER,
            UserRole.CONTRIBUTOR,
            UserRole.EDITOR,
            UserRole.MODERATOR,
            UserRole.ADMIN,
            UserRole.SUPERADMIN,
        ]
        user_level = role_hierarchy.index(self.role)
        required_level = role_hierarchy.index(role)
        return user_level >= required_level


# Pydantic schemas
class UserCreate(BaseModel):
    """Schema for creating a new user."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)
    display_name: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserRoleUpdate(BaseModel):
    """Schema for updating user role (admin only)."""
    role: UserRole
    extra_permissions: Optional[List[str]] = None
    denied_permissions: Optional[List[str]] = None


class UserResponse(BaseModel):
    """Schema for user response."""
    id: uuid.UUID
    email: str
    username: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime]
    permissions: List[str] = []
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class LoginRequest(BaseModel):
    """Schema for login request."""
    email: EmailStr
    password: str
