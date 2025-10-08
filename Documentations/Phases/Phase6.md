Phase 6: Export, RBAC & Polish
Goal: Implement export features, Role-Based Access Control, and final touches.

Part 1: Export Functionality
Backend File: backend/app/application/use_cases/ExportDatasetUseCase.py

Class: ExportDatasetUseCase

Method: execute(dataset_id: int, format: str) -> FilePath

Steps: Uses the IFormulaParser to get all base and calculated data, then uses a library like pandas to write a CSV or openpyxl to write an Excel file to a temporary path.

Backend File: backend/app/application/use_cases/ExportPdfReportUseCase.py

Class: ExportPdfReportUseCase

Method: execute(dashboard_id: int) -> FilePath

Steps: Uses a library like WeasyPrint or ReportLab. It takes the dashboard layout, fetches each visualization's image (or data), and generates a styled PDF report.

Backend File: backend/app/api/routes/export.py

Functions: export_dataset and export_pdf. These endpoints call the use cases and then return the file using FastAPI's FileResponse.

Part 2: Role-Based Access Control (RBAC)
Database Schema:

roles table: id, name ("admin", "editor", "viewer").

user_project_roles table: id, user_id, project_id, role_id.

Backend File: backend/app/core/security.py

Function: get_current_user (Dependency): Now also fetches the user's role for the requested project.

Function: check_permission: A dependency that you add to API routes. For example, the export_pdf endpoint would require the "viewer" role, while create_calculated_column would require the "editor" role.

Part 3: Frontend Polish & Deployment
Frontend:

Add "Export as PDF" and "Export Data" buttons to the Dashboard component. They call the new export endpoints.

Implement comprehensive error handling and loading spinners everywhere.

Apply a consistent color theme and styling using Tailwind CSS.

Deployment:

Create a docker-compose.yml file in the root directory. This file defines services for:

frontend (builds the Next.js app)

backend (runs the FastAPI server with Uvicorn)

engine (builds and runs the C++ gRPC server)

postgres (the database)

This allows you to start the entire application with one command: docker-compose up.