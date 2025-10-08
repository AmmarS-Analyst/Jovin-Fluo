# Phase 3: The C++ Calculation Engine Bridge

**Goal:** Replace the Python pandas profiling with a call to the C++ engine via gRPC.

---

## 📡 Part 1: Protocol Buffer Contract

**Files:**  
- `backend/proto/jovian.proto`  
- `engine/proto/jovian.proto`

### Messages

#### Message: `ProfileDataRequest`
**Variables:**
- `file_path` (string)

#### Message: `ColumnProfile`
**Variables:**
- `name` (string)  
- `type` (string)

#### Message: `ProfileDataResponse`
**Variables:**
- `columns` (repeated `ColumnProfile`)  
- `row_count` (int32)  
- `preview_data` (repeated `DataRow`)

---

### Service: `CalculationEngine`

**RPC Method:**  
`ProfileData(ProfileDataRequest) returns (ProfileDataResponse)`

---

## ⚙️ Part 2: C++ Engine Implementation

**File:** `engine/src/calculation_engine.cpp`

#### Class: `CalculationEngineImpl`
**Inherits from:** auto-generated gRPC service base class.

**Method:** `ProfileData`  
*(Overrides the virtual method from the base class.)*

**Steps:**
1. Takes the `ProfileDataRequest` containing `file_path`.  
2. Uses a C++ library (like **fast-cpp-csv-parser**) to open and read the CSV file.  
3. Loops through rows to:
   - Count them.  
   - Infer data types (e.g., check if strings can be converted to `int` or `double`).  
4. Populates a `ProfileDataResponse` object with the results.  
5. Sends the response back to the gRPC client.

---

## 🧩 Part 3: Python gRPC Client & Onion Integration

### Backend File: `backend/app/domain/interfaces/ICalculationEngine.py`

#### Class: `ICalculationEngine` (Abstract Base Class)
**Method:**  
`profile_data(file_path: str) -> DataProfile`

---

### Backend File: `backend/app/infrastructure/grpc_client/client.py`

#### Class: `GrpcCalculationEngine` *(implements ICalculationEngine)*
**Method:**  
`profile_data(file_path: str) -> DataProfile`

**Steps:**
1. Establish a connection to the C++ gRPC server.  
2. Create a `ProfileDataRequest` message with the `file_path`.  
3. Call the `ProfileData` RPC on the C++ server.  
4. Convert the gRPC `ProfileDataResponse` into the Domain’s `DataProfile` entity.  
5. Return the `DataProfile` object.

---

## 🔄 Refactor: `UploadAndProfileDatasetUseCase`

**Change:**  
Instead of using **pandas**, it now takes an `ICalculationEngine` as a dependency in its constructor.

**In `execute` method:**  
- Calls `calculation_engine.profile_data(saved_file_path)` to get the profile.  
- The rest of the logic (saving dataset, returning response) remains unchanged.
