"""Domain entities (business objects)."""
from datetime import datetime
from typing import Optional, List, Dict, Any


class User:
    """User domain entity."""
    def __init__(
        self,
        id: Optional[int] = None,
        email: str = "",
        hashed_password: str = "",
        full_name: Optional[str] = None,
        is_active: bool = True,
        created_at: Optional[datetime] = None,
    ):
        self.id = id
        self.email = email
        self.hashed_password = hashed_password
        self.full_name = full_name
        self.is_active = is_active
        self.created_at = created_at or datetime.utcnow()


class Project:
    """Project domain entity."""
    def __init__(
        self,
        id: Optional[int] = None,
        name: str = "",
        description: Optional[str] = None,
        owner_id: int = 0,
        created_at: Optional[datetime] = None,
    ):
        self.id = id
        self.name = name
        self.description = description
        self.owner_id = owner_id
        self.created_at = created_at or datetime.utcnow()


class Dataset:
    """Dataset domain entity."""
    def __init__(
        self,
        id: Optional[int] = None,
        name: str = "",
        file_path: str = "",
        file_size: int = 0,
        file_type: str = "",
        project_id: int = 0,
        row_count: Optional[int] = None,
        column_count: Optional[int] = None,
        profile_data: Optional[Dict[str, Any]] = None,
        created_at: Optional[datetime] = None,
    ):
        self.id = id
        self.name = name
        self.file_path = file_path
        self.file_size = file_size
        self.file_type = file_type
        self.project_id = project_id
        self.row_count = row_count
        self.column_count = column_count
        self.profile_data = profile_data
        self.created_at = created_at or datetime.utcnow()


class DataProfile:
    """Data profile entity."""
    def __init__(
        self,
        columns: List[Dict[str, Any]],
        row_count: int,
        preview_data: List[List[Any]],
        summary: Optional[str] = None,
    ):
        self.columns = columns
        self.row_count = row_count
        self.preview_data = preview_data
        self.summary = summary

