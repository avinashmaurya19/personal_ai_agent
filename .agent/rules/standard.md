# Development Standards & Quality Guidelines

## 1. Code Quality & Modularity
- **File Length Limit**: Strictly limit files to **500 lines of code**. If a file approaches this limit, refactor into cohesive sub-modules or utility helpers.
- **Single Responsibility Principle**: Each module, class, and function must have a single clear purpose.
- **Import Conventions**:
  - Prefer relative imports within local packages (e.g., `from .models import Conversation`).
  - Absolute imports for top-level packages (e.g., `from app.core.config import settings`).
  - Keep imports alphabetically sorted and grouped (standard library, third-party, local).

## 2. Git & Commit Conventions
Follow the **Conventional Commits** specification:
- `feat: <description>` — A new feature
- `fix: <description>` — A bug fix
- `docs: <description>` — Documentation changes (README, PLANNING, etc.)
- `refactor: <description>` — Code changes that neither fix a bug nor add a feature
- `test: <description>` — Adding or updating tests
- `chore: <description>` — Tooling, dependency, or configuration updates

### Git Workflow Rules
1. **Commit Frequently**: Make atomic commits corresponding to logical steps in the workflow:
   - After Planning phase updates to `@PLANNING.md` and `@TASK.md`.
   - After Implementation phase code changes.
   - After Test phase validation.
   - After Documentation phase completion.
2. **Never Commit Secrets**: Ensure `.env` is always git-ignored. Only commit `.env.example` containing variable names and placeholders.

## 3. Testing Standards
- **Backend Tests**: Run via `pytest`.
  - Unit tests for all business logic, parsers, and tool executors (`apps/api/tests/unit/`).
  - Integration tests for FastAPI endpoints with an async test client and test database (`apps/api/tests/integration/`).
- **Frontend Tests**: Component and unit tests with Vitest / React Testing Library.
- **Fail Early**: All tests must pass before marking a task as done.

## 4. Documentation Standards
- **Docstrings**: Public functions, classes, and FastAPI endpoints must contain clear docstrings specifying arguments, return types, and exceptions raised.
- **Self-Documenting Code**: Choose descriptive variable and function names. Avoid cryptic abbreviations.
- **API Documentation**: Maintain OpenAPI schema descriptions via FastAPI's parameter and route metadata.

## 5. Vibe Coding Workflow Execution
1. **Plan First**: Never jump straight into code for complex tasks. Outline approach, schemas, and impact in `@PLANNING.md`.
2. **Break Down Tasks**: List atomic actionable steps in `@TASK.md`.
3. **Execute & Review**: Implement systematically. Validate locally.
4. **Update Logs**: Check off completed items in `@TASK.md` immediately upon completion.
