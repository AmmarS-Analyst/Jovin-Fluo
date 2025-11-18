"""Application configuration."""
from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    """Application settings."""
    
    # Database
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "jovinfluo"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password"
    
    @property
    def DATABASE_URL(self) -> str:
        """Get database URL."""
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - can be comma-separated string or JSON array
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        """Get CORS origins as a list."""
        if self.CORS_ORIGINS.startswith('['):
            # JSON array format
            return json.loads(self.CORS_ORIGINS)
        else:
            # Comma-separated format
            return [origin.strip() for origin in self.CORS_ORIGINS.split(',')]
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 104857600  # 100MB
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS: List[str] = [".csv", ".xlsx", ".xls", ".xlsm", ".xlsb"]
    
    class Config:
        """Pydantic config."""
        env_file = ".env"
        case_sensitive = True


settings = Settings()

