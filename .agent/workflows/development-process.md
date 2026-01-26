---
description: 프로젝트 개발 프로세스 (Feature Development Workflow)
---

이 프로젝트는 **GitHub Flow**를 따르며, Antigravity(AI)가 작업을 수행할 때 반드시 다음 단계를 순서대로 준수해야 합니다.

## 1. 계획 및 분석 (Planning)
- **Task 작성**: `task.md`를 업데이트하여 상세 목표를 세웁니다.
- **Implementation Plan 작성**: `implementation_plan.md`를 통해 설계를 공유하고 **사용자 승인**을 받습니다.

## 2. GitHub 이슈 및 브랜치 생성
- **Issue 생성**: `gh issue create`로 이슈를 먼저 만듭니다. (번호 기억)
- **Feature 브랜치 생성**: `dev` 브랜치 기준, `feature/#이슈번호-기능명` 브랜치를 생성합니다.

## 3. 구현 및 검증 (Execution & Verification)
- 코드 작업 후 `walkthrough.md`를 작성하여 증빙 자료(스크린샷 등)를 남깁니다.

## 4. 병합 요청 (Pull Request)
- **PR 생성**: `gh pr create` 명령사용 시 `--body` 내에 반드시 **`Closes #이슈번호`** 키워드를 포함합니다.
  - 예: `gh pr create --title "[Feature] 기능명" --body "## 개요\n ... \nCloses #3"`
- **PR 승인 대기**: 사용자가 PR을 머지할 때까지 추가 작업을 지양하거나, 부득이한 경우 사용자에게 미리 알립니다.

---
// turbo-all

---
// turbo-all
