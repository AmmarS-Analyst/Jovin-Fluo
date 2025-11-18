"""Export endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
import pandas as pd
import os
from app.core.database import get_db
from app.infrastructure.database.models import Dataset as DatasetModel, Project as ProjectModel
from app.core.security import decode_access_token
from fastapi import Header
import io

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


@router.get("/dataset/{dataset_id}/csv")
async def export_dataset_csv(
    dataset_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Export dataset as CSV."""
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
    
    # Read and export file
    try:
        if dataset.file_type in [".xlsx", ".xls", ".xlsm", ".xlsb"]:
            df = pd.read_excel(dataset.file_path)
        else:
            df = pd.read_csv(dataset.file_path)
        
        # Convert to CSV
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={dataset.name}.csv"}
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error exporting file: {str(e)}"
        )

