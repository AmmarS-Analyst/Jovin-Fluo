# 🚀 Jovin Fluo

<div align="center">

**An open-source, enterprise-grade data platform that evolves from a simple analytics tool into a complete alternative to Power BI and Tableau**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14+](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![C++ 17+](https://img.shields.io/badge/C++-17+-red.svg)](https://isocpp.org/)

[Documentation](#-documentation) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 🌟 What is Jovin Fluo?

**Jovin Fluo** is a comprehensive, open-source data platform designed to democratize data analytics and engineering. Starting as a powerful file-based analytics tool, it will evolve into a complete enterprise data platform with database connectivity, ETL/ELT pipelines, advanced data engineering capabilities, and full business intelligence features.

### 🎯 Core Vision

Jovin Fluo aims to be the **one-stop solution** for organizations that need:
- **Self-service analytics** without vendor lock-in
- **Data engineering capabilities** without complex infrastructure
- **Enterprise BI features** at open-source pricing
- **Scalable architecture** that grows with your needs

### 📊 Evolution Path

#### **Phase 1: MVP - File-Based Analytics** (Current)
Transform raw data files into actionable insights:

- **Multi-format Support**: Upload CSV, Excel, JSON, Parquet, and more
- **Intelligent Data Profiling**: Automatic column type detection, statistics, and quality checks
- **Smart Suggestions**: AI-powered calculation and visualization recommendations
- **Custom Formula Engine**: Excel/DAX-like formula editor with real-time validation
- **Drag-and-Drop Builder**: Intuitive dashboard creation with 20+ chart types
- **Real-time Preview**: Instant visualization updates as you build
- **Export Capabilities**: PDF reports, CSV/Excel exports, and reproducible Python code

#### **Phase 2: Database Integration** (Next)
Connect directly to your data sources:

- **Universal Database Connectors**: PostgreSQL, MySQL, SQL Server, MongoDB, Snowflake, BigQuery, Redshift, and more
- **Query Builder**: Visual SQL builder with syntax highlighting and validation
- **Real-time Data Refresh**: Scheduled and on-demand data synchronization
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Automatic query performance analysis and suggestions
- **Data Source Catalog**: Centralized management of all data connections

#### **Phase 3: ETL/ELT Pipeline Builder**
Build data transformation pipelines visually:

- **Visual Pipeline Designer**: Drag-and-drop interface for creating data pipelines
- **Transformation Library**: 50+ pre-built transformations (filter, join, aggregate, pivot, etc.)
- **Data Quality Framework**: Built-in data validation, cleansing, and quality checks
- **Scheduling & Orchestration**: Cron-based and event-driven pipeline execution
- **Data Lineage Tracking**: Complete visibility into data flow and dependencies
- **Error Handling & Retry Logic**: Robust error management with automatic retries
- **Pipeline Templates**: Pre-built templates for common ETL patterns

#### **Phase 4: Advanced Data Engineering**
Enterprise-grade data engineering capabilities:

- **Data Warehouse Integration**: Native support for data warehouses (Snowflake, BigQuery, Redshift)
- **Data Lake Support**: Integration with S3, Azure Data Lake, Google Cloud Storage
- **Streaming Data Processing**: Real-time data ingestion and processing (Kafka, Pulsar)
- **Advanced Transformations**: Window functions, machine learning transformations, custom Python/SQL scripts
- **Data Governance**: Data catalog, metadata management, and compliance tracking
- **Performance Optimization**: Query optimization, caching strategies, and materialized views
- **Multi-tenant Architecture**: Secure, isolated workspaces for different teams/organizations

#### **Phase 5: Complete BI Platform**
Full-featured business intelligence platform:

- **Advanced Analytics**: Statistical analysis, forecasting, and predictive modeling
- **Machine Learning Integration**: Built-in ML models for anomaly detection, clustering, and predictions
- **Collaborative Workspaces**: Real-time collaboration with comments, annotations, and sharing
- **Role-Based Access Control**: Granular permissions and security policies
- **Embedded Analytics**: White-label dashboards and APIs for embedding in other applications
- **Mobile Support**: Responsive design with native mobile apps
- **Enterprise Features**: SSO, audit logs, compliance reporting, and SLA management

### 🎨 Key Features

#### **For Data Analysts**
- No-code dashboard creation
- Excel-like formula editor
- Pre-built visualization templates
- One-click data exports

#### **For Data Engineers**
- Visual ETL/ELT pipeline builder
- Database connectivity framework
- Data quality and validation tools
- Pipeline scheduling and monitoring

#### **For Business Users**
- Self-service analytics
- Drag-and-drop interface
- Automated insights and suggestions
- Mobile-friendly dashboards

#### **For Developers**
- RESTful and GraphQL APIs
- Embeddable components
- Plugin system for extensions
- Comprehensive SDK and documentation

### 🏗️ Architecture

Jovin Fluo follows a **hybrid microservices architecture** with **Onion Architecture** principles:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                            │
│  Next.js 14 + React 18 + TypeScript + Tailwind CSS          │
│  • Dashboard Builder • Formula Editor • Data Explorer       │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API / GraphQL
┌──────────────────────▼──────────────────────────────────────┐
│                   Backend API Layer                          │
│  FastAPI (Python 3.11+) + SQLAlchemy 2.0                    │
│  • Business Logic • Authentication • API Gateway             │
│  • Pipeline Orchestration • Data Source Management           │
└──────────────────────┬──────────────────────────────────────┘
                       │ gRPC
┌──────────────────────▼──────────────────────────────────────┐
│              High-Performance Engine Layer                   │
│  C++ 17+ (gRPC Server) + Apache Arrow                       │
│  • Data Processing • Aggregations • Formula Execution        │
│  • Query Optimization • Memory Management                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Data Layer                                 │
│  PostgreSQL 15 • Redis • Object Storage (S3/MinIO)          │
│  • Metadata • Caching • File Storage                        │
└─────────────────────────────────────────────────────────────┘
```

### 🛠️ Technology Stack

#### **Frontend**
- **Framework**: Next.js 14 (App Router) with React 18
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+ with shadcn/ui components
- **State Management**: Zustand + React Query (TanStack Query)
- **Visualization**: Recharts + Vega-Lite + D3.js
- **Drag & Drop**: React DnD + React Grid Layout
- **Code Editor**: Monaco Editor (VS Code editor)
- **Forms**: React Hook Form + Zod validation

#### **Backend**
- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2.0 with Alembic migrations
- **Authentication**: JWT + OAuth2 with support for SSO
- **API**: RESTful + GraphQL (Strawberry)
- **Task Queue**: Celery + Redis (or Prefect for orchestration)
- **Data Processing**: Pandas, DuckDB, PyArrow, Polars
- **Export**: WeasyPrint (PDF), ReportLab, Jinja2 templates

#### **Data Engine**
- **Language**: C++ 17/20
- **Communication**: gRPC + Protocol Buffers
- **Data Format**: Apache Arrow (zero-copy data transfer)
- **Parsing**: Fast CSV parser, simdjson
- **Memory**: Smart pointers, RAII patterns
- **Performance**: Multi-threading, vectorization, SIMD

#### **Infrastructure**
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (production)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: Structured logging with ELK stack
- **Database**: PostgreSQL 15+ (primary), Redis (caching)
- **Storage**: MinIO (local) / S3 (cloud) for object storage

### 🚀 Quick Start

#### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- Docker & Docker Compose
- C++17 compatible compiler (GCC/Clang/MSVC)

#### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/jovin-fluo.git
cd jovin-fluo

# Start all services with Docker Compose
docker-compose up -d

# Or set up manually
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
npm run dev

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### 📚 Documentation

- **[Vision & Roadmap](docs/VISION.md)** - Product vision and development roadmap
- **[Architecture](docs/ARCHITECTURE.md)** - Technical architecture and design decisions
- **[Tech Stack](docs/TECH_STACK.md)** - Detailed technology stack and rationale
- **[Getting Started](docs/GETTING_STARTED.md)** - Setup guide and development environment
- **[Development Guide](docs/DEVELOPMENT.md)** - Development phases and guidelines
- **[API Documentation](docs/API.md)** - API reference and examples
- **[Contributing](docs/CONTRIBUTING.md)** - Contribution guidelines and code of conduct

### 🎯 Current Status

**Phase 1 (MVP) - In Development**
- ✅ Project structure and architecture design
- ✅ Basic authentication and user management
- 🚧 File upload and data profiling
- 🚧 Formula editor and calculation engine
- 🚧 Dashboard builder and visualizations
- ⏳ Export functionality

### 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🙏 Acknowledgments

- FastAPI community for excellent documentation
- React and Next.js teams for incredible frameworks
- Apache Arrow project for high-performance data formats
- All our amazing contributors

---

<div align="center">

**Built with ❤️ for the data community**

[Report Bug](https://github.com/your-username/jovin-fluo/issues) • [Request Feature](https://github.com/your-username/jovin-fluo/issues) • [Discord](https://discord.gg/jovin-fluo) • [Twitter](https://twitter.com/jovinfluo)

</div>

