# Phase 4: Suggestions & Formula Editor

**Goal:** Show automated calculation suggestions and allow users to create custom formulas.

---

## 🧱 Part 1: Domain & Database Expansion

### Database Schema

#### 🧮 calculated_columns table:
- `id` (Integer, Primary Key)  
- `name` (String, e.g., `"Total Sales"`)  
- `formula_expression` (String, e.g., `"SUM([Sales])"`)  
- `dataset_id` (Foreign Key to `datasets.id`)  
- `created_at` (DateTime)

---

### Backend File: `backend/app/domain/entities.py`

#### Class: `CalculatedColumn`
**Variables:** `id`, `name`, `formula_expression`, `dataset_id`, `created_at`.

#### Class: `Suggestion`
**Purpose:** Represents an automated analysis suggestion.  
**Variables:**  
- `type` (string, e.g., `"calculation"`, `"visualization"`)  
- `title` (string)  
- `description` (string)  
- `formula_template` (string, optional)

---

### Backend File: `backend/app/core/models.py`

#### Class: `CalculatedColumnCreate`
**Variables:** `name`, `formula_expression`, `dataset_id`.

#### Class: `SuggestionResponse`
**Variables:** Mirrors the `Suggestion` entity.

---

## ⚙️ Part 2: Application Logic for Suggestions & Calculations

### Backend File: `backend/app/application/use_cases/GenerateSuggestionsUseCase.py`

#### Class: `GenerateSuggestionsUseCase`
**Method:** `execute(data_profile: DataProfile) -> List[Suggestion]`

**Steps:**
1. Takes the `DataProfile` from Phase 2.  
2. Applies **rule-based logic**:
   - If a column is numeric → Suggest `"SUM"`, `"AVERAGE"`.  
   - If a column is a date → Suggest `"GROUP BY MONTH"`.  
3. Returns a list of `Suggestion` objects.

---

### Backend File: `backend/app/domain/interfaces/IFormulaParser.py`

#### Class: `IFormulaParser` (Abstract Base Class)
**Method:**  
`parse_and_execute(formula: str, dataset_path: str) -> List[Any]`

**Purpose:** Defines the contract for executing a user’s formula on a dataset.

---

### Backend File: `backend/app/infrastructure/grpc_client/client.py`

#### Class: `GrpcCalculationEngine` *(now also implements `IFormulaParser`)*

We extend the `jovian.proto` file with:

**New Messages:**
- `ExecuteFormulaRequest`: includes `formula` and `dataset_path`.  
- `ExecuteFormulaResponse`: includes `results` (list of values).

**New RPC in Service:**
- `ExecuteFormula(ExecuteFormulaRequest) returns (ExecuteFormulaResponse)`

---

**Method:** `parse_and_execute(formula: str, dataset_path: str) -> List[Any]`

**Steps:**
1. Send a gRPC request to the C++ engine with the formula and dataset path.  
2. C++ engine parses the formula (using a library like **exprtk**) and executes it.  
3. Returns the calculated column values to Python.

---

### Backend File: `backend/app/application/use_cases/CreateCalculatedColumnUseCase.py`

#### Class: `CreateCalculatedColumnUseCase`
**Method:** `execute(column_data: CalculatedColumnCreate, formula_parser: IFormulaParser) -> CalculatedColumn`

**Steps:**
1. Call `formula_parser.parse_and_execute` to validate the formula and preview results.  
2. If valid, save the `CalculatedColumn` entity via `ICalculatedColumnRepository`.  
3. Return the saved entity.

---

## 🌐 Part 3: API & Frontend Integration

### Backend File: `backend/app/api/routes/calculate.py`

#### Function: `get_suggestions(dataset_id: int) -> List[SuggestionResponse]`
**Steps:**
1. Fetch dataset profile.  
2. Use `GenerateSuggestionsUseCase`.  
3. Return the suggestions.

#### Function: `create_calculated_column(column_data: CalculatedColumnCreate) -> CalculatedColumnResponse`
**Steps:**  
Calls the `CreateCalculatedColumnUseCase`.

---

### Frontend File: `frontend/app/project/[id]/suggestions-sidebar.tsx`

#### Component: `SuggestionsSidebar`
**State Variables:** `suggestions` (array of `SuggestionResponse`).

**Function:** `fetchSuggestions`  
Calls the `get_suggestions` API endpoint.

**UI:**  
Maps over the `suggestions` array and displays each as a button.

---

### Frontend File: `frontend/app/project/[id]/formula-editor.tsx`

#### Component: `FormulaEditor`
**State Variables:**  
- `formulaString` (string)  
- `previewResults` (array of values)

**Functions:**
- `handlePreview` → Sends `formulaString` to backend preview endpoint (uses `IFormulaParser`).  
- `handleSave` → Calls `create_calculated_column` API endpoint.

**UI:**  
- A `<textarea>` for the formula.  
- A **Preview** button.  
- A `<table>` to display `previewResults`.  
- A **Save** button.
