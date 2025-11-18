# 🏗️ Jovin Fluo - Technical Architecture

## Architecture Overview

Jovin Fluo follows a **hybrid microservices architecture** with **Onion Architecture** principles, designed for scalability, maintainability, and performance.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  Web Browser • Mobile Apps • Embedded Components • API Clients │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / WebSocket
┌────────────────────────────▼────────────────────────────────────┐
│                      Frontend Layer                             │
│  Next.js 14 (React 18 + TypeScript)                            │
│  • Dashboard Builder • Formula Editor • Data Explorer           │
│  • Pipeline Designer • Connection Manager                       │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API / GraphQL / WebSocket
┌────────────────────────────▼────────────────────────────────────┐
│                    API Gateway Layer                            │
│  FastAPI (Python 3.11+)                                         │
│  • Authentication & Authorization                              │
│  • Rate Limiting & Throttling                                   │
│  • Request Routing & Load Balancing                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│  Business      │  │  Pipeline      │  │  Data Source   │
│  Logic Layer   │  │  Orchestration │  │  Management    │
│                │  │                │  │                │
│  • Use Cases   │  │  • Celery/     │  │  • Connectors  │
│  • Services    │  │    Prefect     │  │  • Query       │
│  • Domain      │  │  • Scheduling  │  │    Builder     │
│    Logic       │  │  • Monitoring  │  │  • Refresh     │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │ gRPC
┌────────────────────────────▼────────────────────────────────────┐
│              High-Performance Engine Layer                       │
│  C++ 17+ (gRPC Server)                                          │
│  • Data Processing • Aggregations • Formula Execution            │
│  • Query Optimization • Memory Management                      │
│  • Apache Arrow (Zero-Copy Data Transfer)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                        Data Layer                                │
│  PostgreSQL 15 • Redis • Object Storage (S3/MinIO)              │
│  • Metadata • Caching • File Storage • Pipeline State           │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture Principles

### 1. Onion Architecture (Backend)

The backend follows Onion Architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         API Layer (Controllers)         │  ← HTTP endpoints
├─────────────────────────────────────────┤
│      Application Layer (Use Cases)      │  ← Business logic
├─────────────────────────────────────────┤
│        Domain Layer (Entities)          │  ← Core business rules
├─────────────────────────────────────────┤
│   Infrastructure Layer (Repositories)   │  ← External services
└─────────────────────────────────────────┘
```

**Benefits**:
- Testability: Easy to mock dependencies
- Maintainability: Clear boundaries
- Flexibility: Easy to swap implementations
- Independence: Business logic doesn't depend on frameworks

### 2. Microservices Communication

- **Synchronous**: REST API for user-facing operations
- **Asynchronous**: Message queues (Redis/Celery) for long-running tasks
- **High-Performance**: gRPC for Python ↔ C++ communication
- **Real-time**: WebSockets for live updates

### 3. Data Flow Patterns

#### File Upload Flow
```
User → Frontend → API Gateway → File Service → Object Storage
                                              ↓
                                    Profiling Job (Queue)
                                              ↓
                                    C++ Engine (gRPC)
                                              ↓
                                    Results → Database
                                              ↓
                                    WebSocket → Frontend
```

#### Pipeline Execution Flow
```
User → Pipeline Designer → Save Pipeline → Database
                                          ↓
                                    Schedule Trigger
                                          ↓
                                    Celery Worker
                                          ↓
                                    Execute Transformations
                                          ↓
                                    C++ Engine (if needed)
                                          ↓
                                    Store Results
                                          ↓
                                    Notify User
```

## Component Architecture

### Frontend Architecture

#### Structure
```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Dashboard routes
│   └── api/               # API routes (server-side)
├── components/
│   ├── ui/                # Base UI components
│   ├── builder/           # Dashboard builder
│   ├── editor/            # Formula editor
│   └── charts/            # Chart components
├── lib/
│   ├── api/               # API client
│   ├── hooks/             # Custom hooks
│   └── utils/             # Utilities
└── stores/                # State management (Zustand)
```

#### State Management
- **Zustand**: Global application state
- **React Query**: Server state and caching
- **React Context**: Theme, auth context
- **Local State**: Component-specific state (useState)

#### Data Fetching
- **React Query**: Automatic caching, refetching, optimistic updates
- **WebSocket**: Real-time updates (pipeline status, collaboration)
- **Server Actions**: Next.js server actions for mutations

### Backend Architecture

#### Structure (Onion Architecture)
```
backend/
├── app/
│   ├── api/               # API Layer (Controllers)
│   │   └── v1/
│   │       └── endpoints/
│   ├── application/       # Application Layer (Use Cases)
│   │   └── use_cases/
│   ├── domain/            # Domain Layer (Business Logic)
│   │   ├── entities/
│   │   └── interfaces/
│   └── infrastructure/    # Infrastructure Layer
│       ├── database/
│       ├── repositories/
│       ├── grpc_client/
│       └── external/
```

#### Key Components

**API Layer** (`app/api/`)
- FastAPI route handlers
- Request/response validation (Pydantic)
- Authentication/authorization
- Error handling

**Application Layer** (`app/application/`)
- Use case implementations
- Business logic orchestration
- Transaction management
- Domain event handling

**Domain Layer** (`app/domain/`)
- Business entities (pure Python classes)
- Domain interfaces (abstract base classes)
- Business rules and validations
- Value objects

**Infrastructure Layer** (`app/infrastructure/`)
- Database implementations (SQLAlchemy)
- External service clients (gRPC, HTTP)
- File storage (S3/MinIO)
- Caching (Redis)

### C++ Engine Architecture

#### Structure
```
engine/
├── src/
│   ├── core/              # Core processing logic
│   │   ├── processor.cpp
│   │   └── memory_manager.cpp
│   ├── services/          # Service implementations
│   │   ├── profile_service.cpp
│   │   ├── aggregate_service.cpp
│   │   └── formula_service.cpp
│   ├── parsers/           # File parsers
│   │   ├── csv_parser.cpp
│   │   └── json_parser.cpp
│   ├── grpc/              # gRPC server
│   │   └── server.cpp
│   └── utils/             # Utilities
│       ├── arrow_utils.cpp
│       └── logger.cpp
└── include/               # Headers
```

#### Design Principles
- **RAII**: Resource management
- **Smart Pointers**: Automatic memory management
- **Zero-Copy**: Apache Arrow for data transfer
- **Multi-threading**: Parallel processing
- **SIMD**: Vectorized operations where possible

## Data Architecture

### Database Schema Design

#### Core Tables
- `users`: User accounts and authentication
- `projects`: User projects/workspaces
- `datasets`: Uploaded data files metadata
- `calculated_columns`: User-defined calculations
- `visualizations`: Chart/dashboard configurations
- `pipelines`: ETL/ELT pipeline definitions
- `data_sources`: Database connection configurations
- `pipeline_runs`: Pipeline execution history

#### Design Principles
- **Normalization**: 3NF where appropriate
- **JSONB**: Flexible schema for configurations
- **Indexing**: Strategic indexes for performance
- **Partitioning**: For large tables (future)
- **Soft Deletes**: `deleted_at` timestamps

### Caching Strategy

#### Redis Usage
- **Session Storage**: User sessions
- **Query Results**: Cached query results (TTL-based)
- **Pipeline State**: Pipeline execution state
- **Rate Limiting**: API rate limit counters
- **Real-time Data**: WebSocket connection state

#### Cache Invalidation
- **Time-based**: TTL expiration
- **Event-based**: Invalidate on data changes
- **Manual**: Admin-triggered cache clear

### Object Storage

#### File Organization
```
uploads/
├── {user_id}/
│   ├── {project_id}/
│   │   ├── raw/           # Original uploads
│   │   ├── processed/     # Processed files
│   │   └── exports/       # Generated exports
```

#### Storage Backends
- **Development**: Local filesystem
- **Production**: S3-compatible storage (S3, MinIO, etc.)
- **Future**: Multi-cloud support

## Security Architecture

### Authentication & Authorization

#### Authentication Flow
1. User logs in → JWT token issued
2. Token stored in HTTP-only cookie (or localStorage)
3. Token validated on each request
4. Refresh token for long sessions

#### Authorization
- **Role-Based Access Control (RBAC)**: Admin, Editor, Viewer
- **Resource-Level Permissions**: Per-project, per-dataset
- **Row-Level Security**: Data filtering based on user

### Data Security

#### Encryption
- **At Rest**: Database encryption, file encryption
- **In Transit**: TLS/SSL for all communications
- **Secrets**: Encrypted credential storage

#### Network Security
- **CORS**: Configured for allowed origins
- **Rate Limiting**: Per-user and per-IP
- **Input Validation**: All inputs sanitized
- **SQL Injection**: Parameterized queries only

## Scalability Architecture

### Horizontal Scaling

#### Stateless Services
- **Frontend**: CDN + multiple instances
- **Backend API**: Load-balanced instances
- **C++ Engine**: Multiple worker processes

#### Stateful Services
- **Database**: Read replicas, connection pooling
- **Redis**: Redis Cluster for high availability
- **Object Storage**: Distributed storage (S3)

### Vertical Scaling

#### Resource Optimization
- **C++ Engine**: Memory-efficient algorithms
- **Database**: Query optimization, indexing
- **Caching**: Aggressive caching strategy

### Performance Optimization

#### Frontend
- **Code Splitting**: Route-based and component-based
- **Lazy Loading**: Images, components
- **Caching**: Service workers, browser caching
- **Bundle Optimization**: Tree shaking, minification

#### Backend
- **Async Operations**: FastAPI async/await
- **Connection Pooling**: Database and Redis
- **Query Optimization**: Efficient SQL queries
- **Background Jobs**: Celery for long tasks

#### C++ Engine
- **Memory Management**: Smart pointers, RAII
- **Parallel Processing**: Multi-threading
- **Vectorization**: SIMD instructions
- **Zero-Copy**: Apache Arrow

## Deployment Architecture

### Development Environment
```
Docker Compose:
├── frontend (dev server)
├── backend (dev server)
├── engine (C++ server)
├── postgres
└── redis
```

### Production Environment
```
Kubernetes:
├── Frontend (Deployment + Service)
├── Backend (Deployment + Service + HPA)
├── Engine (Deployment + Service)
├── PostgreSQL (StatefulSet)
├── Redis (StatefulSet)
└── Ingress (Nginx)
```

### CI/CD Pipeline
```
GitHub Actions:
├── Lint & Test
├── Build Docker Images
├── Security Scan
├── Deploy to Staging
└── Deploy to Production (manual)
```

## Monitoring & Observability

### Logging
- **Structured Logging**: JSON format
- **Log Levels**: DEBUG, INFO, WARNING, ERROR
- **Centralized**: ELK stack or similar

### Metrics
- **Application Metrics**: Prometheus
- **Business Metrics**: Custom dashboards
- **Infrastructure Metrics**: System resources

### Tracing
- **Distributed Tracing**: OpenTelemetry
- **Request Tracing**: Track requests across services
- **Performance Profiling**: Identify bottlenecks

### Alerting
- **Error Alerts**: PagerDuty, Slack
- **Performance Alerts**: Response time, error rate
- **Business Alerts**: Pipeline failures, data quality issues

## Future Architecture Considerations

### Event-Driven Architecture
- **Event Sourcing**: For audit trails
- **CQRS**: Separate read/write models
- **Event Bus**: Kafka or similar

### Multi-Region Deployment
- **CDN**: Global content delivery
- **Database Replication**: Multi-region databases
- **Data Residency**: Region-specific data storage

### Plugin Architecture
- **Plugin System**: Custom connectors and transformations
- **Marketplace**: Community plugins
- **Sandboxing**: Secure plugin execution

---

This architecture is designed to evolve with the product, starting simple and scaling as needed.

