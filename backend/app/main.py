"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import auth, projects, datasets, visualizations, exports, calculated_columns

app = FastAPI(
    title="Jovin Fluo API",
    description="Data analytics and visualization platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(datasets.router, prefix="/api/v1/datasets", tags=["Datasets"])
app.include_router(visualizations.router, prefix="/api/v1/visualizations", tags=["Visualizations"])
app.include_router(exports.router, prefix="/api/v1/exports", tags=["Exports"])
app.include_router(calculated_columns.router, prefix="/api/v1/calculated-columns", tags=["Calculated Columns"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Jovin Fluo API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

