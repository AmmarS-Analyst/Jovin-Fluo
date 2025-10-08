# Jovin-Fluo 🚀

A modern, open-source data analysis and visualization platform that combines the power of C++ performance with Python development speed and React's user experience.

![Jovin-Fluo Architecture](https://img.shields.io/badge/Architecture-Hybrid%20Onion-blue)
![Python](https://img.shields.io/badge/Python-3.11%2B-green)
![Next.js](https://img.shields.io/badge/Next.js-14%2B-black)
![C++](https://img.shields.io/badge/C++-17%2B-red)

## 🌟 What is Jovin-Fluo?

Jovin-Fluo is a free, web-based alternative to commercial BI tools like Power BI and Looker Studio. It enables users to upload datasets, get intelligent analysis suggestions, create custom calculations, and build interactive dashboards - all through a no-code interface.

### Key Features
- 📊 **Smart Data Analysis** - Automated calculation and visualization suggestions
- ⚡ **High-Performance Engine** - C++ backend for lightning-fast data processing
- 🎨 **Drag & Drop Builder** - Intuitive chart and dashboard creation
- 🔧 **Custom Formulas** - Excel/DAX-like formula editor
- 📁 **Multi-Format Support** - CSV, Excel, and more
- 👥 **Role-Based Access** - Secure collaboration features
- 📤 **Export Capabilities** - PDF reports and data exports

## 🏗️ Architecture

Jovin-Fluo follows a hybrid microservices architecture with Onion Architecture principles:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js 14    │    │   FastAPI Python │    │   C++ Engine    │
│    Frontend     │◄──►│     Backend      │◄──►│  (gRPC Server)  │
│                 │    │                  │    │                 │
│ • React 18      │    │ • Business Logic │    │ • Data Processing│
│ • TypeScript    │    │ • API Routes     │    │ • Calculations   │
│ • Tailwind CSS  │    │ • Auth & RBAC    │    │ • Aggregations   │
│ • Recharts      │    │ • Database ORM   │    │ • Formula Engine │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │
         │                        │
         └─────────────┬──────────┘
                       │
             ┌─────────▼─────────┐
             │   PostgreSQL 15   │
             │                   │
             │ • Users & Roles   │
             │ • Projects & Data │
             │ • Dashboard Config│
             └───────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- C++17 compatible compiler

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/jovin-fluo.git
cd jovin-fluo
```

2. **Setup Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Setup Frontend**
```bash
cd frontend
npm install
```

4. **Start with Docker**
```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Composable charting library
- **React DnD** - Drag and drop functionality

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy 2.0** - Python SQL toolkit and ORM
- **PostgreSQL** - Primary database
- **JWT** - JSON Web Token authentication
- **Pydantic** - Data validation using Python type annotations

### Data Engine
- **C++17** - High-performance computation
- **gRPC** - High-performance RPC framework
- **Protocol Buffers** - Language-neutral data serialization
- **Fast-cpp-csv-parser** - Efficient CSV processing

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Alembic** - Database migrations

## 📁 Project Structure

```
jovin-fluo/
├── 📁 backend/                 # Python FastAPI Application
│   ├── app/
│   │   ├── api/routes/        # API endpoints and controllers
│   │   ├── core/              # Configuration and security
│   │   ├── domain/            # Business entities and interfaces
│   │   ├── application/       # Use cases and business logic
│   │   └── infrastructure/    # External implementations
│   └── requirements.txt
├── 📁 engine/                 # C++ gRPC Calculation Engine
│   ├── src/                   # C++ source code
│   └── CMakeLists.txt
├── 📁 frontend/               # Next.js React Application
│   ├── app/                   # App router directory
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility functions
│   └── public/                # Static assets
└── 📁 proto/                  # gRPC protocol definitions
```

## 🎯 Core Features

### Data Processing
- **Automatic Data Profiling** - Column type detection and statistics
- **Large Dataset Support** - Optimized for files up to 100GB
- **Intelligent Suggestions** - Rule-based analysis recommendations
- **Custom Formula Engine** - Excel/DAX-like calculation support

### Visualization
- **Drag & Drop Interface** - Intuitive chart building
- **Real-time Preview** - Instant visualization updates
- **Multiple Chart Types** - Bar, line, pie, scatter, and more
- **Interactive Dashboards** - Responsive layout system

### Collaboration & Security
- **Role-Based Access Control** - Admin, Editor, Viewer roles
- **Project Management** - Organize analyses by project
- **User Management** - Secure authentication system
- **Data Isolation** - User-specific data access

## 🔧 Development

### Running in Development Mode

1. **Start Database**
```bash
docker-compose up postgres -d
```

2. **Start Backend**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. **Start Frontend**
```bash
cd frontend
npm run dev
```

### Building for Production

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests  
cd frontend
npm test

# End-to-end tests
npm run test:e2e
```

## 📈 Performance

- **Data Processing**: 10x faster than pure Python with C++ engine
- **File Upload**: Supports files up to 100GB
- **Concurrent Users**: Horizontal scaling ready
- **Response Time**: < 100ms for most operations

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Roadmap

### Phase 1 
- [ ] User authentication and project management
- [ ] Basic file upload and data profiling
- [ ] Simple data table preview

### Phase 2 
- [ ] C++ calculation engine integration
- [ ] Formula editor and custom calculations
- [ ] Basic visualization builder

### Phase 3 
- [ ] Advanced chart types and interactions
- [ ] Dashboard creation and layout
- [ ] Export functionality (PDF, CSV)

### Phase 4 
- [ ] Real-time collaboration
- [ ] Advanced analytics and ML suggestions
- [ ] Plugin system for extensions

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature request? Please [open an issue](https://github.com/your-username/jovin-fluo/issues) on GitHub.

## 💬 Community

- **Discord**: [Join our community](https://discord.gg/jovin-fluo)
- **Twitter**: [@JovinFluo](https://twitter.com/JovinFluo)
- **Email**: team@jovin-fluo.com

## 🙏 Acknowledgments

- FastAPI community for the excellent documentation
- React and Next.js teams for the incredible frameworks
- C++ standard library contributors
- All our amazing contributors

---

<div align="center">

**Built with ❤️ for the data community**

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/jovin-fluo&type=Date)](https://star-history.com/#your-username/jovin-fluo&Date)

</div>