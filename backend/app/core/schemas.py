"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime


# User Schemas
class UserCreate(BaseModel):
    """User creation schema."""
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    """User login schema."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response schema."""
    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """Token response schema."""
    access_token: str
    token_type: str = "bearer"


# Project Schemas
class ProjectCreate(BaseModel):
    """Project creation schema."""
    name: str
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    """Project response schema."""
    id: int
    name: str
    description: Optional[str] = None
    owner_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Dataset Schemas
class DatasetUploadResponse(BaseModel):
    """Dataset upload response schema."""
    id: int
    name: str
    file_size: int
    file_type: str
    project_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ColumnProfile(BaseModel):
    """Column profile schema."""
    name: str
    type: str
    null_percentage: float
    distinct_count: Optional[int] = None
    statistics: Optional[Dict[str, Any]] = None


class DataProfileResponse(BaseModel):
    """Data profile response schema."""
    columns: List[ColumnProfile]
    row_count: int
    preview_data: List[List[Any]]
    summary: Optional[str] = None


# Visualization Schemas
class VisualizationCreate(BaseModel):
    """Visualization creation schema."""
    name: str
    type: str
    config: Dict[str, Any]
    project_id: Optional[int] = None
    dataset_id: Optional[int] = None


class VisualizationResponse(BaseModel):
    """Visualization response schema."""
    id: int
    name: str
    type: str
    config: Dict[str, Any]
    project_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Calculated Column Schemas
class CalculatedColumnCreate(BaseModel):
    """Calculated column creation schema."""
    name: str
    formula: str
    data_type: str
    dataset_id: int


class CalculatedColumnResponse(BaseModel):
    """Calculated column response schema."""
    id: int
    name: str
    formula: str
    data_type: str
    dataset_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Export Schemas
class ExportRequest(BaseModel):
    """Export request schema."""
    dataset_id: int
    format: str
    include_visualizations: bool = False
    visualization_ids: Optional[List[int]] = None

