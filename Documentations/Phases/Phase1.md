# Phase 1: Authentication & Basic Setup

**Goal:** A user can register, log in, and see a blank project dashboard.

---

## 🧱 Part 1: Database & Core Backend Setup

### Database Schema (Postgres via Docker)

We will create **two tables**:

#### 🧍 users table:
- `id` (Integer, Primary Key, Auto-increment)  
- `email` (String, Unique, Not Null)  
- `hashed_password` (String, Not Null)  
- `full_name` (String)  
- `created_at` (DateTime)  

#### 📁 projects table:
- `id` (Integer, Primary Key, Auto-increment)  
- `name` (String, Not Null)  
- `description` (Text)  
- `owner_id` (Integer, Foreign Key to users.id)  
- `created_at` (DateTime)  

---

### Backend File: `backend/app/infrastructure/database/models.py`

#### Class: `UserTable`
**Purpose:** Defines the structure of the `users` table in the database (ORM model for SQLAlchemy).  
**Variables (Columns):** `id`, `email`, `hashed_password`, `full_name`, `created_at`.

#### Class: `ProjectTable`
**Purpose:** Defines the `projects` table.  
**Variables (Columns):** `id`, `name`, `description`, `owner_id`, `created_at`.  
**Relationship:** Has a relationship with `UserTable` to easily fetch the project’s owner.

---

### Backend File: `backend/app/domain/entities.py`

#### Class: `User`
**Purpose:** A pure business object in the Domain layer (no database awareness).  
**Variables:** `id`, `email`, `hashed_password`, `full_name`, `created_at`.

#### Class: `Project`
**Purpose:** Core business entity for a Project.  
**Variables:** `id`, `name`, `description`, `owner_id`, `created_at`.

---

### Backend File: `backend/app/core/models.py`

#### Class: `UserCreate`
**Purpose:** A Pydantic model used to validate and structure incoming user registration data.  
**Variables:** `email`, `password`, `full_name`.

#### Class: `UserResponse`
**Purpose:** Structures outgoing API data (never includes password).  
**Variables:** `id`, `email`, `full_name`, `created_at`.

#### Class: `Token`
**Purpose:** Defines the response structure for a login request.  
**Variables:** `access_token` (string), `token_type` (string, e.g., `"bearer"`).

---

## ⚙️ Part 2: Application & Infrastructure Logic

### Backend File: `backend/app/domain/interfaces/IUserRepository.py`

#### Class: `IUserRepository` (Abstract Base Class)
**Purpose:** A domain "contract" — defines what can be done with users, not how.  
**Methods (Functions):**
- `get_user_by_email(email: str) -> User | None`: Fetch a user by their email.  
- `create_user(user: User) -> User`: Save and return a new user.

---

### Backend File: `backend/app/infrastructure/repositories/UserRepository.py`

#### Class: `UserRepository`
**Purpose:** Concrete implementation of `IUserRepository`. Handles actual DB communication with SQLAlchemy.  
**Methods (Functions):**
- `get_user_by_email(email: str) -> User | None`: Queries the `UserTable` and returns a Domain `User`.  
- `create_user(user: User) -> User`: Converts, saves, and returns a Domain `User` object.

---

### Backend File: `backend/app/application/use_cases/CreateUserUseCase.py`

#### Class: `CreateUserUseCase`
**Purpose:** Contains business logic for creating a user.  
**Method:** `execute(user_data: UserCreate) -> UserResponse`

**Steps:**
1. Take `UserCreate` data.  
2. Call `user_repository.get_user_by_email` — if exists, raise an error.  
3. Hash the password (`app/core/security.py`).  
4. Create a new Domain `User` with the hashed password.  
5. Save the user with `user_repository.create_user`.  
6. Convert and return as `UserResponse`.

---

## 🌐 Part 3: API Layer & Frontend

### Backend File: `backend/app/api/routes/auth.py`

#### Function: `register(user_data: UserCreate, user_repo: IUserRepository) -> UserResponse`
**Purpose:** FastAPI endpoint for `POST /auth/register`.  
**Steps:**  
Creates `CreateUserUseCase`, calls `execute(user_data)`, and returns the result.

#### Function: `login(form_data: OAuth2PasswordRequestForm, user_repo: IUserRepository) -> Token`
**Purpose:** FastAPI endpoint for `POST /auth/login`.  
**Steps:**
1. Fetch user by email.  
2. Verify password using `core/security.py`.  
3. If valid, create JWT (`core/security.py`) and return `Token`.

---

### Frontend File: `frontend/app/login/page.tsx`

#### Component: `LoginPage`
**State Variables:** `email`, `password`, `isLoading`, `error`.

**Function:** `handleSubmit`  
**Steps:**
1. Set `isLoading = true`.  
2. `fetch` → POST to `http://localhost:8000/auth/login`.  
3. On success → save JWT to `localStorage` and redirect to `/dashboard`.  
4. On failure → display error.

---

### Frontend File: `frontend/app/dashboard/page.tsx`

#### Component: `DashboardPage`
**State Variables:** `projects` (array of project objects).  

**Function:** `loadProjects`  
**Steps:**
1. Retrieve JWT token from `localStorage`.  
2. `fetch` → GET `http://localhost:8000/projects/` with Authorization header.  
3. Set `projects` state with response data.

**UI:**  
Displays project list from state and a **"New Project"** button.
