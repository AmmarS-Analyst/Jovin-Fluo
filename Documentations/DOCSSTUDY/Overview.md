# 🚀 1. Whole Overview of Jovin-Fluo (Step-by-Step)

## 🎯 **GOAL:** A web-based, no-code data analysis and visualization platform where users login, upload CSV/Excel files, get automated analysis and visualization suggestions, create custom calculations, and build/edit dashboards to export their results.

---

## 👣 **Step-by-Step User Flow:**

### **1. User Authentication** 🔐
User lands on the homepage, signs up, or logs in.

### **2. Project Dashboard** 📊
After login, the user sees a dashboard of their saved projects. They can create a new project.

### **3. Data Upload** 📤
In a new project, the user uploads a CSV or Excel file.

### **4. Data Profiling & Suggestions** 💡
- The system automatically profiles the data (column names, data types, sample values)
- The backend analyzes the data and generates **"suggested calculations"** (e.g., "Total Sales," "Average Rating," "Year-over-Year Growth") and **"suggested visualizations"** (e.g., "Bar chart of Sales by Category," "Line chart of Revenue over Time")

### **5. Calculation Layer** ⚡
- The user sees the suggestions and can apply them with one click
- A **Formula Editor** is provided for the user to write their own custom calculations using an Excel-like syntax (e.g., `SUM(columnA)`, `IF(columnB > 100, "High", "Low")`)

### **6. Visualization Builder** 📈
- The user sees a main canvas and a sidebar with a list of their calculated columns
- They can drag a calculated column onto the canvas to automatically generate a suggested chart, or drag-and-drop specific columns into X-axis, Y-axis, and legend fields to build a chart manually
- A **real-time preview** of the chart is always visible

### **7. Dashboard & Export** 🎨
- The user can arrange multiple visualizations on a single dashboard
- They can export the final calculated dataset as a **CSV/Excel file**
- They can export the entire dashboard with all visualizations as a **PDF report**

---

# 🏗️ **Jovin-Fluo Overview (The Big Picture)**

## **What it is:** A web app where users login, upload data (CSV/Excel), and get AI-like suggestions for analysis and charts. They can use pre-built calculations or create their own formulas, then build dashboards and export reports.

---

## 👤 **User Journey:**

1. **Login/Signup** -> Dashboard (see your projects) 🔐
2. **New Project** -> Upload CSV (see automatic data preview) 📤
3. **Get Suggestions** (click to apply auto-calculations) 💡
4. **Use Formula Editor** (write custom calculations like Excel) 📝
5. **Drag & Drop** columns to build charts 👆
6. **Arrange Charts** into a dashboard 🎨
7. **Export results** (PDF report or CSV file) 📄

---

## ⚙️ **Tech Stack Simple View:**

- **Frontend:** Next.js (React) - what users see and interact with 🌐
- **Backend:** Python (FastAPI) - handles business logic and communication 🐍
- **Engine:** C++ - does heavy data processing (fast!) ⚡
- **Communication:** gRPC (connects Python and C++) 🔗
- **Database:** Postgres (stores users, projects, saved work) 🗄️
- **Container:** Docker (runs everything together neatly) 🐳