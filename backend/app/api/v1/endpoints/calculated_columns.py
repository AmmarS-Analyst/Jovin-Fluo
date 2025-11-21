"""Calculated columns endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.schemas import CalculatedColumnCreate, CalculatedColumnResponse
from app.infrastructure.database.models import CalculatedColumn as CalcColModel, Dataset as DatasetModel, Project as ProjectModel
from app.core.security import decode_access_token
from fastapi import Header

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


@router.post("", response_model=CalculatedColumnResponse, status_code=status.HTTP_201_CREATED)
async def create_calculated_column(
    calc_data: CalculatedColumnCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Create a new calculated column."""
    # Verify dataset ownership
    dataset = db.query(DatasetModel).filter(DatasetModel.id == calc_data.dataset_id).first()
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    project = db.query(ProjectModel).filter(
        ProjectModel.id == dataset.project_id,
        ProjectModel.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    db_calc = CalcColModel(
        name=calc_data.name,
        formula=calc_data.formula,
        data_type=calc_data.data_type,
        dataset_id=calc_data.dataset_id,
    )
    db.add(db_calc)
    db.commit()
    db.refresh(db_calc)
    
    return CalculatedColumnResponse(
        id=db_calc.id,
        name=db_calc.name,
        formula=db_calc.formula,
        data_type=db_calc.data_type,
        dataset_id=db_calc.dataset_id,
        created_at=db_calc.created_at,
    )


@router.get("/dataset/{dataset_id}", response_model=List[CalculatedColumnResponse])
async def list_calculated_columns(
    dataset_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """List calculated columns for a dataset."""
    dataset = db.query(DatasetModel).filter(DatasetModel.id == dataset_id).first()
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    project = db.query(ProjectModel).filter(
        ProjectModel.id == dataset.project_id,
        ProjectModel.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    calc_columns = db.query(CalcColModel).filter(CalcColModel.dataset_id == dataset_id).all()
    
    return [
        CalculatedColumnResponse(
            id=c.id,
            name=c.name,
            formula=c.formula,
            data_type=c.data_type,
            dataset_id=c.dataset_id,
            created_at=c.created_at,
        )
        for c in calc_columns
    ]


@router.delete("/{calc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_calculated_column(
    calc_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Delete a calculated column."""
    calc_col = db.query(CalcColModel).filter(CalcColModel.id == calc_id).first()
    if not calc_col:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calculated column not found"
        )
    
    dataset = db.query(DatasetModel).filter(DatasetModel.id == calc_col.dataset_id).first()
    project = db.query(ProjectModel).filter(
        ProjectModel.id == dataset.project_id,
        ProjectModel.owner_id == user_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    db.delete(calc_col)
    db.commit()
    return None

