"""Add users table for authentication

Revision ID: 7d8e9f0g1h2i
Revises: 6eaff32ca441
Create Date: 2024-01-31 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '7d8e9f0g1h2i'
down_revision: Union[str, None] = '4c5d6e7f8g9h'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create user role enum
    user_role_enum = postgresql.ENUM(
        'viewer', 'contributor', 'editor', 'moderator', 'admin', 'superadmin',
        name='userrole',
        create_type=False
    )
    user_role_enum.create(op.get_bind(), checkfirst=True)
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('username', sa.String(100), unique=True, nullable=False, index=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        
        # Profile
        sa.Column('display_name', sa.String(255)),
        sa.Column('avatar_url', sa.String(500)),
        sa.Column('bio', sa.String(1000)),
        
        # Role and permissions
        sa.Column('role', sa.Enum('viewer', 'contributor', 'editor', 'moderator', 'admin', 'superadmin', name='userrole'), 
                  default='viewer', nullable=False),
        sa.Column('extra_permissions', postgresql.ARRAY(sa.String), default=[]),
        sa.Column('denied_permissions', postgresql.ARRAY(sa.String), default=[]),
        
        # Status
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('is_verified', sa.Boolean, default=False),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('last_login', sa.DateTime),
        
        # Audit
        sa.Column('created_by_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
    )
    
    # Create indexes
    op.create_index('ix_users_role', 'users', ['role'])
    op.create_index('ix_users_is_active', 'users', ['is_active'])


def downgrade() -> None:
    op.drop_index('ix_users_is_active')
    op.drop_index('ix_users_role')
    op.drop_table('users')
    
    # Drop enum
    op.execute('DROP TYPE IF EXISTS userrole')
