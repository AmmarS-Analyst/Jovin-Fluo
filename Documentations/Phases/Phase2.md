# Phase 2: File Upload & Data Profiling

**Goal:** User can upload a file in a project and see a preview.

---

## 🧱 Part 1: Database & Domain Expansion

### Database Schema

#### 📊 datasets table:
- `id` (Integer, Primary Key)  
- `name` (String, the original filename)  
- `file_path` (String, the path where the file is saved on the server)  
- `project_id` (Integer, Foreign Key to projects.id)  
- `uploaded_at` (DateTime)

---

### Backend File: `backend/app/domain/entities.py`

#### Class: `Dataset`
**Variables:** `id`, `name`, `file_path`, `project_id`, `uploaded_at`.

#### Class: `DataProfile`
**Purpose:** Represents the result of profiling a dataset.  
**Variables:**  
- `columns` (list of `ColumnProfile` objects)  
- `row_count` (integer)  
- `preview_data` (list of lists representing the first 10 rows)

---

### Backend File: `backend/app/core/models.py`

#### Class: `DatasetResponse`
**Variables:** `id`, `name`, `project_id`, `uploaded_at`.

#### Class: `DataProfileResponse`
**Variables:** Mirrors the `DataProfile` entity for API response.

---

## ⚙️ Part 2: Application Logic for Profiling

### Backend File: `backend/app/application/use_cases/UploadAndProfileDatasetUseCase.py`

#### Class: `UploadAndProfileDatasetUseCase`
**Method:** `execute(project_id: int, uploaded_file) -> DataProfile`

**Steps:**
1. Save the uploaded file to `./uploads/{project_id}/{filename}`.  
2. Create a new `Dataset` entity and save it to the database via `IDatasetRepository`.  
3. Use **pandas** to read the file.  
4. Get:
   - `.dtypes` → column types  
   - `.shape[0]` → row count  
   - `.head(10).values` → preview data  
5. Construct and return a `DataProfile` object.

---

## 🌐 Part 3: API & Frontend Integration

### Backend File: `backend/app/api/routes/datasets.py`

#### Function: `upload_dataset(project_id: int, file: UploadFile, use_case: UploadAndProfileDatasetUseCase) -> DataProfileResponse`
**Purpose:** API endpoint for `POST /projects/{project_id}/datasets`.  
**Steps:** Calls the use case and returns the `DataProfileResponse`.

---

### Frontend File: `frontend/app/project/[id]/upload.tsx`

#### Component: `FileUploadZone`
**State Variables:** `isDragActive` (boolean), `uploadStatus` (string).

**Function:** `handleFileDrop`  
**Steps:**
1. Prevent default browser behavior.  
2. Get the dropped file.  
3. Create a `FormData` object and append the file.  
4. Use `fetch` to `POST` the `FormData` to the backend upload endpoint (include JWT token).  
5. On success, receive `DataProfileResponse` and pass it up to the parent component.

---

### Frontend File: `frontend/app/project/[id]/data-view.tsx`

#### Component: `DataProfileView`
**Props:** `profile: DataProfileResponse`

**UI:**
- Display an HTML `<table>`.  
- `<thead>`: Create `<tr>` and `<th>` for each column name from `profile.columns`.  
- `<tbody>`: Map over `profile.preview_data` to create `<tr>` and `<td>` for each cell in the preview rows.
