# 🎯 Phase 5: Visualization Builder
**Goal:** User can build charts via drag-and-drop from their data and calculated columns.

---

## 🗃️ Part 1: Domain & Database Expansion

### **Database Schema:**

#### `visualizations` table:
- `id` (Integer, Primary Key) 🔑
- `name` (String) 📛
- `type` (String, e.g., "bar", "line", "pie") 📊
- `project_id` (Foreign Key to projects.id) 🔗
- `config` (JSONB field to store flexible chart configuration like X-axis, Y-axis, color) ⚙️

#### `dashboards` table:
- `id` (Integer, Primary Key) 🔑
- `name` (String) 📛
- `project_id` (Foreign Key to projects.id) 🔗
- `layout` (JSONB field to store the position and size of each visualization on the canvas) 🎨

### **Backend File:** `backend/app/domain/entities.py`

#### Class: `Visualization` 🖼️
**Variables:** `id`, `name`, `type`, `project_id`, `config`

#### Class: `Dashboard` 📋
**Variables:** `id`, `name`, `project_id`, `layout`

---

## ⚙️ Part 2: Application Logic for Visualizations

### **Backend File:** `backend/app/application/use_cases/GenerateVizSuggestionsUseCase.py`

#### Class: `GenerateVizSuggestionsUseCase` 💡
**Method:** `execute(data_profile: DataProfile, calculated_columns: List[CalculatedColumn]) -> List[Suggestion]`
**Steps:** Contains rules for visualization (e.g., if one numeric column and one category column, then suggest a bar chart) 📈

### **Backend File:** `backend/app/application/use_cases/CreateVisualizationUseCase.py`

#### Class: `CreateVisualizationUseCase` 🛠️
**Method:** `execute(viz_data: VisualizationCreate) -> Visualization`
**Steps:** Saves the visualization configuration to the database via an `IVisualizationRepository` 💾

---

## 🌐 Part 3: API & Frontend Integration

### **Backend File:** `backend/app/api/routes/visualize.py`

#### Function: `create_visualization(viz_data: VisualizationCreate) -> VisualizationResponse` ➕

#### Function: `get_visualization_data(viz_id: int) -> JSON` 📥
**Purpose:** This endpoint is key 🔑. It fetches the visualization config, gets the underlying dataset and calculated columns, and uses the `IFormulaParser` to compute the final data needed for the chart (e.g., aggregates). It returns this data in a format the frontend chart library expects 📦

### **Frontend File:** `frontend/app/project/[id]/viz-builder.tsx`

#### Component: `VizBuilder` 🎨

##### Sub-Component: `ColumnsPalette` 🎯
**Props:** `columns` (list from DataProfile), `calculatedColumns` (list from CalculatedColumnResponse)
**UI:** Displays all available columns. Makes them draggable using HTML5 Drag and Drop API 👆

##### Sub-Component: `ChartCanvas` 🖼️
**State Variables:** `droppedColumns` (tracks which columns are on the canvas)
**Handles onDrop event:** When a column is dropped, it creates a new Visualization via the API and fetches its data 📥

##### Sub-Component: `ChartConfigPanel` ⚙️
**State Variables:** `selectedVizType` (string), `xAxisColumn` (string), `yAxisColumn` (string)
**UI:** Dropdowns and inputs to configure the chart. Changes are sent to the backend to update the visualization's config 🔄

### **Frontend File:** `frontend/components/charts/BarChart.tsx`

#### Component: `BarChart` 📊
**Props:** `data` (from `get_visualization_data` API response)
**Implementation:** Uses the Recharts library to render a `<BarChart>` component, passing the data prop directly ⚡