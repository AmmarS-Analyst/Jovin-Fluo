jovin-fluo/
├── backend/                    # Python FastAPI Application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app initialization
│   │   ├── api/                # API Routes (Controllers)
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── auth.py     # Login, register endpoints
│   │   │   │   ├── projects.py # Project CRUD
│   │   │   │   ├── datasets.py # File upload & profiling
│   │   │   │   └── calculate.py # Send calc requests to C++ engine
│   │   ├── core/               # Application Core (Onion Architecture)
│   │   │   ├── config.py       # Settings (database URL, etc.)
│   │   │   ├── security.py     # Password hashing, JWT token creation
│   │   │   └── models.py       # Pydantic models for request/response
│   │   ├── domain/             # Enterprise Business Rules (Onion)
│   │   │   ├── entities.py     # Pure business objects (e.g., User, Dataset, Calculation)
│   │   │   └── interfaces/     # Abstract classes for external systems
│   │   │       └── ICalculationEngine.py # Interface for C++ engine
│   │   ├── application/        # Application Business Rules (Onion)
│   │   │   └── use_cases/
│   │   │       ├── ProfileDataUseCase.py
│   │   │       ├── SuggestCalculationsUseCase.py
│   │   │       └── ExecuteCalculationUseCase.py
│   │   └── infrastructure/     # External Agency (Onion)
│   │       ├── database/
│   │       │   ├── models.py   # SQLAlchemy table definitions
│   │       │   └── session.py  # Database connection
│   │       ├── repositories/   # Data access layer (e.g., UserRepository)
│   │       └── grpc_client/
│   │           ├── client.py   # Concrete implementation of ICalculationEngine
│   │           └── jovin_pb2.py # Auto-generated gRPC code
│   ├── requirements.txt
│   └── proto/                  # Protocol Buffer Definitions
│       └── jovian.proto        # Define your service and data messages here
├── engine/                     # C++ gRPC Calculation Engine
│   ├── src/
│   │   ├── main.cpp            # gRPC server startup
│   │   └── calculation_engine.cpp/hpp # Core data processing logic
│   ├── CMakeLists.txt
│   └── proto/                  # Shared with backend
│       └── jovian.proto
└── frontend/                   # Next.js Application
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx          # Root layout
    │   ├── page.tsx            # Homepage
    │   ├── login/
    │   │   └── page.tsx        # Login page component
    │   ├── dashboard/
    │   │   └── page.tsx        # Main project dashboard
    │   └── project/
    │       └── [id]/
    │           ├── page.tsx    # Main project workspace
    │           ├── upload.tsx  # File upload component
    │           ├── data-view.tsx # Data profiling display
    │           ├── formula-editor.tsx
    │           └── viz-builder.tsx
    ├── components/
    │   ├── ui/                 # Reusable UI bits (Button, Card, Input)
    │   └── charts/             # Wrapper components for Recharts
    ├── lib/                    # Utilities (e.g., API fetch functions)
    └── public/                 # Static images, etc.



   ## References for Structure:

*** Onion Architecture: Search "Onion Architecture in Python" for blogs by developers like "Claudio Bernasconi" for practical examples.**

*** FastAPI Structure: The official FastAPI project generation templates on GitHub (e.g., fastapi-project-template). ***

*** Next.js App Router: The official Next.js documentation on the app/ directory structure. ***

jovin-fluo/
├── 📁 backend/           # Python FastAPI
│   ├── app/
│   │   ├── api/routes/   # URL endpoints (auth.py, projects.py)
│   │   ├── core/         # Config & security settings
│   │   ├── domain/       # Business rules & interfaces
│   │   ├── application/  # Use cases (app logic)
│   │   └── infrastructure/ # DB & gRPC implementations
│   └── requirements.txt
├── 📁 engine/            # C++ gRPC Server
│   └── src/              # C++ calculation code
├── 📁 frontend/          # Next.js App
│   ├── app/
│   │   ├── login/        # Login page
│   │   ├── dashboard/    # Project list
│   │   └── project/      # Main workspace
│   ├── components/       # Reusable UI pieces
│   └── lib/              # Utility functions
└── 📁 proto/             # gRPC contract definitions

domain/ = Business rules (WHAT to do)

infrastructure/ = Technical implementations (HOW to do it)

application/ = Orchestrates the flow between WHAT and HOW

api/ = Connection point for frontend

