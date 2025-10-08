#  Tech Stack Brief & Environment Plan

## 1. **Core Languages**

* **Python 3.11+**

  * For **backend APIs, orchestration, and business logic**.
  * Easy to integrate with data libraries (Pandas, DuckDB, PyArrow).
  * Framework: **FastAPI** (light, async, fast).

* **C++17 or C++20**

  * For **high-performance data parsing, profiling, aggregation**.
  * Connect with Python using **gRPC (Protocol Buffers)**.
  * Libraries: Apache Arrow C++ (columnar memory), gRPC C++.

---

## 2. **Communication Layer**

* **gRPC + Protocol Buffers**

  * Used between **Python backend ↔ C++ engine**.
  * Ensures type-safe, fast cross-language communication.
  * You’ll define `.proto` files once and generate code for both Python & C++.

---

## 3. **Frontend (UI Layer)**

* **React + TypeScript (Vite build tool)**

  * For drag-drop builder, visualizations, formula editor.
* **Charting**:

  * **Vega-Lite / Visx** for flexible grammar of graphics.
  * **Recharts** for quick, common charts.
* **Drag & Drop**: React DnD + React Grid Layout.
* **Formula Editor**: Monaco Editor (same as VSCode).

---

## 4. **Storage**

* **Postgres** → for metadata (users, RBAC, dashboards).
* **MinIO (local) / AWS S3 (cloud later)** → for uploaded files.
* **DuckDB** (embedded, local SQL engine) → lightweight queries on files.
* **Apache Arrow + Parquet** → efficient in-memory and on-disk formats.

---

## 5. **Orchestration / Job System**

* **Prefect** (modern, Pythonic) or **Celery + Redis**.

  * For scheduling heavy jobs (profiling, aggregations).
  * Prefect preferred for clean orchestration.

---

## 6. **Auth & RBAC**

* **OAuth2 + JWT** (FastAPI built-in support).
* Roles: Admin, Editor, Viewer.
* Later scale with Keycloak/Auth0 if needed.

---

## 7. **Export / Reports**

* **PDF**: WeasyPrint or ReportLab.
* **Python Code Export**: Jinja2 templates.
* **Data**: CSV/JSON exports from backend.

---

## 8. **DevOps**

* **Docker** for containerizing frontend, backend, and C++ service.
* **Docker Compose** for local dev (brings up all services).
* **CI/CD**: GitHub Actions.
* **Kubernetes (later)** for cloud deployment.

---

# 🌍 Environment Setup Plan (Step by Step)

1. **Global tools**

   * Install **Python 3.11+**
   * Install **Node.js 20+ (with npm/pnpm)**
   * Install **CMake + g++/clang** (for C++ builds)
   * Install **Docker Desktop** (so you can containerize everything)

2. **Python environment**

   ```bash
   python -m venv venv
   source venv/bin/activate   # Linux/Mac
   venv\Scripts\activate      # Windows

   pip install fastapi uvicorn[standard] grpcio grpcio-tools pandas pyarrow duckdb prefect psycopg2
   ```

3. **C++ environment**

   * Install: `cmake`, `make`, `g++` (Linux) or MSVC (Windows).
   * Install: **gRPC C++** and **Apache Arrow C++**.
   * Make a `CMakeLists.txt` that builds a simple gRPC server.

4. **Frontend**

   ```bash
   npm create vite@latest frontend -- --template react-ts
   cd frontend
   npm install recharts react-dnd react-grid-layout monaco-editor vega-lite @visx/visx
   ```

5. **Database & storage (local dev)**

   * Install **Postgres** locally (or use Docker).
   * Install **MinIO** locally (or use a folder as fake object store).
   * Use **DuckDB** in-process (no setup needed).

6. **Dev repo structure**

   ```
   jovin-studio/
   ├─ backend/       # Python FastAPI
   ├─ processor/     # C++ engine
   ├─ frontend/      # React UI
   ├─ proto/         # Protobuf files
   └─ infra/         # Docker, k8s configs
   ```

7. **Proto compilation (first test)**

   * Write `proto/processor.proto` (with ProfileFile + ComputeAggregate RPCs).
   * Generate code:

     ```bash
     python -m grpc_tools.protoc -I=proto --python_out=backend --grpc_python_out=backend proto/processor.proto
     ```
   * Build C++ stub via CMake.

8. **Dockerize services**

   * Backend → Python (FastAPI + gRPC client).
   * Processor → C++ gRPC server.
   * Frontend → React build container (served by Nginx).
   * Compose them into one network.

---

# 🚀 First Milestone to Target

✅ Bring up environment with **3 containers** (frontend + backend + processor).
✅ Upload CSV → Python backend → C++ stub returns fake profile JSON.
✅ Show fake profile in frontend.

That’s enough to have a working end-to-end skeleton in <2 weeks.

