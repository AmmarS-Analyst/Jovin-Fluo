# 📡 Jovin Fluo - API Documentation

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://api.jovin-fluo.com`

## Authentication

Jovin Fluo uses **JWT (JSON Web Tokens)** for authentication.

### Getting a Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Using the Token

Include the token in the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Authorization: Bearer <refresh_token>
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

### Projects

#### List Projects
```http
GET /api/v1/projects
Authorization: Bearer <token>
```

#### Get Project
```http
GET /api/v1/projects/{project_id}
Authorization: Bearer <token>
```

#### Create Project
```http
POST /api/v1/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description"
}
```

#### Update Project
```http
PUT /api/v1/projects/{project_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Delete Project
```http
DELETE /api/v1/projects/{project_id}
Authorization: Bearer <token>
```

### Datasets

#### Upload Dataset
```http
POST /api/v1/projects/{project_id}/datasets
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
```

#### List Datasets
```http
GET /api/v1/projects/{project_id}/datasets
Authorization: Bearer <token>
```

#### Get Dataset
```http
GET /api/v1/datasets/{dataset_id}
Authorization: Bearer <token>
```

#### Get Dataset Profile
```http
GET /api/v1/datasets/{dataset_id}/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "columns": [
    {
      "name": "sales",
      "type": "numeric",
      "null_percentage": 0.05,
      "distinct_count": 150,
      "statistics": {
        "mean": 1250.50,
        "median": 1200.00,
        "std_dev": 350.25,
        "min": 100.00,
        "max": 5000.00
      }
    }
  ],
  "row_count": 10000,
  "preview_data": [...]
}
```

#### Delete Dataset
```http
DELETE /api/v1/datasets/{dataset_id}
Authorization: Bearer <token>
```

### Calculations

#### Get Suggestions
```http
GET /api/v1/datasets/{dataset_id}/suggestions
Authorization: Bearer <token>
```

#### Create Calculated Column
```http
POST /api/v1/datasets/{dataset_id}/calculated-columns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Total Sales",
  "formula": "SUM([Sales])",
  "data_type": "numeric"
}
```

#### List Calculated Columns
```http
GET /api/v1/datasets/{dataset_id}/calculated-columns
Authorization: Bearer <token>
```

#### Execute Formula Preview
```http
POST /api/v1/datasets/{dataset_id}/formulas/preview
Authorization: Bearer <token>
Content-Type: application/json

{
  "formula": "SUM([Sales])",
  "limit": 100
}
```

### Visualizations

#### Create Visualization
```http
POST /api/v1/projects/{project_id}/visualizations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sales Chart",
  "type": "bar",
  "config": {
    "x_axis": "month",
    "y_axis": "sales",
    "group_by": "category"
  }
}
```

#### Get Visualization Data
```http
GET /api/v1/visualizations/{viz_id}/data
Authorization: Bearer <token>
```

#### Update Visualization
```http
PUT /api/v1/visualizations/{viz_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "config": {
    "x_axis": "month",
    "y_axis": "revenue"
  }
}
```

#### Delete Visualization
```http
DELETE /api/v1/visualizations/{viz_id}
Authorization: Bearer <token>
```

### Dashboards

#### Create Dashboard
```http
POST /api/v1/projects/{project_id}/dashboards
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sales Dashboard",
  "layout": {
    "visualizations": [
      {
        "viz_id": 1,
        "position": {"x": 0, "y": 0, "w": 6, "h": 4}
      }
    ]
  }
}
```

#### Get Dashboard
```http
GET /api/v1/dashboards/{dashboard_id}
Authorization: Bearer <token>
```

#### Update Dashboard
```http
PUT /api/v1/dashboards/{dashboard_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "layout": {...}
}
```

### Exports

#### Export Dataset
```http
GET /api/v1/datasets/{dataset_id}/export?format=csv
Authorization: Bearer <token>
```

#### Export Dashboard PDF
```http
GET /api/v1/dashboards/{dashboard_id}/export?format=pdf
Authorization: Bearer <token>
```

### Data Sources (Future)

#### List Data Sources
```http
GET /api/v1/data-sources
Authorization: Bearer <token>
```

#### Create Data Source
```http
POST /api/v1/data-sources
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Production DB",
  "type": "postgresql",
  "connection_string": "postgresql://...",
  "credentials": {...}
}
```

#### Test Connection
```http
POST /api/v1/data-sources/{source_id}/test
Authorization: Bearer <token>
```

### Pipelines (Future)

#### List Pipelines
```http
GET /api/v1/pipelines
Authorization: Bearer <token>
```

#### Create Pipeline
```http
POST /api/v1/pipelines
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "ETL Pipeline",
  "steps": [...],
  "schedule": "0 0 * * *"
}
```

#### Execute Pipeline
```http
POST /api/v1/pipelines/{pipeline_id}/execute
Authorization: Bearer <token>
```

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {...}
  }
}
```

### Common Error Codes

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Example Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

## Rate Limiting

- **Authenticated**: 1000 requests/hour
- **Unauthenticated**: 100 requests/hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination:

```http
GET /api/v1/projects?page=1&limit=20
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Filtering & Sorting

Many endpoints support filtering and sorting:

```http
GET /api/v1/datasets?filter[project_id]=1&sort=-created_at
```

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('ws://localhost:8000/ws?token=<access_token>');
```

### Events

#### Pipeline Status Update
```json
{
  "event": "pipeline.status",
  "data": {
    "pipeline_id": 1,
    "status": "running",
    "progress": 50
  }
}
```

#### Real-time Collaboration
```json
{
  "event": "dashboard.update",
  "data": {
    "dashboard_id": 1,
    "changes": {...}
  }
}
```

## Interactive API Documentation

Visit `/docs` for interactive Swagger/OpenAPI documentation:

- **Development**: http://localhost:8000/docs
- **Production**: https://api.jovin-fluo.com/docs

## SDKs & Libraries

### Python SDK (Future)
```python
from jovin_fluo import Client

client = Client(api_key="your-api-key")
projects = client.projects.list()
```

### JavaScript SDK (Future)
```javascript
import { JovinFluo } from '@jovin-fluo/sdk';

const client = new JovinFluo({ apiKey: 'your-api-key' });
const projects = await client.projects.list();
```

## Support

- **Documentation**: [docs/API.md](API.md)
- **Issues**: GitHub Issues
- **Email**: api@jovin-fluo.com

---

Last updated: 2024

