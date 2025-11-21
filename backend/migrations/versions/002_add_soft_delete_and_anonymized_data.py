"""add soft delete and anonymized data

Revision ID: 002_soft_delete
Revises: 001_initial
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_soft_delete'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add soft-delete fields to datasets table
    op.add_column('datasets', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    op.add_column('datasets', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('datasets', sa.Column('deleted_by', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_datasets_is_deleted'), 'datasets', ['is_deleted'], unique=False)
    op.create_foreign_key('datasets_deleted_by_fkey', 'datasets', 'users', ['deleted_by'], ['id'])
    
    # Create anonymized_data table
    op.create_table(
        'anonymized_data',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('data_type', sa.String(length=50), nullable=False),
        sa.Column('original_id', sa.Integer(), nullable=False),
        sa.Column('deleted_by', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=True),
        sa.Column('data_metadata', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('deleted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['deleted_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_anonymized_data_id'), 'anonymized_data', ['id'], unique=False)
    op.create_index(op.f('ix_anonymized_data_data_type'), 'anonymized_data', ['data_type'], unique=False)
    op.create_index(op.f('ix_anonymized_data_original_id'), 'anonymized_data', ['original_id'], unique=False)
    op.create_index(op.f('ix_anonymized_data_deleted_by'), 'anonymized_data', ['deleted_by'], unique=False)
    op.create_index(op.f('ix_anonymized_data_project_id'), 'anonymized_data', ['project_id'], unique=False)


def downgrade() -> None:
    # Drop anonymized_data table
    op.drop_index(op.f('ix_anonymized_data_project_id'), table_name='anonymized_data')
    op.drop_index(op.f('ix_anonymized_data_deleted_by'), table_name='anonymized_data')
    op.drop_index(op.f('ix_anonymized_data_original_id'), table_name='anonymized_data')
    op.drop_index(op.f('ix_anonymized_data_data_type'), table_name='anonymized_data')
    op.drop_index(op.f('ix_anonymized_data_id'), table_name='anonymized_data')
    op.drop_table('anonymized_data')
    
    # Remove soft-delete fields from datasets table
    op.drop_constraint('datasets_deleted_by_fkey', 'datasets', type_='foreignkey')
    op.drop_index(op.f('ix_datasets_is_deleted'), table_name='datasets')
    op.drop_column('datasets', 'deleted_by')
    op.drop_column('datasets', 'deleted_at')
    op.drop_column('datasets', 'is_deleted')

