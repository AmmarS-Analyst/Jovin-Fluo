"""SQLAlchemy database models."""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    """User model."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")


class Project(Base):
    """Project model."""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    datasets = relationship("Dataset", back_populates="project", cascade="all, delete-orphan")
    visualizations = relationship("Visualization", back_populates="project", cascade="all, delete-orphan")
    dashboards = relationship("Dashboard", back_populates="project", cascade="all, delete-orphan")


class Dataset(Base):
    """Dataset model."""
    __tablename__ = "datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String(50), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    row_count = Column(Integer, nullable=True)
    column_count = Column(Integer, nullable=True)
    profile_data = Column(JSON, nullable=True)  # Store profiling results
    # Soft delete fields
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    deleted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="datasets")
    calculated_columns = relationship("CalculatedColumn", back_populates="dataset", cascade="all, delete-orphan")
    deleter = relationship("User", foreign_keys=[deleted_by])


class CalculatedColumn(Base):
    """Calculated column model."""
    __tablename__ = "calculated_columns"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    formula = Column(Text, nullable=False)
    data_type = Column(String(50), nullable=False)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    dataset = relationship("Dataset", back_populates="calculated_columns")


class Visualization(Base):
    """Visualization model."""
    __tablename__ = "visualizations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # bar, line, pie, etc.
    config = Column(JSON, nullable=False)  # Chart configuration
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="visualizations")


class Dashboard(Base):
    """Dashboard model."""
    __tablename__ = "dashboards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    layout = Column(JSON, nullable=False)  # Dashboard layout configuration
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="dashboards")


class AnonymizedData(Base):
    """Anonymized data archive for datasets and reports.
    
    This table stores metadata about datasets and reports in JSON format
    to keep the size small. Data is archived here when users delete their
    datasets/reports, but it's not actually deleted - only marked as deleted
    for that specific user. This allows for audit trails and data recovery.
    """
    __tablename__ = "anonymized_data"
    
    id = Column(Integer, primary_key=True, index=True)
    # Type of data: 'dataset', 'report', 'visualization'
    data_type = Column(String(50), nullable=False, index=True)
    # Reference to the original record ID
    original_id = Column(Integer, nullable=False, index=True)
    # User who deleted it
    deleted_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    # Project ID for reference
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True, index=True)
    # Metadata stored as JSON (compact format) - renamed from 'metadata' to avoid SQLAlchemy conflict
    data_metadata = Column(JSON, nullable=False)  # Stores all relevant information
    # Soft delete status (always True here, but kept for consistency)
    is_deleted = Column(Boolean, default=True, nullable=False)
    deleted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[deleted_by])
    project = relationship("Project")

