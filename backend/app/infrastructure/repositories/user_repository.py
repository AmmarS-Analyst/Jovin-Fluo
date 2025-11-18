"""User repository implementation."""
from typing import Optional
from sqlalchemy.orm import Session
from app.domain.entities import User as UserEntity
from app.infrastructure.database.models import User as UserModel


class UserRepository:
    """User repository."""
    
    def __init__(self, db: Session):
        """Initialize repository."""
        self.db = db
    
    def get_by_email(self, email: str) -> Optional[UserEntity]:
        """Get user by email."""
        user = self.db.query(UserModel).filter(UserModel.email == email).first()
        if not user:
            return None
        
        return UserEntity(
            id=user.id,
            email=user.email,
            hashed_password=user.hashed_password,
            full_name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at,
        )
    
    def get_by_id(self, user_id: int) -> Optional[UserEntity]:
        """Get user by ID."""
        user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            return None
        
        return UserEntity(
            id=user.id,
            email=user.email,
            hashed_password=user.hashed_password,
            full_name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at,
        )
    
    def create(self, user: UserEntity) -> UserEntity:
        """Create a new user."""
        db_user = UserModel(
            email=user.email,
            hashed_password=user.hashed_password,
            full_name=user.full_name,
            is_active=user.is_active,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        user.id = db_user.id
        user.created_at = db_user.created_at
        return user

