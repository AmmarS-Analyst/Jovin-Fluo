# Jovin Studio - Windows 10/11 Detailed Environment Setup

## Phase 1: Windows Prerequisites & System Setup

### 1.1 Enable Windows Features
```powershell
# Run as Administrator in PowerShell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform

# Restart required after this
```

### 1.2 Install Chocolatey (Package Manager)
```powershell
# Run as Administrator in PowerShell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Verify installation
choco --version
```

### 1.3 Install Git
```powershell
choco install git -y
choco install git-lfs -y  # For large files

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global core.autocrlf true
```

## Phase 2: Python 3.11+ Setup

### 2.1 Install Python
```powershell
choco install python311 -y
choco install pip -y

# Verify
python --version    # Should show 3.11.x
pip --version
```

### 2.2 Create Virtual Environment
```powershell
cd jovin-studio\backend
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Your prompt should show (venv)
```

### 2.3 Backend Dependencies - requirements.txt
Create `backend\requirements.txt`:
```
# Web Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
hypercorn==0.14.4

# Data Processing
pandas==2.1.3
numpy==1.25.2
duckdb==0.9.2
pyarrow==14.0.1
polars==0.19.12

# Database
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.12.1

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# gRPC & Protobuf
grpcio==1.59.0
grpcio-tools==1.59.0
protobuf==4.25.0

# Task Queue
celery==5.3.4
redis==5.0.1

# File Processing
openpyxl==3.1.2
pdfplumber==0.10.3
python-docx==1.1.0

# Development
pytest==7.4.3
black==23.9.1
flake8==6.1.0
mypy==1.6.1
```

### 2.4 Development Dependencies - f
Create `backend\requirements-dev.txt`:
```
# Testing
pytest-asyncio==0.21.1
pytest-cov==4.1.0
httpx==0.25.2

# Code Quality
pre-commit==3.5.0
isort==5.12.0
bandit==1.7.5
safety==2.3.5

# Documentation
mkdocs==1.5.3
mkdocs-material==9.4.1

# Debugging
ipdb==0.13.13
debugpy==1.8.0
```

### 2.5 Install Backend Dependencies
```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## Phase 3: Node.js & Frontend Setup

### 3.1 Install Node.js 20 LTS
```powershell
choco install nodejs-lts -y

# Verify
node --version    # Should show v20.x.x
npm --version
```

### 3.2 Frontend Dependencies - package.json
Create `frontend\package.json`:
```json
{
  "name": "jovin-studio-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview --host"
  },
  "dependencies": {
    // React Core
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    
    // State Management
    "zustand": "^4.4.1",
    "immer": "^10.0.3",
    
    // UI & Styling
    "@chakra-ui/react": "^2.8.0",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "framer-motion": "^10.16.1",
    
    // Data Visualization
    "recharts": "^2.8.0",
    "vega": "^5.25.0",
    "vega-lite": "^5.14.1",
    "vega-embed": "^6.23.0",
    "@visx/visx": "^3.3.0",
    
    // Drag & Drop
    "react-dnd": "^16.0.1",
    "react-dnd-html5-backend": "^16.0.1",
    "react-grid-layout": "^1.3.4",
    
    // Code Editor
    "@monaco-editor/react": "^4.5.2",
    "monaco-editor": "^0.44.0",
    
    // Forms & Validation
    "react-hook-form": "^7.47.0",
    "zod": "^3.22.4",
    
    // HTTP Client
    "axios": "^1.5.0",
    
    // Utilities
    "date-fns": "^2.30.0",
    "lodash-es": "^4.17.21",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    // Build Tools
    "@vitejs/plugin-react": "^4.1.1",
    "vite": "^4.5.0",
    "typescript": "^5.2.2",
    "@types/react": "^18.2.25",
    "@types/react-dom": "^18.2.11",
    
    // Code Quality
    "@typescript-eslint/eslint-plugin": "^6.7.2",
    "@typescript-eslint/parser": "^6.7.2",
    "eslint": "^8.50.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    
    // Testing
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.3",
    "@vitest/ui": "^0.34.6",
    
    // Type Definitions
    "@types/lodash-es": "^4.17.8",
    "@types/uuid": "^9.0.7",
    "@types/react-grid-layout": "^1.3.2"
  }
}
```

### 3.3 Install Frontend Dependencies
```powershell
cd frontend
npm install //done till here


# For production build test
npm run build
```

## Phase 4: C++ Development Environment

### 4.1 Install Visual Studio Build Tools
```powershell
# Install Visual Studio 2022 Build Tools
choco install visualstudio2022buildtools -y

# Install C++ components individually
choco install visualstudio2022-workload-vctools -y
```
// done till here
### 4.2 Install C++ Tools & Libraries 

```powershell
# CMake
choco install cmake --installargs 'ADD_CMAKE_TO_PATH=System' -y

# vcpkg for C++ package management
choco install vcpkg -y

# Google Test
choco install gtest -y
```

### 4.3 Install C++ Dependencies via vcpkg
```powershell
# Initialize vcpkg
cd C:\tools\vcpkg
.\vcpkg integrate install

# Install required libraries
.\vcpkg install grpc
.\vcpkg install protobuf
.\vcpkg install arrow
.\vcpkg install gtest
.\vcpkg install simdjson
.\vcpkg install fmt
.\vcpkg install spdlog
```

### 4.4 C++ Project Dependencies - vcpkg.json
Create `processor\vcpkg.json`:
```json
{
  "name": "jovin-processor",
  "version-string": "0.1.0",
  "dependencies": [
    "grpc",
    "protobuf",
    "arrow",
    "gtest",
    "simdjson",
    "fmt",
    "spdlog",
    "zlib",
    "openssl"
  ]
}
```

## Phase 5: Database & Storage

### 5.1 Install PostgreSQL
```powershell
# Install PostgreSQL
choco install postgresql -y

# Or use Docker (recommended for development)
```

### 5.2 Install Redis
```powershell
choco install redis-64 -y

# Or use Docker version
```

## Phase 6: Docker Setup

### 6.1 Install Docker Desktop
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Install with WSL 2 backend
3. Enable Kubernetes in Docker Desktop settings (optional)

### 6.2 Verify Docker Installation
```powershell
docker --version
docker-compose --version

# Test with hello-world
docker run hello-world
```

### 6.3 Docker Development Images
We'll use these official images:
- **PostgreSQL**: `postgres:15-alpine`
- **Redis**: `redis:7-alpine`
- **MinIO**: `minio/minio:latest`
- **Backend**: Custom Python 3.11
- **Frontend**: Custom Node.js 20
- **Processor**: Custom C++ 20

## Phase 7: Protocol Buffers Setup

### 7.1 Install Protobuf Compiler
```powershell
choco install protoc -y

# Verify
protoc --version
```

### 7.2 Install gRPC Tools
```powershell
# Python gRPC tools (already in requirements.txt)
# C++ gRPC (installed via vcpkg)

# Verify Python gRPC
python -c "import grpc; print('gRPC Python OK')"
```

## Phase 8: Development Tools & IDE Setup

### 8.1 Install VS Code
```powershell
choco install vscode -y
```

### 8.2 Essential VS Code Extensions
```powershell
# Install via command line or VS Code marketplace
code --install-extension ms-python.python
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.cpptools
code --install-extension ms-vscode.cmake-tools
code --install-extension zixuanwang.linkerscript
code --install-extension ms-vscode-remote.remote-wsl
code --install-extension ms-azuretools.vscode-docker
code --install-extension eamodio.gitlens
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
```

### 8.3 Additional Development Tools
```powershell
# HTTP Client for API testing
choco install postman -y

# Database GUI
choco install dbeaver -y

# Redis GUI
choco install redis-commander -y
```

## Phase 9: Project Configuration Files

### 9.1 Create Windows-Specific Scripts
Create `scripts\windows\setup.ps1`:
```powershell
# Windows setup script
Write-Host "Setting up Jovin Studio on Windows..." -ForegroundColor Green

# Check prerequisites
$prerequisites = @("python", "node", "docker", "git")
foreach ($tool in $prerequisites) {
    if (Get-Command $tool -ErrorAction SilentlyContinue) {
        Write-Host "✓ $tool installed" -ForegroundColor Green
    } else {
        Write-Host "✗ $tool missing" -ForegroundColor Red
    }
}
```

### 9.2 Environment Configuration
Create `.env.dev`:
```
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=jovin_studio
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379

# Backend
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
SECRET_KEY=your-secret-key-here

# Frontend
VITE_API_BASE_URL=http://localhost:8000/api/v1

# C++ Processor
PROCESSOR_HOST=localhost
PROCESSOR_PORT=50051

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600  # 100MB
```

## Phase 10: Verification & Testing

### 10.1 Complete System Check
```powershell
# Run verification script
.\scripts\windows\verify.ps1

# Expected output:
# ✓ Python 3.11.x
# ✓ Node.js v20.x.x  
# ✓ Docker running
# ✓ PostgreSQL available
# ✓ Redis available
# ✓ All services can start
```

### 10.2 Test Development Environment
```powershell
# Start backend
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# In another terminal - start frontend
cd frontend
npm run dev

# Test in browser: http://localhost:3000
# Test API: http://localhost:8000/docs
```

## Windows-Specific Notes

### Path Configuration
Add these to your system PATH:
- `C:\Program Files\Git\bin`
- `C:\Program Files\Docker\Docker\resources\bin`
- `C:\tools\vcpkg`
- Your Python Scripts directory

### Firewall Configuration
Allow these ports:
- **3000** - Frontend development
- **8000** - Backend API
- **5432** - PostgreSQL
- **6379** - Redis
- **50051** - gRPC service

### Performance Tips
1. Add project folder to Windows Defender exclusions
2. Use WSL 2 for better Docker performance
3. Store large files outside user folder
4. Use SSD for better build times

This setup provides a complete Windows development environment for Jovin Studio with all necessary dependencies and tools.