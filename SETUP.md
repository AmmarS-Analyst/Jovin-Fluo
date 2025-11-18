# 🚀 Jovin Fluo MVP - Setup Instructions

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (database named "Jovinfluo" should exist)
- pip and npm installed

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Create .env file**
```bash
# Copy the example
cp .env.example .env

# Edit .env with your PostgreSQL credentials
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=Jovinfluo
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
SECRET_KEY=your-secret-key-here
```

5. **Create uploads directory**
```bash
mkdir uploads
```

6. **Run database migrations**
```bash
alembic upgrade head
```

7. **Start backend server**
```bash
python run.py
# Or: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on http://localhost:8000

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env.local file**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **Start development server**
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## Database Setup

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE "Jovinfluo";
```

Then run migrations:
```bash
cd backend
alembic upgrade head
```

## Testing the Application

1. **Start Backend**: http://localhost:8000
2. **Start Frontend**: http://localhost:3000
3. **Access API Docs**: http://localhost:8000/docs

### User Flow
1. Go to http://localhost:3000
2. Click "Sign Up" to create an account
3. Login with your credentials
4. Create a new project
5. Upload a CSV or Excel file
6. View data profile
7. Create visualizations
8. Export data

## Troubleshooting

### Backend Issues
- **Database connection error**: Check PostgreSQL is running and credentials in .env
- **Import errors**: Make sure virtual environment is activated
- **Port already in use**: Change port in run.py or kill the process using port 8000

### Frontend Issues
- **API connection error**: Check NEXT_PUBLIC_API_URL in .env.local
- **Build errors**: Delete node_modules and package-lock.json, then npm install again
- **Type errors**: Run `npm run build` to see TypeScript errors

## File Upload Support

The MVP supports:
- CSV files (.csv)
- Excel files (.xls, .xlsx, .xlsm, .xlsb)

Maximum file size: 100MB (configurable in backend/app/core/config.py)

## Next Steps

After MVP is working:
1. Test with various file formats
2. Test data profiling accuracy
3. Test visualization generation
4. Test export functionality
5. Optimize performance for larger files

