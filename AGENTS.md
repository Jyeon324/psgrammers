# AGENTS.md - Agent Coding Guidelines

This document provides guidelines for agents working on the psgrammers codebase.

## Project Overview

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS (shadcn/ui)
- **Backend**: Java 17 + Spring Boot 3.4.1 + PostgreSQL
- **Scraper**: Node.js (axios + cheerio) for Vercel serverless
- **Shared**: Drizzle ORM schema types

---

## Build & Test Commands

### Frontend (client/)

```bash
cd client

# Development server (port 5001)
npm run dev

# TypeScript type checking
npm run check

# Production build
npm run build

# Preview production build
npm run preview
```

### Backend (server/)

```bash
cd server

# Development (port 8080)
./gradlew bootRun

# Build JAR
./gradlew build

# Run tests
./gradlew test

# Run single test class
./gradlew test --tests "com.psgrammers.SomeTestClass"

# Run single test method
./gradlew test --tests "com.psgrammers.SomeTestClass.someMethod"

# Clean build
./gradlew clean build
```

### Database

```bash
# Start PostgreSQL container (port 5433)
docker compose up -d
```

---

## Code Style Guidelines

### General

- **No comments** unless explicitly required
- Use meaningful variable/function names
- Keep functions small and focused
- Follow existing patterns in each module

### Frontend (React/TypeScript)

**Imports**
- Use path aliases: `@/` for client/src, `@shared/` for shared/
- Order: React hooks → external libs → internal components → utils
- Example:
  ```typescript
  import { useState } from "react";
  import { useParams } from "wouter";
  import { Button } from "@/components/ui/button";
  import { cn } from "@/lib/utils";
  ```

**Types**
- Use TypeScript strict mode
- Define types in `shared/schema.ts` for shared types
- Use Zod for runtime validation (see `shared/routes.ts`)

**Components**
- Use functional components with hooks
- Name components with PascalCase
- Use shadcn/ui components from `@/components/ui/`
- Tailwind CSS for styling (see `tailwind.config.ts`)

**State Management**
- Use TanStack Query for server state
- Use local useState for UI state

**Naming**
- Components: PascalCase (e.g., `TierBadge.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useProblem.ts`)
- Utils: camelCase (e.g., `utils.ts`)
- Files: kebab-case (e.g., `not-found.tsx`)

### Backend (Java/Spring Boot)

**Structure**
- Follow layered architecture: controller → service → repository → entity
- Use Lombok to reduce boilerplate

**Naming**
- Classes: PascalCase (e.g., `ProblemController.java`)
- Methods: camelCase
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE

**Annotations**
- Use `@RequiredArgsConstructor` for dependency injection
- Use `@RestController` for REST endpoints
- Use `@Service` for business logic
- Use `@Entity` for JPA entities

**Error Handling**
- Return appropriate HTTP status codes
- Use ResponseEntity for responses
- Log errors with `@Slf4j`

**Example Controller Pattern**
```java
@RestController
@RequestMapping("/api/something")
@RequiredArgsConstructor
public class SomethingController {
    private final SomethingService somethingService;

    @GetMapping("/{id}")
    public ResponseEntity<Something> getSomething(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(somethingService.findById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
```

### Shared Code

- Located in `/shared` directory
- Uses Drizzle ORM for schema definitions
- Zod for API validation schemas
- Imported by frontend via `@shared/*` path alias

---

## API Routes

See `shared/routes.ts` for typed API definitions.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/problems` | List all problems |
| GET | `/api/problems/:bojId` | Get problem by BOJ ID |
| POST | `/api/problems/sync` | Sync problem from BOJ |
| DELETE | `/api/problems/:id` | Delete problem |
| POST | `/api/compiler/run` | Compile and run code |

---

## Testing

Currently there are no frontend tests configured. For backend:

- Use JUnit 5 (included with Spring Boot starter-test)
- Place tests in `src/test/java/com/psgrammers/`
- Follow naming: `ClassNameTest.java`

---

## Git Workflow

- **main**: Production-ready code
- **dev**: Development base branch
- **feature/<name>**: New features
- **fix/<name>**: Bug fixes

Always create PRs against `dev` branch.

---

## Dependencies

### Frontend Key Dependencies
- React 18, Vite 7, TypeScript 5.6
- Tailwind CSS 3.4, shadcn/ui components
- Monaco Editor for code editing
- TanStack Query for data fetching
- wouter for routing
- Zod for validation
- KaTeX for math rendering

### Backend Key Dependencies
- Spring Boot 3.4.1
- Spring Data JPA, Spring Web, Validation
- PostgreSQL driver
- Jsoup for HTML parsing
- Lombok

---

## Environment

- Frontend runs on port 5001
- Backend runs on port 8080
- PostgreSQL on port 5433
- Frontend proxies `/api` to backend
