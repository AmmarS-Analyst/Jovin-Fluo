# 🚀 Getting Started with Jovin Fluo

This guide will help you set up Jovin Fluo on your local machine for development.

## Prerequisites

### Required Software

- **Node.js**: 18.0 or higher ([Download](https://nodejs.org/))
- **Python**: 3.11 or higher ([Download](https://www.python.org/downloads/))
- **Docker**: Latest version ([Download](https://www.docker.com/products/docker-desktop))
- **Docker Compose**: Included with Docker Desktop
- **Git**: Latest version ([Download](https://git-scm.com/downloads))

### Optional (for C++ development)

- **C++ Compiler**: 
  - Windows: Visual Studio 2022 Build Tools or MSVC
  - macOS: Xcode Command Line Tools (`xcode-select --install`)
  - Linux: GCC 9+ or Clang 10+
- **CMake**: 3.20 or higher ([Download](https://cmake.org/download/))

## Quick Start (Docker)

The fastest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/your-username/jovin-fluo.git
cd jovin-fluo

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Manual Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/jovin-fluo.git
cd jovin-fluo
```

### 2. Backend Setup

#### Create Virtual Environment

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt  # For development
```

#### Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=jovin_fluo
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379

# API
SECRET_KEY=your-secret-key-here-change-in-production
CORS_ORIGINS=http://localhost:3000

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600  # 100MB
```

#### Database Setup

```bash
# Start PostgreSQL (if not using Docker)
# Using Docker:
docker run --name jovin-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=jovin_fluo \
  -p 5432:5432 \
  -d postgres:15

# Run migrations
alembic upgrade head

# (Optional) Seed database
python scripts/seed.py
```

#### Start Backend Server

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or use the script
python scripts/start_dev.py
```

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
# or
yarn install
# or
pnpm install
```

#### Environment Configuration

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

#### Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The frontend will be available at http://localhost:3000

### 4. C++ Engine Setup (Optional)

#### Install Dependencies

**Windows:**
```powershell
# Install vcpkg
git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg
.\bootstrap-vcpkg.bat
.\vcpkg integrate install

# Install required packages
.\vcpkg install grpc protobuf arrow
```

**macOS:**
```bash
brew install grpc protobuf apache-arrow
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y \
  build-essential \
  cmake \
  libgrpc++-dev \
  libprotobuf-dev \
  protobuf-compiler-grpc \
  libarrow-dev
```

#### Build the Engine

```bash
cd engine
mkdir build && cd build
cmake ..
make  # or 'cmake --build .' on Windows
```

#### Run the Engine

```bash
./processor  # or processor.exe on Windows
```

## Development Workflow

### Running Tests

#### Backend Tests
```bash
cd backend
pytest
pytest tests/ -v  # Verbose output
pytest tests/ -k test_name  # Run specific test
```

#### Frontend Tests
```bash
cd frontend
npm test
npm run test:watch  # Watch mode
```

#### C++ Tests
```bash
cd engine/build
ctest
```

### Code Quality

#### Backend
```bash
cd backend
black .  # Format code
ruff check .  # Lint code
mypy .  # Type check
```

#### Frontend
```bash
cd frontend
npm run lint  # ESLint
npm run format  # Prettier
```

### Database Migrations

```bash
cd backend

# Create a new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Docker Development

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild services
docker-compose build

# Clean everything
docker-compose down -v
```

## Project Structure

```
jovin-fluo/
├── backend/              # Python FastAPI backend
│   ├── app/             # Application code
│   ├── tests/           # Backend tests
│   ├── migrations/      # Database migrations
│   └── requirements.txt # Python dependencies
├── frontend/            # Next.js frontend
│   ├── app/            # Next.js app directory
│   ├── components/      # React components
│   ├── lib/            # Utilities
│   └── package.json    # Node dependencies
├── engine/              # C++ processing engine
│   ├── src/            # C++ source code
│   ├── tests/          # C++ tests
│   └── CMakeLists.txt  # CMake configuration
├── proto/               # Protocol buffer definitions
├── docs/                # Documentation
└── docker-compose.yml   # Docker configuration
```

## Common Issues & Solutions

### Port Already in Use

**Error**: `Address already in use`

**Solution**:
```bash
# Find process using port
# Windows:
netstat -ano | findstr :8000
# macOS/Linux:
lsof -i :8000

# Kill the process or change port in .env
```

### Database Connection Error

**Error**: `Could not connect to database`

**Solution**:
1. Ensure PostgreSQL is running
2. Check connection credentials in `.env`
3. Verify database exists: `psql -U postgres -l`

### Python Virtual Environment Issues

**Error**: `Module not found`

**Solution**:
```bash
# Ensure virtual environment is activated
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Node Modules Issues

**Error**: `Cannot find module`

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### C++ Build Errors

**Error**: `CMake not found` or compilation errors

**Solution**:
1. Ensure CMake is installed and in PATH
2. Install required C++ libraries (see C++ Engine Setup)
3. Check CMakeLists.txt for correct paths

## Next Steps

1. **Read the Documentation**:
   - [Architecture](ARCHITECTURE.md) - Understand the system design
   - [Development Guide](DEVELOPMENT.md) - Learn about development phases
   - [Tech Stack](TECH_STACK.md) - Explore technologies used

2. **Explore the Codebase**:
   - Start with `backend/app/main.py` (API entry point)
   - Check `frontend/app/page.tsx` (Frontend entry point)
   - Review `engine/src/main.cpp` (C++ engine entry point)

3. **Run the Application**:
   - Create an account at http://localhost:3000
   - Upload a sample CSV file
   - Create your first dashboard

4. **Contribute**:
   - Read [Contributing Guide](CONTRIBUTING.md)
   - Pick an issue from GitHub
   - Submit your first pull request

## Getting Help

- **Documentation**: Check the [docs](.) directory
- **Issues**: Open an issue on [GitHub](https://github.com/your-username/jovin-fluo/issues)
- **Discussions**: Join our [Discord](https://discord.gg/jovin-fluo)
- **Email**: team@jovin-fluo.com

## Development Tips

1. **Use VS Code**: Recommended IDE with excellent extensions
2. **Enable Auto-format**: Configure your editor to format on save
3. **Use Git Hooks**: Install pre-commit hooks for code quality
4. **Read Logs**: Check application logs for debugging
5. **Use API Docs**: Explore http://localhost:8000/docs for API testing

Happy coding! 🎉

