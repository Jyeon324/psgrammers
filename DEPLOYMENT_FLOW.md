# 배포 플로우 가이드

## 브랜치 전략

```
main (Production) ──→ 배포
  ↑
dev (Development) ───→ 통합 테스트
  ↑
feature/* ───────────→ 기능 개발
hotfix/* ────────────→ 긴급 수정
```

---

## 배포 유형별 워크플로우

### 1. 정식 릴리즈 (Major/Minor 버전 업)

**신규 기능, 대규모 변경, 정식 버전 릴리즈**

```
1. feature/xxx → dev (PR + 리뷰)
2. dev 테스트 완료
3. dev → main (PR + 리뷰)
4. main에서 태그 생성 (v1.x.x)
5. GitHub 릴리즈 작성
6. 운영 서버 배포
```

**예시:**
```bash
# 1. 기능 개발 완료 후 PR 생성
gh pr create --base dev --head feature/xxx

# 2. dev 머지 후 테스트
npm run test  # 또는 수동 테스트

# 3. dev → main PR 생성
gh pr create --base main --head dev --title "release: v1.2.0"

# 4. main 머지 후 태그
gh release create v1.2.0 --title "v1.2.0 - 기능명"

# 5. 배포
ssh oci "cd ~/projects/psgrammers/src/deploy && docker compose up -d --build"
```

---

### 2. 패치 릴리즈 (Patch 버전 업)

**버그 수정, 소규모 개선**

```
1. fix/xxx 브랜치 생성 (dev 기반)
2. fix/xxx → dev (PR)
3. dev 간단 테스트
4. fix/xxx → main (PR)  또는  dev → main (PR)
5. 태그 생성 (v1.2.1)
6. 배포
```

**예시:**
```bash
# hotfix 브랜치
gh pr create --base main --head fix/bug-name

# 머지 후 패치 버전 태그
gh release create v1.2.1 --title "v1.2.1 - 버그 수정"
```

---

### 3. 핫픽스 (긴급 배포)

**운영 환장 치명적 버그, 즉시 수정 필요**

```
1. hotfix/xxx 브랜치 생성 (main 기반)
2. 수정 완료
3. hotfix/xxx → main (PR, 리뷰 생략 가능)
4. 즉시 배포
5. hotfix/xxx → dev (PR, dev에도 반영)
```

**예시:**
```bash
# main 기반 핫픽스
gh pr create --base main --head hotfix/critical-bug --title "hotfix: 치명적 버그 수정"

# 머지 후 즉시 배포 (태그는 선택)
docker compose up -d --build

# dev에도 반영 필수
gh pr create --base dev --head hotfix/critical-bug
```

---

## 체크리스트

### 배포 전 반드시 확인

- [ ] 모든 테스트 통과
- [ ] dev 환경에서 정상 동작 확인
- [ ] main 브랜치 최신 상태
- [ ] 버전 태그 생성 완료
- [ ] GitHub 릴리즈 작성 완료
- [ ] 변경사항 문서화 (README/CHANGELOG)

### 배포 후 반드시 확인

- [ ] 서비스 정상 기동 확인
- [ ] 로그 확인 (에러 없음)
- [ ] 핵심 기능 동작 테스트
- [ ] 이전 버전과 호환성 확인

---

## 명령어 정리

### 로컬 개발
```bash
# 브랜치 생성
git checkout -b feature/xxx dev

# 작업 후 커밋
git add .
git commit -m "feat: 기능 설명"

# 푸시
git push -u origin feature/xxx
```

### PR 생성
```bash
# dev로 PR
gh pr create --base dev --head feature/xxx

# main으로 PR  
gh pr create --base main --head dev
```

### 머지
```bash
# PR 머지 (스쿼시)
gh pr merge <번호> --squash --delete-branch
```

### 릴리즈
```bash
# 태그 생성
git tag -a v1.2.0 -m "v1.2.0 - 릴리즈 설명"
git push origin v1.2.0

# GitHub 릴리즈
git release create v1.2.0 --title "v1.2.0" --notes "변경사항"
```

### 배포
```bash
# 서버 접속 후
ssh oci
cd ~/projects/psgrammers/src/deploy

# 최신 코드 가져오기
git fetch origin
git checkout main
git pull origin main

# 또는 특정 버전
git checkout v1.2.0

# 배포
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

# 확인
docker compose ps
docker logs -f psgrammers-backend
```

---

## 버전 네이밍 규칙

| 버전 | 의미 | 예시 |
|------|------|------|
| **Major** (X.0.0) | 대규모 변경, 하위 호환 불가 | v2.0.0 - 전체 리팩토링 |
| **Minor** (0.X.0) | 새 기능 추가, 하위 호환 유지 | v1.2.0 - 새 기능 추가 |
| **Patch** (0.0.X) | 버그 수정, 소규모 개선 | v1.2.1 - 버그 수정 |

---

## 주의사항

1. **main 브랜치는 항상 배포 가능한 상태 유지**
   - 테스트 실패 코드 절대 머지 금지
   - dev에서 충분히 검증 후 main으로

2. **핫픽스는 즉시 dev에도 반영**
   - main과 dev 코드 싱크 맞추기
   - conflict 방지

3. **배포 전 반드시 태그 생성**
   - 롤백 시 특정 버전으로 쉽게 이동
   - 변경 이력 추적 용이

4. **릴리즈 노트 작성**
   - 어떤 변경이 있었는지 기록
   - 문제 발생 시 원인 파악 용이

---

## 참고: 현재 프로젝트 설정

- **GitHub**: https://github.com/Jyeon324/psgrammers
- **운영 서버**: Oracle Cloud (168.107.30.40)
- **SSH**: `ssh oci` (config에 설정됨)
- **배포 경로**: `~/projects/psgrammers/src/deploy`
- **현재 버전**: v1.2.0

---

## 예외 상황 처리

### 배포 실패 시
```bash
# 1. 즉시 롤백
git checkout v1.1.0  # 이전 버전
docker compose up -d --build

# 2. 문제 확인
docker logs psgrammers-backend
docker logs psgrammers-frontend

# 3. 문제 해결 후 재배포
```

### DB 마이그레이션 필요 시
```bash
# 백업 먼저
docker exec psgrammers-db-prod pg_dump -U postgres psgrammers > backup.sql

# 마이그레이션 후 배포
```

---

**작성일**: 2025-02-16  
**최종 업데이트**: v1.2.0 배포 기준
