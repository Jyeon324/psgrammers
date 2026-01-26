# AlgoArena - Code Manager

백준 온라인 저지(BOJ)와 연동되는 프리미엄 C++ 코딩 연습 플랫폼입니다.

## 🚀 Git 브랜치 전략: GitHub Flow
이 프로젝트는 **GitHub Flow**를 따릅니다.

1. **`main`**: 상용(Production) 브랜치. 항상 배포 가능한 상태여야 합니다.
2. **`dev`**: 개발(Development) 브랜치. 모든 개발의 기준점이 됩니다.
3. **`feature/` or `fix/`**: 새로운 기능 개발이나 버그 수정을 위한 브랜치. 작업이 끝나면 `dev`로 PR을 보냅니다.

**워크플로우:**
1. GitHub Issue 생성
2. `dev`에서 작업 브랜치 생성 (`feature/#번호`)
3. 작업 완료 후 `dev` 브랜치로 Pull Request 생성
4. 리뷰 및 병합 후 작업 브랜치 삭제

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
