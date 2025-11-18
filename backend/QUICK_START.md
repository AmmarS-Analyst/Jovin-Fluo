# Quick Start Guide - Backend Setup

## Step 1: Install Dependencies

Make sure you're in the backend directory with your virtual environment activated:

```bash
cd backend
# Activate venv if not already activated
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

This will install:
- FastAPI and Uvicorn
- SQLAlchemy and Alembic
- Pandas and Excel libraries
- Authentication libraries
- All other required packages

## Step 2: Create .env File

Create a `.env` file in the `backend` directory:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=jovinfluo
POSTGRES_USER=postgres
POSTGRES_PASSWORD=admin
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

**Important**: Update `POSTGRES_PASSWORD` to match your PostgreSQL password (you set it to `admin` in alembic.ini).

## Step 3: Create Uploads Directory

```bash
mkdir uploads
```

## Step 4: Run Database Migrations

Make sure PostgreSQL is running and the database `jovinfluo` exists:

```sql
CREATE DATABASE jovinfluo;
```

Then run migrations:

```bash
alembic upgrade head
```

## Step 5: Start the Server

```bash
python run.py
```

Or:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000
API Documentation: http://localhost:8000/docs

## Troubleshooting

### ModuleNotFoundError
If you get `ModuleNotFoundError`, make sure:
1. Virtual environment is activated
2. All dependencies are installed: `pip install -r requirements.txt`

### Database Connection Error
- Check PostgreSQL is running
- Verify database name is `jovinfluo` (lowercase)
- Check username and password in `.env` match your PostgreSQL setup
- Make sure database exists: `CREATE DATABASE jovinfluo;`

### Port Already in Use
If port 8000 is already in use:
- Change port in `run.py` or use: `uvicorn app.main:app --reload --port 8001`

