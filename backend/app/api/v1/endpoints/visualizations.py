"""Visualization endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.schemas import VisualizationCreate, VisualizationResponse
from app.infrastructure.database.models import Visualization as VizModel, Project as ProjectModel
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


@router.post("", response_model=VisualizationResponse, status_code=status.HTTP_201_CREATED)
async def create_visualization(
    viz_data: VisualizationCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Create a new visualization."""
    from app.infrastructure.database.models import Dataset as DatasetModel
    
    # If dataset_id is provided, get project_id from dataset
    project_id = viz_data.project_id
    if viz_data.dataset_id:
        dataset = db.query(DatasetModel).filter(
            DatasetModel.id == viz_data.dataset_id,
            DatasetModel.is_deleted == False  # Exclude soft-deleted datasets
        ).first()
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        project_id = dataset.project_id
    
    if not project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either project_id or dataset_id must be provided"
        )
    
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
    
    db_viz = VizModel(
        name=viz_data.name,
        type=viz_data.type,
        config=viz_data.config,
        project_id=project_id,
    )
    db.add(db_viz)
    db.commit()
    db.refresh(db_viz)
    
    return VisualizationResponse(
        id=db_viz.id,
        name=db_viz.name,
        type=db_viz.type,
        config=db_viz.config,
        project_id=db_viz.project_id,
        created_at=db_viz.created_at,
    )


@router.get("/project/{project_id}", response_model=List[VisualizationResponse])
async def list_visualizations(
    project_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """List visualizations in a project."""
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
    
    visualizations = db.query(VizModel).filter(VizModel.project_id == project_id).all()
    
    return [
        VisualizationResponse(
            id=v.id,
            name=v.name,
            type=v.type,
            config=v.config,
            project_id=v.project_id,
            created_at=v.created_at,
        )
        for v in visualizations
    ]

