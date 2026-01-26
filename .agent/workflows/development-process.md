---
description: 프로젝트 개발 프로세스 (Feature Development Workflow)
---

이 프로젝트는 **GitHub Flow**를 따르며, Antigravity(AI)가 작업을 수행할 때 반드시 다음 단계를 순서대로 준수해야 합니다.

## 1. 계획 및 분석 (Planning)
- **Task 작성**: `task.md`를 업데이트하여 상세 목표를 세웁니다.
- **Implementation Plan 작성**: `implementation_plan.md`를 통해 상세 설계를 공유하고 **사용자 승인**을 받습니다.

## 2. GitHub 이슈 및 브랜치 생성
- **Issue 생성**: `gh issue create`를 사용하여 작업 이슈를 먼저 생성합니다. (생성된 이슈 번호를 꼭 확인합니다.)
- **Feature 브랜치 생성**: `dev` 브랜치를 기준으로 `feature/#이슈번호-기능명` 형식의 브랜치를 생성합니다.

## 3. 구현 및 검증 (Execution & Verification)
- 코드를 구현하고, 지침에 따라 `walkthrough.md`를 작성하여 결과 보고(스크린샷/녹화 포함)를 수행합니다.

## 4. 병합 요청 (Pull Request)
- **PR 생성**: `gh pr create` 명령을 사용하며, `--body`에 반드시 **`Closes #이슈번호`** 키워드를 포함하여 병합 시 이슈가 자동 종료되도록 합니다.
  - 예: `gh pr create --base dev --title "[Title]" --body "## 개요\n ... \nCloses #3"`
- **PR 승인 및 머지**: 사용자가 PR을 머지할 때까지 기다리며, 머지 완료 후 로컬의 `dev` 브랜치를 최신화(`git pull origin dev`) 한 뒤 다음 작업을 시작합니다.

---
// turbo-all
