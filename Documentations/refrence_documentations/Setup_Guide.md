# Jovin Studio - Complete File Structure & Setup Guide
## 🚀 SETUP GUIDE - STEP BY STEP

### PHASE 1: PREREQUISITES (Run as Administrator)

#### 1.1 Install Chocolatey
```powershell
# Run in PowerShell as Admin
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

#### 1.2 Install Core Tools
```powershell
# System tools
choco install git -y
choco install 7zip -y

# Development languages
choco install python311 -y
choco install nodejs-lts -y

# C++ build tools
choco install visualstudio2022buildtools -y
choco install cmake --installargs 'ADD_CMAKE_TO_PATH=System' -y
choco install vcpkg -y

# Database & cache
choco install postgresql -y
choco install redis-64 -y

# Containerization
choco install docker-desktop -y

# Protocol Buffers
choco install protoc -y
```

#### 1.3 Install VS Code & Extensions
```powershell
choco install vscode -y

# Install extensions via command line
code --install-extension ms-python.python
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.cpptools
code --install-extension ms-vscode.cmake-tools
code --install-extension ms-azuretools.vscode-docker
code --install-extension eamodio.gitlens
```

### PHASE 2: PROJECT INITIALIZATION

#### 2.1 Clone/Create Project
```powershell
# Create project directory
mkdir jovin-studio
cd jovin-studio

# Initialize Git
git init

# Create the complete folder structure using the structure above
# Use the tree structure provided to create all folders
.\scripts\windows\setup.ps1
```

#### 2.2 Create Configuration Files

**Create .gitignore**
```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# C++
build/
*.o
*.a
*.so
*.dll

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Database
*.db
*.sqlite3

# Logs
*.log
logs/

# Environment
.env
.env.local

# Uploads
uploads/
temp/

# OS
.DS_Store
Thumbs.db
```

**Create .env.example**
```env
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
SECRET_KEY=change-this-in-production
CORS_ORIGINS=http://localhost:3000

# Frontend
VITE_API_BASE_URL=http://localhost:8000/api/v1

# C++ Processor
PROCESSOR_HOST=localhost
PROCESSOR_PORT=50051

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

### PHASE 3: BACKEND SETUP

#### 3.1 Python Environment
```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

#### 3.2 Create Core Backend Files

**backend/app/main.py**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import auth, files, profiles

app = FastAPI(title="Jovin Studio API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(files.router, prefix="/api/v1/files", tags=["files"])
app.include_router(profiles.router, prefix="/api/v1/profiles", tags=["profiles"])

@app.get("/")
async def root():
    return {"message": "Jovin Studio API", "version": "0.1.0"}
```

**backend/app/core/config.py**
```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "jovin_studio"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # API
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    SECRET_KEY: str = "your-secret-key"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # File Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 104857600  # 100MB

    class Config:
        env_file = ".env"

settings = Settings()
```

### PHASE 4: FRONTEND SETUP

#### 4.1 Initialize React App
```powershell
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

#### 4.2 Create Core Frontend Files

**frontend/vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

**frontend/src/main.tsx**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
```

### PHASE 5: C++ PROCESSOR SETUP

#### 5.1 Install C++ Dependencies
```powershell
cd processor

# Install vcpkg dependencies
vcpkg install grpc protobuf arrow gtest

# Build project
.\build.ps1
```

#### 5.2 Create CMakeLists.txt
```cmake
cmake_minimum_required(VERSION 3.20)
project(JovinProcessor)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find packages
find_package(gRPC CONFIG REQUIRED)
find_package(Protobuf REQUIRED)
find_package(Arrow REQUIRED)

# Add executable
add_executable(processor
    src/main.cpp
    src/core/processor.cpp
    src/services/profile_service.cpp
    src/grpc/server.cpp
)

# Link libraries
target_link_libraries(processor
    gRPC::grpc++
    gRPC::grpc
    Protobuf::libprotobuf
    Arrow::arrow
)

# Include directories
target_include_directories(processor PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)
```

### PHASE 6: DOCKER SETUP

#### 6.1 Create Docker Compose
**infra/docker/docker-compose.dev.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: jovin_studio
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build:
      context: ../../backend
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    environment:
      - POSTGRES_HOST=postgres
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ../../frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### PHASE 7: DEVELOPMENT WORKFLOW

#### 7.1 Start Development Environment
```powershell
# Option 1: Use Docker Compose
docker-compose -f infra/docker/docker-compose.dev.yml up

# Option 2: Use individual scripts
.\scripts\dev\start-dependencies.ps1
.\scripts\dev\start-backend.ps1
.\scripts\dev\start-frontend.ps1
```

#### 7.2 Verify Setup
```powershell
.\scripts\windows\verify.ps1

# Expected output:
# ✓ Backend API running on http://localhost:8000
# ✓ Frontend running on http://localhost:3000  
# ✓ PostgreSQL connected
# ✓ Redis connected
# ✓ All services healthy
```

### PHASE 8: TESTING

#### 8.1 Run Tests
```powershell
# Backend tests
cd backend
.\venv\Scripts\activate
pytest

# Frontend tests
cd frontend
npm test

# C++ tests
cd processor
.\build.ps1 --test
```

## 🎯 QUICK START COMMANDS

```powershell
# 1. Clone and setup
git clone <repository>
cd jovin-studio
.\scripts\windows\setup.ps1

# 2. Start development
.\scripts\dev\start-all.ps1

# 3. Access applications
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs

# 4. Stop everything
.\scripts\windows\stop-all.ps1
```

## 📊 VERIFICATION CHECKLIST

- [ ] Backend API responds on port 8000
- [ ] Frontend loads on port 3000
- [ ] PostgreSQL database connected
- [ ] Redis cache working
- [ ] File uploads working
- [ ] Data profiling functional
- [ ] Basic visualizations rendering
- [ ] All tests passing
