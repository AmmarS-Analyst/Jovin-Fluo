# 🎯 4. Complete Development Phases (Detailed)

---

## 🔐 Phase 1: Authentication & Basic Setup (Weeks 1-4)

**Goal:** User can sign up, log in, and see a blank dashboard.

### **Backend:**
- Setup **FastAPI** with **SQLAlchemy** models for `User` (id, email, hashed_password) 👤
- Implement `/auth/register` and `/auth/login` endpoints using **JWT tokens** 🔑
- Create a simple `/projects` endpoint to create and list projects 📁

### **Frontend:**
- Create `/login` and `/register` pages with forms 📝
- Implement API calls to backend for authentication. Store the JWT token 💾
- Create a `/dashboard` page that lists user projects 📊

### **Database:** `users`, `projects` tables 🗄️

---

## 📤 Phase 2: File Upload & Data Profiling (Weeks 5-7)

**Goal:** User can upload a file and see a basic table preview.

### **Backend:**
- Create `datasets` table (id, filename, project_id, file_path) 📋
- Implement `/datasets/upload` endpoint to receive files and save them to disk 💾
- Implement `/datasets/{id}/profile` endpoint. Use Python's **pandas** to read the file and return basic info (column names, types, first 10 rows). Do this even though we'll later use C++. This is the MVP 🚀

### **Frontend:**
- In the project workspace, create a **drag-drop file upload zone** 👆
- After upload, call the profile endpoint and display the data in a simple table 📊

---

## 🔧 Phase 3: The Calculation Engine Bridge (Weeks 8-12) - ADVANCED

**Goal:** Replace the Python profiling with a call to the C++ engine.

### **Backend & C++:**
- Define your `.proto` file with a service `CalculationEngine` and an RPC method `ProfileData` 📝
- Compile the proto file to generate code for **Python** and **C++** 🔄
- Implement the `ProfileData` method in your C++ server to read the CSV and return the profile ⚡
- In your Python backend, create the gRPC client in `/infrastructure/grpc_client` and call the C++ server instead of using pandas directly 🔗

---

## 💡 Phase 4: Suggestions & Formula Editor (Weeks 13-16)

**Goal:** Show suggested calculations and allow custom formulas.

### **Backend:**
- Implement `SuggestCalculationsUseCase`. This will contain simple rule-based logic (e.g., if a column is numeric, suggest SUM, AVG; if it's a date, suggest grouping by month) 🧠
- Implement `ExecuteCalculationUseCase`. This will take a user's formula string, send it to the C++ engine, which will parse and execute it on the dataset ⚡

### **Frontend:**
- Display a list of **"suggested calculations"** as clickable buttons 🔘
- Build a `formula-editor.tsx` component with a text area and a **"Run"** button ▶️
- When a suggestion is clicked or a formula is run, call the backend and update the data view with the new calculated column 🔄

---

## 📊 Phase 5: Visualization Builder (Weeks 17-20)

**Goal:** User can build charts from calculated data.

### **Frontend:**
- Create a sidebar listing all dataset columns and calculated columns 📋
- Build a main **canvas area** 🎨
- Implement **drag-and-drop**: when a user drags a column, create a chart on the canvas 👆
- Use **Recharts** to render the chart based on the selected data 📈
- Add a panel to let users change chart type (bar, line, pie), and map columns to X/Y axes ⚙️

### **Backend:** (Minor) Add an endpoint to save the visualization/dashboard layout 💾

---

## 🚀 Phase 6: Export & Polish (Weeks 21-24)

**Goal:** Implement export and final touches.

### **Backend:**
- Implement **PDF export** using a library like **WeasyPrint** or **ReportLab** to generate a report from the dashboard layout 📄
- Implement **CSV/Excel export** of the final, calculated dataset 📊

### **Frontend:**
- Add **"Export as PDF"** and **"Export Data"** buttons 📥
- Overall **UI/UX polish**, **error handling**, and **loading states** 🎨⚠️🔄