"""Dataset endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List
import os
import pandas as pd
from datetime import datetime
from app.core.database import get_db
from app.core.schemas import DatasetUploadResponse, DataProfileResponse, ColumnProfile
from app.infrastructure.database.models import Dataset as DatasetModel, Project as ProjectModel
from app.core.security import decode_access_token
from app.core.config import settings
from fastapi import Header
import uuid

router = APIRouter()


def get_current_user_id(authorization: str = Header(None)) -> int:
    """Get current user ID from token."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    return payload.get("user_id")


def ensure_upload_dir():
    """Ensure upload directory exists."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=DatasetUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    project_id: int = Query(..., description="Project ID"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Upload a dataset file."""
    # Verify project ownership
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Ensure upload directory exists
    ensure_upload_dir()
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save file
    file_size = 0
    with open(file_path, "wb") as f:
        content = await file.read()
        file_size = len(content)
        f.write(content)
    
    # Create dataset record
    db_dataset = DatasetModel(
        name=file.filename,
        file_path=file_path,
        file_size=file_size,
        file_type=file_ext,
        project_id=project_id,
    )
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    
    return DatasetUploadResponse(
        id=db_dataset.id,
        name=db_dataset.name,
        file_size=db_dataset.file_size,
        file_type=db_dataset.file_type,
        project_id=db_dataset.project_id,
        created_at=db_dataset.created_at,
    )


@router.get("/{dataset_id}/profile", response_model=DataProfileResponse)
async def get_dataset_profile(
    dataset_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get dataset profile and statistics."""
    dataset = db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Verify project ownership
    project = db.query(ProjectModel).filter(
        ProjectModel.id == dataset.project_id,
        ProjectModel.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Read and profile the file
    try:
        if dataset.file_type in [".xlsx", ".xls", ".xlsm", ".xlsb"]:
            df = pd.read_excel(dataset.file_path, nrows=10000)  # Limit for performance
        else:
            df = pd.read_csv(dataset.file_path, nrows=10000)
        
        # Get basic info
        row_count = len(df)
        columns = []
        
        # Profile each column
        for col in df.columns:
            col_data = df[col]
            null_count = col_data.isnull().sum()
            null_percentage = (null_count / row_count) * 100 if row_count > 0 else 0
            
            # Detect type
            if pd.api.types.is_numeric_dtype(col_data):
                col_type = "numeric"
                stats = {
                    "mean": float(col_data.mean()) if not col_data.empty else None,
                    "median": float(col_data.median()) if not col_data.empty else None,
                    "std": float(col_data.std()) if not col_data.empty else None,
                    "min": float(col_data.min()) if not col_data.empty else None,
                    "max": float(col_data.max()) if not col_data.empty else None,
                }
            elif pd.api.types.is_datetime64_any_dtype(col_data):
                col_type = "datetime"
                stats = None
            elif pd.api.types.is_bool_dtype(col_data):
                col_type = "boolean"
                stats = None
            else:
                col_type = "string"
                stats = None
            
            distinct_count = col_data.nunique()
            
            columns.append(ColumnProfile(
                name=col,
                type=col_type,
                null_percentage=round(null_percentage, 2),
                distinct_count=int(distinct_count),
                statistics=stats,
            ))
        
        # Get preview data (first 10 rows)
        preview_data = df.head(10).values.tolist()
        
        # Update dataset record
        dataset.row_count = row_count
        dataset.column_count = len(columns)
        dataset.profile_data = {
            "columns": [col.dict() for col in columns],
            "row_count": row_count,
        }
        db.commit()
        
        return DataProfileResponse(
            columns=columns,
            row_count=row_count,
            preview_data=preview_data,
            summary=f"Dataset with {row_count} rows and {len(columns)} columns",
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}"
        )


@router.get("/project/{project_id}", response_model=List[DatasetUploadResponse])
async def list_datasets(
    project_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """List datasets in a project."""
    # Verify project ownership
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    datasets = db.query(DatasetModel).filter(DatasetModel.project_id == project_id).all()
    
    return [
        DatasetUploadResponse(
            id=d.id,
            name=d.name,
            file_size=d.file_size,
            file_type=d.file_type,
            project_id=d.project_id,
            created_at=d.created_at,
        )
        for d in datasets
    ]

