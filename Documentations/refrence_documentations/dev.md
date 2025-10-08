# Jovin Studio - Environment Setup Guide (No Code)

## Phase 1: Install Core Development Tools

### 1.1 System Prerequisites
- **Operating System**: Windows 10/11, macOS, or Linux (Ubuntu recommended)
- **RAM**: Minimum 8GB, 16GB recommended
- **Storage**: 10GB free space

### 1.2 Install Package Managers
```bash
# Windows: Install Chocolatey (admin PowerShell)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# macOS: Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Linux (Ubuntu): apt built-in
sudo apt update && sudo apt upgrade -y
```

### 1.3 Install Python 3.11+
```bash
# Windows (Chocolatey)
choco install python311

# macOS (Homebrew)
brew install python@3.11

# Linux (Ubuntu)
sudo apt install python3.11 python3.11-venv python3.11-dev
```

### 1.4 Install Node.js 20+
```bash
# Windows
choco install nodejs

# macOS
brew install node

# Linux
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 1.5 Install C++ Build Tools
```bash
# Windows
choco install visualstudio2022buildtools
choco install cmake --installargs 'ADD_CMAKE_TO_PATH=System'

# macOS
brew install cmake gcc

# Linux
sudo apt install build-essential cmake gcc g++ clang
```

### 1.6 Install Docker
```bash
# Windows: Download Docker Desktop from docker.com
# macOS: Download Docker Desktop from docker.com
# Linux
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

## Phase 2: Project Structure Setup

### 2.1 Create Project Directory
```bash
mkdir jovin-studio
cd jovin-studio

# Create complete folder structure
mkdir -p backend/app/{api,services,models,core}
mkdir -p frontend/src/{components,builder,editors,services,types,utils}
mkdir -p processor/{src,include,proto,build}
mkdir -p proto
mkdir -p infra/{docker,kubernetes,scripts}
mkdir -p docs/{architecture,api,setup}
mkdir -p scripts/{build,deploy,dev}
```

### 2.2 Initialize Development Environment
```bash
# Initialize Git
git init

# Create basic configuration files
touch README.md
touch .gitignore
touch .env.example
touch docker-compose.yml
touch docker-compose.dev.yml
```

## Phase 3: Backend Environment Setup

### 3.1 Python Virtual Environment
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### 3.2 Create Backend Requirements
Create these files with exact version pinning:

**backend/requirements.txt** - Core dependencies
**backend/requirements-dev.txt** - Development dependencies

### 3.3 Backend Configuration
```bash
# Create configuration structure
mkdir -p app/core
mkdir -p app/utils
mkdir -p tests
mkdir -p alembic/versions

# Create configuration files
touch app/__init__.py
touch app/core/__init__.py
touch app/core/config.py
touch app/core/database.py
```

## Phase 4: Frontend Environment Setup

### 4.1 Initialize React + TypeScript
```bash
cd frontend
npm create vite@latest . -- --template react-ts
```

### 4.2 Install Frontend Dependencies
Install these package categories in order:
1. UI & Styling
2. Data Visualization
3. Drag & Drop
4. Editor & Code
5. State Management
6. Development Tools

### 4.3 Frontend Configuration
```bash
# Create configuration files
touch tsconfig.json
touch vite.config.ts
touch .eslintrc.js
touch .prettierrc

# Create folder structure
mkdir -p public
mkdir -p src/assets
```

## Phase 5: C++ Processor Environment

### 5.1 Install C++ Dependencies
```bash
cd processor

# Install system libraries
# Windows: via vcpkg or build from source
# macOS: 
brew install grpc protobuf apache-arrow

# Linux:
sudo apt install libgrpc++-dev libprotobuf-dev protobuf-compiler-grpc libarrow-dev
```

### 5.2 C++ Project Structure
```bash
# Create CMake build system
touch CMakeLists.txt
touch build.sh
touch run.sh

# Create source structure
mkdir -p src/core
mkdir -p src/services
mkdir -p src/utils
mkdir -p tests
```

## Phase 6: Protocol Buffers Setup

### 6.1 Install Protobuf Tools
```bash
# Install protoc compiler
# Windows: choco install protoc
# macOS: brew install protobuf
# Linux: sudo apt install protobuf-compiler

# Install gRPC tools
pip install grpcio-tools
```

### 6.2 Create Proto Structure
```bash
cd proto
mkdir -p processor
mkdir -p shared

# Create initial .proto files
touch processor/processor.proto
touch shared/types.proto
```

## Phase 7: Docker Environment

### 7.1 Create Dockerfiles
Create these Dockerfiles:
- **backend/Dockerfile** - Python FastAPI
- **frontend/Dockerfile** - React build
- **processor/Dockerfile** - C++ service
- **infra/docker/Dockerfile.dev** - Development

### 7.2 Docker Compose Setup
Create these compose files:
- **docker-compose.yml** - Production services
- **docker-compose.dev.yml** - Development with hot reload
- **docker-compose.test.yml** - Testing environment

## Phase 8: Development Tools & Configuration

### 8.1 IDE Setup (VS Code Recommended)
Install these extensions:
- Python
- TypeScript and JavaScript
- C++
- Docker
- GitLens
- Prettier
- ESLint

### 8.2 Create Development Scripts
```bash
cd scripts/dev

# Create development scripts
touch start-backend.sh
touch start-frontend.sh
touch build-processor.sh
touch start-all.sh
touch stop-all.sh
```

### 8.3 Environment Configuration
```bash
# Create environment templates
cp .env.example .env.dev
cp .env.example .env.prod

# Configure environment variables for:
# - Database connections
# - API keys
# - Service ports
# - Feature flags
```

## Phase 9: Verification & Testing

### 9.1 Verify Installations
```bash
# Check Python
python --version
pip --version

# Check Node.js
node --version
npm --version

# Check C++ tools
g++ --version
cmake --version

# Check Docker
docker --version
docker-compose --version
```

### 9.2 Test Basic Setup
```bash
# Test backend starts
cd backend
source venv/bin/activate
python -c "import fastapi; print('FastAPI OK')"

# Test frontend builds
cd frontend
npm run build

# Test C++ compiles
cd processor
mkdir build && cd build
cmake ..
```

## Phase 10: Development Workflow Setup

### 10.1 Git Hooks
```bash
# Create pre-commit hooks
mkdir -p .githooks
touch .githooks/pre-commit

# Make executable
chmod +x .githooks/pre-commit
```

### 10.2 CI/CD Foundation
```bash
mkdir -p .github/workflows
touch .github/workflows/ci.yml
touch .github/workflows/cd.yml
```

## Quick Start Commands Summary

After setup, your development workflow:
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Or start individually
./scripts/dev/start-backend.sh
./scripts/dev/start-frontend.sh

# Build C++ processor
./scripts/dev/build-processor.sh
```
