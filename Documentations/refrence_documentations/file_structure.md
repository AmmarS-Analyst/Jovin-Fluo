jovin-studio/
├── 📁 backend/
│   ├── 📁 app/
│   │   ├── 📁 api/
│   │   │   ├── 📁 v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── auth.py
│   │   │   │   │   ├── files.py
│   │   │   │   │   ├── profiles.py
│   │   │   │   │   ├── visualizations.py
│   │   │   │   │   └── exports.py
│   │   │   │   └── dependencies.py
│   │   │   └── __init__.py
│   │   ├── 📁 core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── database.py
│   │   │   └── exceptions.py
│   │   ├── 📁 models/
│   │   │   ├── __init__.py
│   │   │   ├── database.py
│   │   │   ├── schemas.py
│   │   │   └── enums.py
│   │   ├── 📁 services/
│   │   │   ├── __init__.py
│   │   │   ├── file_service.py
│   │   │   ├── profile_service.py
│   │   │   ├── visualization_service.py
│   │   │   ├── export_service.py
│   │   │   └── grpc_client.py
│   │   ├── 📁 utils/
│   │   │   ├── __init__.py
│   │   │   ├── file_utils.py
│   │   │   ├── data_utils.py
│   │   │   └── validators.py
│   │   ├── __init__.py
│   │   └── main.py
│   ├── 📁 migrations/
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── 📁 tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_api/
│   │   └── test_services/
│   ├── 📁 scripts/
│   │   ├── start-dev.ps1
│   │   ├── start-prod.ps1
│   │   └── migrate.ps1
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── alembic.ini
│   └── pyproject.toml
├── 📁 frontend/
│   ├── 📁 public/
│   │   ├── vite.svg
│   │   └── favicon.ico
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 common/
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Modal/
│   │   │   │   └── Loading/
│   │   │   ├── 📁 layout/
│   │   │   │   ├── Header/
│   │   │   │   ├── Sidebar/
│   │   │   │   └── Footer/
│   │   │   ├── 📁 builder/
│   │   │   │   ├── DragDropZone/
│   │   │   │   ├── ChartBuilder/
│   │   │   │   ├── GridLayout/
│   │   │   │   └── Toolbox/
│   │   │   ├── 📁 editors/
│   │   │   │   ├── FormulaEditor/
│   │   │   │   ├── ChartEditor/
│   │   │   │   └── DataEditor/
│   │   │   └── 📁 visualizations/
│   │   │       ├── ChartRenderer/
│   │   │       ├── TableView/
│   │   │       └── Preview/
│   │   ├── 📁 pages/
│   │   │   ├── Dashboard/
│   │   │   ├── FileUpload/
│   │   │   ├── ProfileView/
│   │   │   ├── Builder/
│   │   │   └── Exports/
│   │   ├── 📁 services/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── websocket.ts
│   │   │   └── storage.ts
│   │   ├── 📁 stores/
│   │   │   ├── auth-store.ts
│   │   │   ├── file-store.ts
│   │   │   ├── builder-store.ts
│   │   │   └── index.ts
│   │   ├── 📁 types/
│   │   │   ├── api.ts
│   │   │   ├── charts.ts
│   │   │   ├── data.ts
│   │   │   └── index.ts
│   │   ├── 📁 utils/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   ├── 📁 hooks/
│   │   │   ├── use-auth.ts
│   │   │   ├── use-websocket.ts
│   │   │   └── use-file-upload.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── vite-env.d.ts
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── eslint.config.js
│   ├── Dockerfile
│   └── Dockerfile.dev
├── 📁 processor/
│   ├── 📁 src/
│   │   ├── 📁 core/
│   │   │   ├── processor.cpp
│   │   │   ├── processor.h
│   │   │   ├── config.cpp
│   │   │   └── config.h
│   │   ├── 📁 services/
│   │   │   ├── profile_service.cpp
│   │   │   ├── profile_service.h
│   │   │   ├── aggregate_service.cpp
│   │   │   ├── aggregate_service.h
│   │   │   ├── file_parser.cpp
│   │   │   └── file_parser.h
│   │   ├── 📁 utils/
│   │   │   ├── arrow_utils.cpp
│   │   │   ├── arrow_utils.h
│   │   │   ├── logger.cpp
│   │   │   └── logger.h
│   │   ├── 📁 grpc/
│   │   │   ├── server.cpp
│   │   │   ├── server.h
│   │   │   └── generated/  # Auto-generated from proto
│   │   └── main.cpp
│   ├── 📁 include/
│   │   └── processor/
│   ├── 📁 tests/
│   │   ├── test_profile.cpp
│   │   ├── test_aggregate.cpp
│   │   └── test_parser.cpp
│   ├── 📁 third_party/
│   ├── 📁 build/  # CMake build directory
│   ├── CMakeLists.txt
│   ├── vcpkg.json
│   ├── build.ps1
│   ├── run.ps1
│   ├── Dockerfile
│   └── .clang-format
├── 📁 proto/
│   ├── processor.proto
│   ├── shared.proto
│   ├── generate_python.ps1
│   ├── generate_cpp.ps1
│   └── README.md
├── 📁 infra/
│   ├── 📁 docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.dev.yml
│   │   ├── docker-compose.prod.yml
│   │   ├── 📁 nginx/
│   │   │   ├── nginx.conf
│   │   │   └── dev.conf
│   │   └── 📁 postgres/
│   │       ├── init.sql
│   │       └── backup.ps1
│   ├── 📁 kubernetes/
│   │   ├── 📁 backend/
│   │   ├── 📁 frontend/
│   │   ├── 📁 processor/
│   │   ├── 📁 postgres/
│   │   ├── 📁 redis/
│   │   └── ingress.yaml
│   ├── 📁 scripts/
│   │   ├── deploy-dev.ps1
│   │   ├── deploy-prod.ps1
│   │   ├── backup.ps1
│   │   └── monitoring.ps1
│   └── 📁 monitoring/
│       ├── prometheus.yml
│       ├── grafana-dashboard.yml
│       └── alerts.yml
├── 📁 scripts/
│   ├── 📁 windows/
│   │   ├── setup.ps1
│   │   ├── verify.ps1
│   │   ├── start-all.ps1
│   │   ├── stop-all.ps1
│   │   └── clean.ps1
│   ├── 📁 build/
│   │   ├── build-backend.ps1
│   │   ├── build-frontend.ps1
│   │   ├── build-processor.ps1
│   │   └── build-all.ps1
│   ├── 📁 dev/
│   │   ├── start-backend.ps1
│   │   ├── start-frontend.ps1
│   │   ├── start-processor.ps1
│   │   └── start-dependencies.ps1
│   └── 📁 database/
│       ├── migrate.ps1
│       ├── seed.ps1
│       └── backup.ps1
├── 📁 docs/
│   ├── 📁 architecture/
│   │   ├── system-design.md
│   │   ├── data-flow.md
│   │   └── api-design.md
│   ├── 📁 setup/
│   │   ├── windows-setup.md
│   │   ├── development.md
│   │   └── deployment.md
│   ├── 📁 api/
│   │   ├── backend-api.md
│   │   ├── grpc-api.md
│   │   └── frontend-api.md
│   ├── 📁 user-guide/
│   │   ├── getting-started.md
│   │   ├── features.md
│   │   └── troubleshooting.md
│   └── README.md
├── 📁 uploads/  # Local file storage
│   ├── 📁 temp/
│   ├── 📁 processed/
│   └── .gitkeep
├── 📁 logs/  # Application logs
│   ├── backend.log
│   ├── processor.log
│   └── .gitkeep
├── .env.example
├── .env.dev
├── .env.prod
├── .gitignore
├── .dockerignore
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CHANGELOG.md
└── ROADMAP.md