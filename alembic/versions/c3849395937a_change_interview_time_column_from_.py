"""Change interview_time column from String to DateTime

Revision ID: c3849395937a
Revises: f09e94edccb9
Create Date: 2025-09-06 01:20:31.904522

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3849395937a'
down_revision: Union[str, Sequence[str], None] = 'f09e94edccb9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "interviews",
        "interview_time",
        existing_type=sa.VARCHAR(),
        type_=sa.DateTime(timezone=True),
        postgresql_using="interview_time::timestamp with time zone",
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "interviews",
        "interview_time",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.VARCHAR(),
        postgresql_using="interview_time::text",
        existing_nullable=False,
    )
