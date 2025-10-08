jovin-studio/
├── 📁 backend/                          // Python FastAPI Backend
│   ├── 📁 app/
│   │   ├── 📁 api/
│   │   │   ├── 📁 v1/                   // API Version 1
│   │   │   │   ├── 📁 endpoints/        // Route handlers
│   │   │   │   └── dependencies.py      // Auth & dependency injection
│   │   │   └── __init__.py
│   │   ├── 📁 core/                     // Core application logic
│   │   │   ├── config.py                // Settings & configuration
│   │   │   ├── security.py              // Auth & JWT handling
│   │   │   ├── database.py              // DB connection & sessions
│   │   │   └── exceptions.py            // Custom exceptions
│   │   ├── 📁 models/                   // Data models
│   │   │   ├── database.py              // SQLAlchemy models
│   │   │   ├── schemas.py               // Pydantic schemas
│   │   │   └── enums.py                 // Enumerations
│   │   ├── 📁 services/                 // Business logic
│   │   │   ├── file_service.py          // File upload & processing
│   │   │   ├── profile_service.py       // Data profiling
│   │   │   ├── visualization_service.py // Chart generation
│   │   │   ├── export_service.py        // Export functionality
│   │   │   └── grpc_client.py           // C++ service communication
│   │   ├── 📁 utils/                    // Utility functions
│   │   │   ├── file_utils.py            // File operations
│   │   │   ├── data_utils.py            // Data processing helpers
│   │   │   └── validators.py            // Data validation
│   │   ├── __init__.py
│   │   └── main.py                      // FastAPI application entry
│   ├── 📁 migrations/                   // Database migrations
│   │   ├── 📁 versions/                 // Migration files
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── 📁 tests/                        // Backend tests
│   │   ├── 📁 test_api/                 // API endpoint tests
│   │   └── 📁 test_services/            // Service layer tests
│   ├── 📁 scripts/                      // Backend scripts
│   ├── requirements.txt                 // Production dependencies
│   ├── requirements-dev.txt             // Development dependencies
│   ├── Dockerfile                       // Production image
│   ├── Dockerfile.dev                   // Development image
│   ├── alembic.ini                      // Migration configuration
│   └── pyproject.toml                   // Python project config
├── 📁 frontend/                         // React TypeScript Frontend
│   ├── 📁 public/                       // Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/               // React components
│   │   │   ├── 📁 common/               // Reusable UI components
│   │   │   ├── 📁 layout/               // App layout components
│   │   │   ├── 📁 builder/              // Drag-drop builder components
│   │   │   ├── 📁 editors/              // Formula & data editors
│   │   │   └── 📁 visualizations/       // Chart & visualization components
│   │   ├── 📁 pages/                    // Page components
│   │   │   ├── Dashboard/               // Main dashboard
│   │   │   ├── FileUpload/              // File upload page
│   │   │   ├── ProfileView/             // Data profile view
│   │   │   ├── Builder/                 // Dashboard builder
│   │   │   └── Exports/                 // Export page
│   │   ├── 📁 services/                 // API & external services
│   │   │   ├── api.ts                   // Backend API client
│   │   │   ├── auth.ts                  // Authentication service
│   │   │   ├── websocket.ts             // WebSocket service
│   │   │   └── storage.ts               // Local storage utils
│   │   ├── 📁 stores/                   // State management (Zustand)
│   │   │   ├── auth-store.ts            // Auth state
│   │   │   ├── file-store.ts            // File upload state
│   │   │   ├── builder-store.ts         // Builder state
│   │   │   └── index.ts                 // Store exports
│   │   ├── 📁 types/                    // TypeScript type definitions
│   │   │   ├── api.ts                   // API types
│   │   │   ├── charts.ts                // Chart & visualization types
│   │   │   ├── data.ts                  // Data types
│   │   │   └── index.ts                 // Type exports
│   │   ├── 📁 utils/                    // Utility functions
│   │   │   ├── formatters.ts            // Data formatting
│   │   │   ├── validators.ts            // Form validation
│   │   │   └── constants.ts             // App constants
│   │   ├── 📁 hooks/                    // Custom React hooks
│   │   │   ├── use-auth.ts              // Authentication hook
│   │   │   ├── use-websocket.ts         // WebSocket hook
│   │   │   └── use-file-upload.ts       // File upload hook
│   │   ├── App.tsx                      // Root component
│   │   ├── main.tsx                     // React entry point
│   │   └── index.css                    // Global styles
│   ├── package.json                     // NPM dependencies & scripts
│   ├── vite.config.ts                   // Vite configuration
│   ├── tsconfig.json                    // TypeScript configuration
│   ├── tailwind.config.js               // Tailwind CSS config
│   ├── eslint.config.js                 // ESLint configuration
│   ├── Dockerfile                       // Production build
│   └── Dockerfile.dev                   // Development build
├── 📁 processor/                        // C++ High-Performance Engine
│   ├── 📁 src/
│   │   ├── 📁 core/                     // Core processing logic
│   │   │   ├── processor.cpp            // Main processor class
│   │   │   ├── processor.h              // Processor header
│   │   │   ├── config.cpp               // Configuration handling
│   │   │   └── config.h                 // Config header
│   │   ├── 📁 services/                 // Service implementations
│   │   │   ├── profile_service.cpp      // Data profiling service
│   │   │   ├── profile_service.h        // Profile service header
│   │   │   ├── aggregate_service.cpp    // Aggregation service
│   │   │   ├── aggregate_service.h      // Aggregate service header
│   │   │   ├── file_parser.cpp          // File parsing logic
│   │   │   └── file_parser.h            // Parser header
│   │   ├── 📁 utils/                    // Utility functions
│   │   │   ├── arrow_utils.cpp          // Apache Arrow utilities
│   │   │   ├── arrow_utils.h            // Arrow utils header
│   │   │   ├── logger.cpp               // Logging utilities
│   │   │   └── logger.h                 // Logger header
│   │   ├── 📁 grpc/                     // gRPC server implementation
│   │   │   ├── server.cpp               // gRPC server
│   │   │   ├── server.h                 // Server header
│   │   │   └── 📁 generated/            // Auto-generated proto code
│   │   └── main.cpp                     // Application entry point
│   ├── 📁 include/                      // Public headers
│   │   └── processor/                   // Library headers
│   ├── 📁 tests/                        // C++ unit tests
│   ├── 📁 third_party/                  // Third-party dependencies
│   ├── 📁 build/                        // CMake build directory
│   ├── CMakeLists.txt                   // CMake build configuration
│   ├── vcpkg.json                       // vcpkg dependencies
│   ├── build.ps1                        // Windows build script
│   ├── run.ps1                          // Run script
│   ├── Dockerfile                       // Container image
│   └── .clang-format                    // Code formatting rules
├── 📁 proto/                            // Protocol Buffer Definitions
│   ├── processor.proto                  // Main processor service definition
│   ├── shared.proto                     // Shared message types
│   ├── generate_python.ps1              // Python code generation
│   ├── generate_cpp.ps1                 // C++ code generation
│   └── README.md                        // Proto documentation
├── 📁 infra/                            // Infrastructure & Deployment
│   ├── 📁 docker/                       // Docker configuration
│   │   ├── docker-compose.yml           // Base compose file
│   │   ├── docker-compose.dev.yml       // Development compose
│   │   ├── docker-compose.prod.yml      // Production compose
│   │   ├── 📁 nginx/                    // Nginx configuration
│   │   └── 📁 postgres/                 // Database configuration
│   ├── 📁 kubernetes/                   // K8s deployment files
│   │   ├── 📁 backend/                  // Backend deployment
│   │   ├── 📁 frontend/                 // Frontend deployment
│   │   ├── 📁 processor/                // Processor deployment
│   │   ├── 📁 postgres/                 // Database deployment
│   │   ├── 📁 redis/                    // Redis deployment
│   │   └── ingress.yaml                 // Ingress configuration
│   ├── 📁 scripts/                      // Deployment scripts
│   └── 📁 monitoring/                   // Monitoring configuration
├── 📁 scripts/                          // Project Scripts
│   ├── 📁 windows/                      // Windows-specific scripts
│   │   ├── setup.ps1                    // Initial setup script
│   │   ├── verify.ps1                   // Environment verification
│   │   ├── start-all.ps1                // Start all services
│   │   ├── stop-all.ps1                 // Stop all services
│   │   └── clean.ps1                    // Cleanup script
│   ├── 📁 build/                        // Build scripts
│   │   ├── build-backend.ps1            // Backend build
│   │   ├── build-frontend.ps1           // Frontend build
│   │   ├── build-processor.ps1          // Processor build
│   │   └── build-all.ps1                // Full project build
│   ├── 📁 dev/                          // Development scripts
│   │   ├── start-backend.ps1            // Start backend
│   │   ├── start-frontend.ps1           // Start frontend
│   │   ├── start-processor.ps1          // Start processor
│   │   └── start-dependencies.ps1       // Start DB/Redis
│   └── 📁 database/                     // Database scripts
│       ├── migrate.ps1                  // Run migrations
│       ├── seed.ps1                     // Seed database
│       └── backup.ps1                   // Database backup
├── 📁 docs/                             // Documentation
│   ├── 📁 architecture/                 // System architecture docs
│   ├── 📁 setup/                        // Setup instructions
│   ├── 📁 api/                          // API documentation
│   ├── 📁 user-guide/                   // User documentation
│   └── README.md                        // Main documentation
├── 📁 uploads/                          // Local File Storage
│   ├── 📁 temp/                         // Temporary uploads
│   ├── 📁 processed/                    // Processed files
│   └── .gitkeep                         // Keep empty directory in git
├── 📁 logs/                             // Application Logs
│   ├── backend.log
│   ├── processor.log
│   └── .gitkeep
├── .env.example                         // Environment variables template
├── .env.dev                             // Development environment
├── .env.prod                            // Production environment
├── .gitignore                           // Git ignore rules
├── .dockerignore                        // Docker ignore rules
├── README.md                            // Project overview
├── LICENSE                              // Project license
├── CONTRIBUTING.md                      // Contribution guidelines
├── CHANGELOG.md                         // Release notes
└── ROADMAP.md                           // Development roadmap