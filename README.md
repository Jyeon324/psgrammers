# Algo Arena (Code Manager)

Algo Arena is a web-based algorithm problem-solving platform. It provides a coding environment where users can solve problems, run their code against a compiler, and track their solutions.

## 🛠 Tech Stack

### Frontend (`/client`)
- **React 18** + **Vite**
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Monaco Editor** (Code Editor)
- **TanStack Query** (Data Fetching)

### Backend (`/server`)
- **Java 17**
- **Spring Boot 3.4.1**
- **Spring Data JPA** (PostgreSQL)
- **Gradle** (Kotlin DSL)

---

## 🚀 Getting Started

### Prerequisites
- **Java 17** or higher
- **Node.js 18** or higher
- **PostgreSQL** (running on port 5432)

### 1. Database Setup
Ensure PostgreSQL is running and a database named `postgres` exists (or update `server/src/main/resources/application.properties`).

### 2. Backend Setup
The backend runs on port `8080`.

```bash
cd server
# Grant execution permission to gradlew if needed
chmod +x gradlew
# Run the application
./gradlew bootRun
```

### 3. Frontend Setup
The frontend runs on port `5001` (proxies `/api` to `8080`).

```bash
cd client
# Install dependencies
npm install
# Start development server
npm run dev
```

Visit **http://localhost:5001** in your browser.

---

## 🧪 Key Features

- **Authentication**: Simple session-based login (currently uses a Test User).
- **Problem List**: View available algorithm problems (synced from DB).
- **IDE**: Write code in C++, Python, or JavaScript with syntax highlighting.
- **Compiler**: Securely compiles and runs code using the local system's compilers (`g++`, `python3`, `node`).
- **Submission History**: Track your solved problems and past code submissions.

## 📂 Project Structure

```
├── client/          # React Frontend Application
│   ├── src/         # Source code
│   └── vite.config.ts
│
├── server/          # Spring Boot Backend
│   ├── src/main/java # Java Source code
│   └── build.gradle.kts
│
└── shared/          # Shared Types & Schema (Frontend reference)
```
