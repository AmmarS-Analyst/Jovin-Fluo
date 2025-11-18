# 👨‍💻 Jovin Fluo - Development Guide

This guide covers the development phases, coding standards, and best practices for contributing to Jovin Fluo.

## Development Phases

### Phase 1: MVP - File-Based Analytics (Current)

**Duration**: Months 1-6  
**Goal**: Create a working file upload and analytics platform

#### Sprint 1: Foundation (Weeks 1-4)
- [x] Project structure and architecture
- [x] Authentication and user management
- [ ] File upload endpoint
- [ ] Basic data profiling (Python)
- [ ] Frontend file upload UI
- [ ] Data preview table

#### Sprint 2: Data Processing (Weeks 5-8)
- [ ] C++ engine integration (gRPC)
- [ ] CSV parser implementation
- [ ] Data profiling in C++
- [ ] Column type detection
- [ ] Statistical calculations
- [ ] Performance optimization

#### Sprint 3: Formula Engine (Weeks 9-12)
- [ ] Formula parser (AST generation)
- [ ] Formula execution engine
- [ ] Function library (50+ functions)
- [ ] Monaco editor integration
- [ ] Real-time formula validation
- [ ] Calculated columns storage

#### Sprint 4: Visualization (Weeks 13-16)
- [ ] Chart component library
- [ ] Drag-and-drop builder
- [ ] Chart type selection
- [ ] Data mapping interface
- [ ] Real-time chart preview
- [ ] Chart configuration panel

#### Sprint 5: Dashboard & Export (Weeks 17-20)
- [ ] Dashboard layout system
- [ ] Multiple chart arrangement
- [ ] Dashboard templates
- [ ] PDF export functionality
- [ ] CSV/Excel export
- [ ] Python code generation

#### Sprint 6: Polish & Testing (Weeks 21-24)
- [ ] Error handling and validation
- [ ] Loading states and feedback
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Documentation completion

### Phase 2: Database Integration (Future)

**Duration**: Months 7-12

#### Key Features
- Database connector framework
- Query builder UI
- Data refresh scheduling
- Connection management
- Schema browser

### Phase 3: ETL/ELT Pipeline Builder (Future)

**Duration**: Months 13-18

#### Key Features
- Visual pipeline designer
- Transformation library
- Pipeline execution engine
- Data lineage tracking
- Pipeline templates

### Phase 4: Advanced Data Engineering (Future)

**Duration**: Months 19-24

#### Key Features
- Data warehouse integration
- Streaming data support
- Advanced transformations
- Data governance
- Multi-tenancy

### Phase 5: Complete BI Platform (Future)

**Duration**: Months 25-36

#### Key Features
- Advanced analytics
- ML integration
- Collaborative features
- Enterprise security
- Embedded analytics

## Coding Standards

### Python (Backend)

#### Style Guide
- Follow **PEP 8** style guide
- Use **Black** for code formatting
- Maximum line length: **100 characters**
- Use **type hints** for all functions

#### Code Example
```python
from typing import List, Optional
from pydantic import BaseModel

class UserResponse(BaseModel):
    """User response model."""
    id: int
    email: str
    full_name: Optional[str] = None

async def get_users(skip: int = 0, limit: int = 100) -> List[UserResponse]:
    """Retrieve list of users.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of user response models
    """
    # Implementation
    pass
```

#### Best Practices
- Use **async/await** for I/O operations
- Use **Pydantic** models for validation
- Use **SQLAlchemy** for database operations
- Write **docstrings** for all functions and classes
- Use **dependency injection** for testability

### TypeScript/React (Frontend)

#### Style Guide
- Follow **Airbnb TypeScript Style Guide**
- Use **Prettier** for formatting
- Maximum line length: **100 characters**
- Use **functional components** with hooks

#### Code Example
```typescript
import { useState, useEffect } from 'react';
import { User } from '@/types/api';

interface UserListProps {
  onUserSelect: (user: User) => void;
}

export function UserList({ onUserSelect }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch users
  }, []);

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

#### Best Practices
- Use **TypeScript** strictly (no `any` types)
- Use **React Query** for server state
- Use **Zustand** for global state
- Keep components **small and focused**
- Use **custom hooks** for reusable logic

### C++ (Engine)

#### Style Guide
- Follow **Google C++ Style Guide**
- Use **clang-format** for formatting
- Maximum line length: **100 characters**
- Use **C++17** minimum, **C++20** preferred

#### Code Example
```cpp
#include <memory>
#include <vector>
#include <string>

class DataProcessor {
public:
    explicit DataProcessor(const std::string& file_path);
    ~DataProcessor() = default;

    std::unique_ptr<std::vector<double>> process_data();

private:
    std::string file_path_;
    void validate_file();
};
```

#### Best Practices
- Use **smart pointers** (no raw `new`/`delete`)
- Follow **RAII** principles
- Use **const** wherever possible
- Write **unit tests** for all functions
- Document with **Doxygen** comments

## Git Workflow

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch
- **feature/**: Feature branches
- **bugfix/**: Bug fix branches
- **hotfix/**: Critical production fixes

### Commit Messages

Follow **Conventional Commits**:

```
feat: add user authentication
fix: resolve file upload timeout
docs: update API documentation
refactor: simplify data processing logic
test: add unit tests for formula engine
chore: update dependencies
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit
3. Push branch and create PR
4. Address review comments
5. Merge after approval

## Testing

### Backend Testing

```python
# tests/test_users.py
import pytest
from app.domain.entities import User

def test_create_user():
    user = User(email="test@example.com", password="password")
    assert user.email == "test@example.com"
```

### Frontend Testing

```typescript
// components/__tests__/UserList.test.tsx
import { render, screen } from '@testing-library/react';
import { UserList } from '../UserList';

test('renders user list', () => {
  render(<UserList />);
  // Assertions
});
```

### C++ Testing

```cpp
// tests/test_processor.cpp
#include <gtest/gtest.h>
#include "processor.h"

TEST(DataProcessor, ProcessData) {
    DataProcessor processor("test.csv");
    auto result = processor.process_data();
    ASSERT_NE(result, nullptr);
}
```

## Code Review Guidelines

### For Authors
- Keep PRs small and focused
- Write clear commit messages
- Add tests for new features
- Update documentation
- Respond to review comments

### For Reviewers
- Be constructive and respectful
- Focus on code quality, not style
- Check for security issues
- Verify tests are adequate
- Approve when ready

## Performance Guidelines

### Backend
- Use **async/await** for I/O
- Implement **caching** where appropriate
- Optimize **database queries**
- Use **connection pooling**
- Monitor **memory usage**

### Frontend
- **Code split** by route
- **Lazy load** heavy components
- **Optimize images**
- Use **React.memo** for expensive components
- **Debounce** user inputs

### C++ Engine
- Use **smart pointers**
- Avoid **unnecessary copies**
- Use **move semantics**
- **Profile** hot paths
- Consider **SIMD** optimizations

## Security Guidelines

### Authentication
- Use **JWT** tokens with expiration
- Store tokens securely (HTTP-only cookies)
- Implement **refresh tokens**
- Use **bcrypt** for password hashing

### Authorization
- Implement **RBAC**
- Check permissions on every request
- Use **row-level security** where needed
- Log all security events

### Data Security
- **Validate** all inputs
- Use **parameterized queries**
- **Encrypt** sensitive data
- Implement **rate limiting**

## Documentation

### Code Documentation
- Write **docstrings** for all functions
- Document **complex algorithms**
- Add **examples** where helpful
- Keep documentation **up to date**

### API Documentation
- Use **OpenAPI/Swagger** for REST APIs
- Document **request/response** schemas
- Include **examples**
- Document **error codes**

### User Documentation
- Write **clear guides**
- Include **screenshots**
- Provide **examples**
- Keep it **up to date**

## Development Tools

### Recommended Extensions (VS Code)

**Python**:
- Python
- Pylance
- Black Formatter
- Ruff

**TypeScript/React**:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

**C++**:
- C/C++
- CMake Tools
- clang-format

**General**:
- GitLens
- Docker
- Remote - Containers

## Getting Help

- **Documentation**: Check the [docs](.) directory
- **Code Review**: Ask in PR comments
- **Questions**: Open a discussion on GitHub
- **Bugs**: Open an issue with details

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/)

---

Happy coding! 🚀

