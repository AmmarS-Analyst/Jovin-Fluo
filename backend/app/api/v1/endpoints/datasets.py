"""Dataset endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List
import os
import pandas as pd
from datetime import datetime
from app.core.database import get_db
from app.core.schemas import DatasetUploadResponse, DataProfileResponse, ColumnProfile
from app.infrastructure.database.models import Dataset as DatasetModel, Project as ProjectModel, AnonymizedData as AnonymizedDataModel
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
    
    # Validate file size
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE / (1024*1024*1024):.1f}GB"
        )
    
    # Ensure upload directory exists
    ensure_upload_dir()
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Create dataset record
    db_dataset = DatasetModel(
        name=file.filename,
        file_path=file_path,
        file_size=file_size,
        file_type=file_ext,
        project_id=project_id,
        is_deleted=False,
    )
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    
    # Create anonymized_data entry for archival purposes (optional - don't fail if table doesn't exist)
    try:
        anonymized_entry = AnonymizedDataModel(
            data_type='dataset',
            original_id=db_dataset.id,
            deleted_by=user_id,
            project_id=project_id,
            data_metadata={
                'name': db_dataset.name,
                'file_size': db_dataset.file_size,
                'file_type': db_dataset.file_type,
                'project_id': project_id,
                'uploaded_at': db_dataset.created_at.isoformat() if db_dataset.created_at else None,
                'action': 'uploaded',  # Track action type
            },
            is_deleted=False,  # Not deleted yet, just archived
        )
        db.add(anonymized_entry)
        db.commit()
    except Exception as e:
        # Log error but don't fail the upload if anonymized_data table doesn't exist yet
        # This allows uploads to work even before migration is run
        import logging
        logging.warning(f"Failed to create anonymized_data entry: {str(e)}")
        db.rollback()
    
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
    dataset = db.query(DatasetModel).filter(
        DatasetModel.id == dataset_id,
        DatasetModel.is_deleted == False  # Exclude soft-deleted datasets
    ).first()
    
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
        # For large files, read in chunks or limit rows for profiling
        max_rows_for_profiling = 50000  # Profile first 50k rows for performance
        
        if dataset.file_type in [".xlsx", ".xls", ".xlsm", ".xlsb"]:
            df = pd.read_excel(dataset.file_path, nrows=max_rows_for_profiling)
        else:
            df = pd.read_csv(dataset.file_path, nrows=max_rows_for_profiling)
        
        # Get actual row count (read full file for count only)
        try:
            if dataset.file_type in [".xlsx", ".xls", ".xlsm", ".xlsb"]:
                full_df = pd.read_excel(dataset.file_path, usecols=[0])  # Read only first column for count
            else:
                full_df = pd.read_csv(dataset.file_path, usecols=[0])
            actual_row_count = len(full_df)
        except:
            actual_row_count = len(df)
        
        # Get basic info
        row_count = actual_row_count
        columns = []
        
        # Profile each column
        for col in df.columns:
            col_data = df[col]
            null_count = col_data.isnull().sum()
            # Use actual row count for percentage calculation
            null_percentage = (null_count / len(col_data)) * 100 if len(col_data) > 0 else 0
            
            # Detect type
            if pd.api.types.is_numeric_dtype(col_data):
                col_type = "numeric"
                # Get valid numeric values (non-null)
                valid_data = col_data.dropna()
                
                if len(valid_data) > 0:
                    try:
                        stats = {
                            "mean": float(valid_data.mean()) if not pd.isna(valid_data.mean()) else None,
                            "median": float(valid_data.median()) if not pd.isna(valid_data.median()) else None,
                            "std": float(valid_data.std()) if not pd.isna(valid_data.std()) else None,
                            "min": float(valid_data.min()) if not pd.isna(valid_data.min()) else None,
                            "max": float(valid_data.max()) if not pd.isna(valid_data.max()) else None,
                        }
                    except (ValueError, TypeError):
                        # Handle edge cases where calculations fail
                        stats = None
                else:
                    # All values are null/NaN
                    stats = None
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
    
    datasets = db.query(DatasetModel).filter(
        DatasetModel.project_id == project_id,
        DatasetModel.is_deleted == False  # Exclude soft-deleted datasets
    ).all()
    
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


@router.get("/{dataset_id}/data")
async def get_dataset_data(
    dataset_id: int,
    limit: int = Query(100, description="Number of rows to return"),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Get dataset data for calculations preview."""
    dataset = db.query(DatasetModel).filter(
        DatasetModel.id == dataset_id,
        DatasetModel.is_deleted == False
    ).first()
    
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
    
    try:
        # Read dataset
        if dataset.file_type in [".xlsx", ".xls", ".xlsm", ".xlsb"]:
            df = pd.read_excel(dataset.file_path, nrows=limit)
        else:
            df = pd.read_csv(dataset.file_path, nrows=limit)
        
        # Convert to JSON format
        data = {
            "columns": df.columns.tolist(),
            "rows": df.values.tolist(),
            "row_count": len(df)
        }
        
        return data
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading dataset: {str(e)}"
        )


@router.delete("/{dataset_id}", status_code=status.HTTP_200_OK)
async def delete_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Soft delete a dataset (archives to anonymized_data, marks as deleted for user only)."""
    from datetime import datetime
    
    dataset = db.query(DatasetModel).filter(
        DatasetModel.id == dataset_id,
        DatasetModel.is_deleted == False
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found or already deleted"
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
    
    # Archive to anonymized_data with full metadata
    anonymized_entry = AnonymizedDataModel(
        data_type='dataset',
        original_id=dataset.id,
        deleted_by=user_id,
        project_id=dataset.project_id,
        data_metadata={
            'name': dataset.name,
            'file_path': dataset.file_path,
            'file_size': dataset.file_size,
            'file_type': dataset.file_type,
            'project_id': dataset.project_id,
            'project_name': project.name,
            'row_count': dataset.row_count,
            'column_count': dataset.column_count,
            'profile_data': dataset.profile_data,
            'created_at': dataset.created_at.isoformat() if dataset.created_at else None,
            'action': 'deleted',
        },
        is_deleted=True,
        deleted_at=datetime.utcnow(),
    )
    db.add(anonymized_entry)
    
    # Soft delete the dataset (mark as deleted for this user)
    dataset.is_deleted = True
    dataset.deleted_at = datetime.utcnow()
    dataset.deleted_by = user_id
    db.commit()
    
    return {"message": "Dataset deleted successfully", "archived": True}

