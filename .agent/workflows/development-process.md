---
description: 프로젝트 개발 프로세스 (Feature Development Workflow)
---

이 프로젝트는 **GitHub Flow**를 따르며, Antigravity(AI)가 작업을 수행할 때 반드시 다음 단계를 순서대로 준수해야 합니다.

## 1. 계획 및 분석 (Planning)
- **Task 작성**: `task.md`를 생성하거나 업데이트하여 상세 작업 목록을 작성합니다. (한국어 필수)
- **Implementation Plan 작성**: `implementation_plan.md`를 작성하여 구체적인 수정 사항과 검증 계획을 제안합니다. (한국어 필수)
- **사용자 승인**: 구현 계획서를 사용자에게 검토받고 승인을 얻습니다.

## 2. GitHub 이슈 및 브랜치 생성
- **Issue 생성**: `gh issue create` 명령어를 사용하여 작업 내용을 요약한 이슈를 생성합니다.
- **Feature 브랜치 생성**: `dev` 브랜치에서 `feature/#이슈번호-기능명` 형식으로 브랜치를 생성합니다.

## 3. 구현 (Execution)
- 코드를 작성하고 필요한 경우 단위 테스트를 수행합니다.
- 진행 상황에 따라 `task.md`의 상태를 업데이트합니다.

## 4. 검증 (Verification)
- **Walkthrough 작성**: `walkthrough.md`를 작성하여 작업 결과와 테스트 내용을 증명합니다. (스크린샷/녹화 포함 권장)

## 5. 병합 요청 (Pull Request)
- **PR 생성**: `gh pr create` 명령어를 사용하여 `dev` 브랜치로의 Pull Request를 생성합니다.
- PR 템플릿에 맞춰 내용을 충실히 작성합니다.

---
// turbo-all
