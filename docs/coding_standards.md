# Coding Standards and Documentation Practices

This document outlines the coding standards and documentation practices for the MCP Fintech Platform project.

## General Guidelines

- Write clean, maintainable, and testable code
- Follow the DRY (Don't Repeat Yourself) principle
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Add comments for complex logic, but prefer self-documenting code
- Write unit tests for all new code
- Review code before submitting pull requests

## Backend (Python) Standards

### Code Formatting

- Use [Black](https://github.com/psf/black) for code formatting with a line length of 88 characters
- Use [isort](https://pycqa.github.io/isort/) to sort imports
- Use [flake8](https://flake8.pycqa.org/) for linting

### Naming Conventions

- Use snake_case for variables, functions, and file names
- Use PascalCase for class names
- Use UPPER_CASE for constants
- Prefix private methods and variables with an underscore (_)

### Type Annotations

- Use type annotations for all function parameters and return values
- Use Pydantic models for data validation and serialization

### Documentation

- Use docstrings for all modules, classes, and functions
- Follow the [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html) for docstrings
- Include examples in docstrings where appropriate

### Example

```python
from typing import List, Optional

def calculate_total(
    amounts: List[float], 
    discount: Optional[float] = None
) -> float:
    """Calculate the total amount after applying an optional discount.
    
    Args:
        amounts: A list of monetary amounts.
        discount: An optional discount percentage (0-1).
        
    Returns:
        The total amount after discount.
        
    Examples:
        >>> calculate_total([10.0, 20.0, 30.0])
        60.0
        >>> calculate_total([10.0, 20.0, 30.0], 0.1)
        54.0
    """
    total = sum(amounts)
    if discount is not None:
        total = total * (1 - discount)
    return total
```

## Frontend (TypeScript/React) Standards

### Code Formatting

- Use [Prettier](https://prettier.io/) for code formatting
- Use [ESLint](https://eslint.org/) for linting
- Use the Airbnb style guide as a base configuration

### Naming Conventions

- Use camelCase for variables, functions, and properties
- Use PascalCase for components, interfaces, and types
- Use kebab-case for file names
- Use UPPER_CASE for constants

### Component Structure

- Use functional components with hooks instead of class components
- Keep components small and focused on a single responsibility
- Use TypeScript interfaces for props
- Use default exports for components

### State Management

- Use React Query for server state management
- Use Zustand for client state management
- Minimize prop drilling by using context or state management libraries

### Example

```tsx
import React, { useState } from 'react';
import { useQuery } from 'react-query';

interface UserProps {
  userId: string;
  showDetails?: boolean;
}

const UserProfile: React.FC<UserProps> = ({ userId, showDetails = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data, isLoading, error } = useQuery(['user', userId], 
    () => fetchUserData(userId)
  );
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user data</div>;
  
  return (
    <div className="user-profile">
      <h2>{data.name}</h2>
      {(showDetails || isExpanded) && (
        <div className="user-details">
          <p>Email: {data.email}</p>
          <p>Role: {data.role}</p>
        </div>
      )}
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
    </div>
  );
};

export default UserProfile;
```

## API Design

- Use RESTful principles for API design
- Use plural nouns for resource endpoints (e.g., `/users` instead of `/user`)
- Use HTTP methods appropriately (GET, POST, PUT, DELETE)
- Use HTTP status codes correctly
- Version your APIs (e.g., `/api/v1/users`)
- Document all APIs using OpenAPI/Swagger

## Git Workflow

### Branching Strategy

- `main`: Production-ready code
- `develop`: Integration branch for feature development
- `feature/*`: New features or enhancements
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent fixes for production
- `release/*`: Release preparation

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to the build process or auxiliary tools

### Pull Requests

- Create a pull request for each feature or bug fix
- Reference related issues in the pull request description
- Ensure all tests pass before merging
- Require at least one code review before merging
- Squash commits when merging

## Documentation Practices

### Code Documentation

- Document all public APIs, classes, and functions
- Use inline comments for complex logic
- Keep documentation up-to-date with code changes

### Project Documentation

- Maintain a comprehensive README.md
- Document architecture decisions in ADRs (Architecture Decision Records)
- Keep documentation in the `docs/` directory
- Use Markdown for documentation

### API Documentation

- Use OpenAPI/Swagger for API documentation
- Include examples for all API endpoints
- Document error responses and status codes

## Testing Standards

### Backend Testing

- Write unit tests for all business logic
- Write integration tests for API endpoints
- Aim for at least 80% code coverage
- Use pytest for testing
- Use factories or fixtures for test data

### Frontend Testing

- Write unit tests for utility functions and hooks
- Write component tests for UI components
- Write integration tests for user flows
- Use Jest and React Testing Library
- Use mock service worker for API mocking

## Security Practices

- Never commit secrets or credentials to the repository
- Use environment variables for configuration
- Validate and sanitize all user inputs
- Implement proper authentication and authorization
- Follow OWASP security guidelines
- Regularly update dependencies

## Accessibility

- Follow WCAG 2.1 AA standards
- Use semantic HTML
- Provide alternative text for images
- Ensure keyboard navigation works
- Test with screen readers
- Maintain sufficient color contrast

## Performance

- Optimize database queries
- Use caching where appropriate
- Minimize bundle sizes
- Lazy load components and routes
- Optimize images and assets
- Monitor and profile performance regularly
