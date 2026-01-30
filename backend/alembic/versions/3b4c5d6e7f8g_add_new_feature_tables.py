"""add_new_feature_tables

Revision ID: 3b4c5d6e7f8g
Revises: 2a3b4c5d6e7f
Create Date: 2026-01-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from geoalchemy2 import Geometry


revision: str = '3b4c5d6e7f8g'
down_revision: Union[str, None] = '2a3b4c5d6e7f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Labor Organizations
    op.create_table(
        'labor_organizations',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('name_native', sa.String(255)),
        sa.Column('abbreviation', sa.String(50)),
        sa.Column('organization_type', sa.String(50), nullable=False),
        sa.Column('industry_sectors', ARRAY(sa.String(100))),
        sa.Column('founded', sa.Date),
        sa.Column('dissolved', sa.Date),
        sa.Column('country_id', UUID(as_uuid=True), sa.ForeignKey('countries.id')),
        sa.Column('headquarters_city', sa.String(255)),
        sa.Column('peak_membership', sa.Integer),
        sa.Column('peak_membership_year', sa.Integer),
        sa.Column('ideology_tags', ARRAY(sa.String(50))),
        sa.Column('political_affiliation', sa.String(100)),
        sa.Column('wikidata_id', sa.String(20), index=True),
        sa.Column('description', sa.Text),
        sa.Column('progressive_analysis', sa.Text),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Strikes
    op.create_table(
        'strikes',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('strike_type', sa.String(50), nullable=False),
        sa.Column('start_date', sa.Date),
        sa.Column('end_date', sa.Date),
        sa.Column('country_id', UUID(as_uuid=True), sa.ForeignKey('countries.id')),
        sa.Column('location_name', sa.String(255)),
        sa.Column('location', Geometry(geometry_type='POINT', srid=4326)),
        sa.Column('organization_id', UUID(as_uuid=True), sa.ForeignKey('labor_organizations.id')),
        sa.Column('participants', sa.Integer),
        sa.Column('industries_affected', ARRAY(sa.String(100))),
        sa.Column('outcome', sa.String(50)),
        sa.Column('demands', ARRAY(sa.String(255))),
        sa.Column('achievements', ARRAY(sa.String(255))),
        sa.Column('casualties', sa.Integer),
        sa.Column('arrests', sa.Integer),
        sa.Column('government_response', sa.Text),
        sa.Column('wikidata_id', sa.String(20), index=True),
        sa.Column('description', sa.Text),
        sa.Column('progressive_analysis', sa.Text),
        sa.Column('significance', sa.Text),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Labor Leaders
    op.create_table(
        'labor_leaders',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('person_id', UUID(as_uuid=True), sa.ForeignKey('people.id')),
        sa.Column('organization_id', UUID(as_uuid=True), sa.ForeignKey('labor_organizations.id')),
        sa.Column('role', sa.String(100), nullable=False),
        sa.Column('start_date', sa.Date),
        sa.Column('end_date', sa.Date),
    )
    
    # Policy Impacts
    op.create_table(
        'policy_impacts',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('policy_id', UUID(as_uuid=True), sa.ForeignKey('policies.id', ondelete='CASCADE')),
        sa.Column('impact_type', sa.String(50), nullable=False),
        sa.Column('impact_direction', sa.String(20), nullable=False),
        sa.Column('metric_name', sa.String(255)),
        sa.Column('metric_value', sa.Float),
        sa.Column('metric_unit', sa.String(50)),
        sa.Column('baseline_value', sa.Float),
        sa.Column('measurement_date', sa.Date),
        sa.Column('years_after_implementation', sa.Integer),
        sa.Column('affected_groups', ARRAY(sa.String(100))),
        sa.Column('geographic_scope', sa.String(50)),
        sa.Column('description', sa.Text),
        sa.Column('evidence_summary', sa.Text),
        sa.Column('source_citation', sa.Text),
        sa.Column('confidence_level', sa.String(20)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Policy Relationships
    op.create_table(
        'policy_relationships',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('source_policy_id', UUID(as_uuid=True), sa.ForeignKey('policies.id', ondelete='CASCADE')),
        sa.Column('target_policy_id', UUID(as_uuid=True), sa.ForeignKey('policies.id', ondelete='CASCADE')),
        sa.Column('relationship_type', sa.String(50), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Research Pathways
    op.create_table(
        'research_pathways',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(100), unique=True, nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('difficulty_level', sa.String(20)),
        sa.Column('estimated_time_minutes', sa.Integer),
        sa.Column('introduction', sa.Text),
        sa.Column('conclusion', sa.Text),
        sa.Column('tags', ARRAY(sa.String(50))),
        sa.Column('regions', ARRAY(sa.String(100))),
        sa.Column('start_year', sa.Integer),
        sa.Column('end_year', sa.Integer),
        sa.Column('image_url', sa.String(500)),
        sa.Column('is_published', sa.Boolean, default=False),
        sa.Column('featured', sa.Boolean, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Pathway Nodes
    op.create_table(
        'pathway_nodes',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('pathway_id', UUID(as_uuid=True), sa.ForeignKey('research_pathways.id', ondelete='CASCADE')),
        sa.Column('order', sa.Integer, nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('entity_type', sa.String(50)),
        sa.Column('entity_id', UUID(as_uuid=True)),
        sa.Column('discussion_questions', ARRAY(sa.Text)),
        sa.Column('further_reading', ARRAY(sa.String(500))),
    )
    
    # Featured Collections
    op.create_table(
        'featured_collections',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(100), unique=True, nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('collection_type', sa.String(50), nullable=False),
        sa.Column('focus_tags', ARRAY(sa.String(50))),
        sa.Column('image_url', sa.String(500)),
        sa.Column('featured', sa.Boolean, default=False),
        sa.Column('is_published', sa.Boolean, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Collection Items
    op.create_table(
        'collection_items',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('collection_id', UUID(as_uuid=True), sa.ForeignKey('featured_collections.id', ondelete='CASCADE')),
        sa.Column('entity_type', sa.String(50), nullable=False),
        sa.Column('entity_id', UUID(as_uuid=True), nullable=False),
        sa.Column('custom_title', sa.String(255)),
        sa.Column('custom_description', sa.Text),
        sa.Column('highlight_reason', sa.Text),
        sa.Column('order', sa.Integer, default=0),
    )
    
    # Media Resources
    op.create_table(
        'media_resources',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('title_original', sa.String(500)),
        sa.Column('media_type', sa.String(50), nullable=False),
        sa.Column('release_year', sa.Integer),
        sa.Column('release_date', sa.Date),
        sa.Column('duration_minutes', sa.Integer),
        sa.Column('director', sa.String(255)),
        sa.Column('producer', sa.String(255)),
        sa.Column('creator', sa.String(255)),
        sa.Column('description', sa.Text),
        sa.Column('synopsis', sa.Text),
        sa.Column('primary_url', sa.String(1000)),
        sa.Column('youtube_url', sa.String(500)),
        sa.Column('archive_url', sa.String(500)),
        sa.Column('imdb_url', sa.String(500)),
        sa.Column('thumbnail_url', sa.String(500)),
        sa.Column('language', sa.String(50)),
        sa.Column('has_subtitles', ARRAY(sa.String(10))),
        sa.Column('topics', ARRAY(sa.String(100))),
        sa.Column('regions', ARRAY(sa.String(100))),
        sa.Column('time_period_start', sa.Integer),
        sa.Column('time_period_end', sa.Integer),
        sa.Column('wikidata_id', sa.String(20), index=True),
        sa.Column('imdb_id', sa.String(20), index=True),
        sa.Column('progressive_relevance', sa.Text),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Media Entity Links
    op.create_table(
        'media_entity_links',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('media_id', UUID(as_uuid=True), sa.ForeignKey('media_resources.id', ondelete='CASCADE')),
        sa.Column('entity_type', sa.String(50), nullable=False),
        sa.Column('entity_id', UUID(as_uuid=True), nullable=False),
        sa.Column('relationship', sa.String(50), nullable=False),
        sa.Column('notes', sa.Text),
    )
    
    # Create indexes for new tables
    op.create_index('idx_labor_orgs_country', 'labor_organizations', ['country_id'])
    op.create_index('idx_strikes_country', 'strikes', ['country_id'])
    op.create_index('idx_strikes_date', 'strikes', ['start_date'])
    op.create_index('idx_policy_impacts_policy', 'policy_impacts', ['policy_id'])
    op.create_index('idx_pathway_nodes_pathway', 'pathway_nodes', ['pathway_id'])
    op.create_index('idx_collection_items_collection', 'collection_items', ['collection_id'])
    op.create_index('idx_media_type', 'media_resources', ['media_type'])
    op.create_index('idx_media_entity_links_entity', 'media_entity_links', ['entity_type', 'entity_id'])


def downgrade() -> None:
    op.drop_table('media_entity_links')
    op.drop_table('media_resources')
    op.drop_table('collection_items')
    op.drop_table('featured_collections')
    op.drop_table('pathway_nodes')
    op.drop_table('research_pathways')
    op.drop_table('policy_relationships')
    op.drop_table('policy_impacts')
    op.drop_table('labor_leaders')
    op.drop_table('strikes')
    op.drop_table('labor_organizations')
