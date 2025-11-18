# 🤝 Contributing to Jovin Fluo

Thank you for your interest in contributing to Jovin Fluo! This document provides guidelines and instructions for contributing.

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, experience level, gender, gender identity, race, ethnicity, age, religion, or personal beliefs.

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Celebrate diverse perspectives

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or inflammatory comments
- Personal attacks
- Any conduct that could reasonably be considered inappropriate

## How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, versions)
   - Screenshots if applicable

### Suggesting Features

1. **Check existing issues** and discussions
2. **Open a feature request** with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach
   - Examples or mockups if helpful

### Contributing Code

1. **Fork the repository**
2. **Create a feature branch** from `develop`
3. **Make your changes**
4. **Write/update tests**
5. **Update documentation**
6. **Submit a pull request**

## Development Setup

See [Getting Started](GETTING_STARTED.md) for detailed setup instructions.

Quick setup:
```bash
git clone https://github.com/your-username/jovin-fluo.git
cd jovin-fluo
docker-compose up -d
```

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for features
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Commit messages follow conventions

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by maintainers
3. **Address feedback** and update PR
4. **Approval** from at least one maintainer
5. **Merge** to `develop` branch

## Coding Standards

### Python (Backend)

- Follow **PEP 8**
- Use **Black** for formatting
- Maximum line length: **100 characters**
- Use **type hints**
- Write **docstrings**

### TypeScript/React (Frontend)

- Follow **Airbnb TypeScript Style Guide**
- Use **Prettier** for formatting
- Maximum line length: **100 characters**
- Use **functional components**
- Write **JSDoc** comments

### C++ (Engine)

- Follow **Google C++ Style Guide**
- Use **clang-format**
- Maximum line length: **100 characters**
- Use **smart pointers**
- Write **Doxygen** comments

## Commit Message Guidelines

Follow **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

### Examples

```
feat(auth): add OAuth2 support

Implement OAuth2 authentication with Google and GitHub providers.

Closes #123
```

```
fix(api): resolve file upload timeout

Increase timeout for large file uploads and add progress tracking.

Fixes #456
```

## Testing Guidelines

### Backend Tests

```python
# tests/test_users.py
import pytest
from app.domain.entities import User

def test_create_user():
    user = User(email="test@example.com")
    assert user.email == "test@example.com"
```

### Frontend Tests

```typescript
// components/__tests__/UserList.test.tsx
import { render, screen } from '@testing-library/react';
import { UserList } from '../UserList';

test('renders user list', () => {
  render(<UserList />);
  // Assertions
});
```

### C++ Tests

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

## Documentation

### Code Documentation

- Write **docstrings** for all functions
- Document **complex algorithms**
- Add **examples** where helpful

### User Documentation

- Write **clear guides**
- Include **screenshots**
- Provide **examples**

## Project Structure

```
jovin-fluo/
├── backend/          # Python FastAPI
├── frontend/         # Next.js React
├── engine/           # C++ processing engine
├── proto/            # Protocol buffers
├── docs/             # Documentation
└── tests/            # Integration tests
```

## Areas for Contribution

### High Priority

- **File Upload & Processing**: CSV/Excel parsing
- **Data Profiling**: Column analysis, statistics
- **Formula Engine**: Parser, execution, functions
- **Visualization**: Chart components, builder
- **Database Connectors**: PostgreSQL, MySQL, etc.

### Medium Priority

- **ETL Pipelines**: Visual designer, transformations
- **Performance**: Optimization, caching
- **Testing**: Unit tests, integration tests
- **Documentation**: Guides, API docs

### Low Priority

- **UI/UX**: Design improvements, accessibility
- **Internationalization**: Multi-language support
- **Mobile**: Responsive design, PWA

## Getting Help

- **Documentation**: Check the [docs](.) directory
- **Issues**: Search existing issues
- **Discussions**: GitHub Discussions
- **Discord**: Join our community
- **Email**: team@jovin-fluo.com

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation
- Invited to maintainer team (for significant contributions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Jovin Fluo! 🎉

