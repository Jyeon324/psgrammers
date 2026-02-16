# CI/CD 가이드

## CI/CD란?

**CI (Continuous Integration)** — 코드 변경을 통합할 때마다 자동으로 빌드·테스트하는 것.
PR을 올리면 "이 코드 머지해도 괜찮은가?" 를 기계가 검증해준다.

**CD (Continuous Deployment)** — 검증된 코드를 운영 서버에 자동으로 배포하는 것.
main에 머지하면 알아서 서버에 반영된다.

```
수동 배포:  코드 수정 → push → SSH 접속 → git pull → docker rebuild → 확인
CI/CD:     코드 수정 → push → (자동) 빌드 체크 → 머지 → (자동) 배포 → (자동) 헬스체크
```

---

## 이 프로젝트의 CI/CD 구조

```
feature/xxx
    │
    ▼ PR 생성
   dev  ◄─── CI 실행 (빌드 체크)
    │         ✅ 통과해야 머지 가능
    ▼ PR 생성
  main  ◄─── CI 실행 (빌드 체크)
    │         ✅ 머지되면
    ▼
  CD 실행 ──► SSH로 OCI 접속 ──► git pull + docker compose rebuild
                                     │
                                     ▼
                                Health check (컨테이너 정상 확인)
```

---

## GitHub Actions 기초

GitHub Actions는 `.github/workflows/` 디렉토리에 YAML 파일을 넣으면 동작한다.
GitHub이 무료로 제공하는 가상 서버(Runner)에서 실행된다.

### 핵심 개념

| 개념 | 설명 | 비유 |
|------|------|------|
| **Workflow** | `.yml` 파일 하나 = 자동화 시나리오 하나 | 레시피 |
| **Trigger (`on`)** | 언제 실행할지 | "주문이 들어오면" |
| **Job** | 독립적인 작업 단위 (병렬 실행 가능) | 조리대 하나 |
| **Step** | Job 안의 순서대로 실행되는 명령 | 조리 단계 |
| **Action** | 남이 만들어둔 재사용 가능한 Step | 반조리 식품 |
| **Runner** | 실행되는 가상 서버 | 주방 |
| **Secret** | 비밀번호, SSH키 등 민감한 값 | 금고 |

### YAML 기본 문법

```yaml
name: 워크플로우 이름    # GitHub Actions 탭에 표시되는 이름

on:                      # 트리거 (언제 실행?)
  push:
    branches: [main]     # main에 push될 때
  pull_request:
    branches: [dev]      # dev로 PR 올릴 때

jobs:                    # 실행할 작업들
  job-이름:
    runs-on: ubuntu-latest   # 어떤 OS에서 실행할지
    steps:                    # 순서대로 실행할 단계들
      - uses: actions/checkout@v4   # 코드 체크아웃 (거의 항상 첫 번째)
      - name: 단계 이름
        run: echo "쉘 명령어"
```

---

## 파일별 상세 설명

### `.github/workflows/ci.yml`

PR이 올라올 때 빌드가 깨지는 코드를 막아준다.

```yaml
name: CI

on:
  pull_request:
    branches: [main, dev]    # main 또는 dev로 향하는 PR에서 실행
```

**`concurrency`** — 같은 PR에서 커밋을 연달아 push하면 이전 CI를 취소하고 최신 것만 실행.
GitHub Actions 무료 시간을 아끼는 실무 팁.

```yaml
concurrency:
  group: ci-${{ github.ref }}   # 같은 브랜치면 같은 그룹
  cancel-in-progress: true       # 이전 실행 취소
```

**`changes` job** — 변경된 파일 경로를 감지해서 필요한 빌드만 실행.
서버 코드만 바꿨는데 프론트엔드 빌드까지 돌리면 시간 낭비.

```yaml
changes:
  name: Detect changes
  runs-on: ubuntu-latest
  outputs:
    client: ${{ steps.filter.outputs.client }}    # true/false
    server: ${{ steps.filter.outputs.server }}    # true/false
  steps:
    - uses: actions/checkout@v4
    - uses: dorny/paths-filter@v3    # 변경 경로 감지 Action
      id: filter
      with:
        filters: |
          client:
            - 'client/**'    # client/ 아래 파일이 바뀌면 client=true
            - 'shared/**'    # shared/도 프론트엔드 빌드에 필요
          server:
            - 'server/**'    # server/ 아래 파일이 바뀌면 server=true
```

**`client-build` job** — Node.js 환경에서 프론트엔드 빌드.

```yaml
client-build:
  needs: changes                                     # changes job이 끝난 후 실행
  if: needs.changes.outputs.client == 'true'         # client 파일이 바뀌었을 때만
  runs-on: ubuntu-latest
  defaults:
    run:
      working-directory: client                       # 모든 run 명령의 기본 디렉토리
  steps:
    - uses: actions/checkout@v4                       # 코드 체크아웃

    - uses: actions/setup-node@v4                     # Node.js 설치
      with:
        node-version: 18
        cache: npm                                    # node_modules 캐싱 (빌드 시간 단축)
        cache-dependency-path: client/package-lock.json

    - name: Install dependencies
      run: npm ci                                     # npm install보다 빠르고 정확 (lockfile 기반)

    - name: TypeScript type check
      run: npm run check                              # tsc로 타입 에러 검출

    - name: Build
      run: npm run build                              # vite build
```

**`server-build` job** — Java 환경에서 백엔드 빌드.

```yaml
server-build:
  needs: changes
  if: needs.changes.outputs.server == 'true'
  runs-on: ubuntu-latest
  defaults:
    run:
      working-directory: server
  steps:
    - uses: actions/checkout@v4

    - uses: actions/setup-java@v4
      with:
        distribution: corretto                        # Amazon Corretto (프로덕션과 동일)
        java-version: 17
        cache: gradle                                 # .gradle 캐싱

    - name: Grant execute permission
      run: chmod +x ./gradlew                         # gradlew 실행 권한

    - name: Build
      run: ./gradlew build --no-daemon                # 컴파일 + 테스트 (있으면)
                                                      # --no-daemon: CI에서는 데몬 불필요
```

---

### `.github/workflows/deploy.yml`

main에 push(머지)되면 자동으로 OCI 서버에 배포한다.

```yaml
name: Deploy

on:
  push:
    branches: [main]    # main에 push될 때만 (= PR 머지 시)
```

**`concurrency`** — 배포는 `cancel-in-progress: false`. 배포 중간에 끊기면 서비스가 불안정해질 수 있어서.

```yaml
concurrency:
  group: deploy-production
  cancel-in-progress: false    # CI와 다르게 배포는 취소하지 않음
```

**Deploy step** — `appleboy/ssh-action`으로 OCI에 SSH 접속 후 명령 실행.
이게 기존에 수동으로 하던 것을 그대로 자동화한 것.

```yaml
- name: Deploy via SSH
  uses: appleboy/ssh-action@v1
  with:
    host: ${{ secrets.OCI_HOST }}          # GitHub Secret에서 가져옴
    username: ${{ secrets.OCI_USER }}
    key: ${{ secrets.OCI_SSH_KEY }}
    script_stop: true                       # 명령 하나라도 실패하면 즉시 중단
    script: |
      cd ${{ secrets.OCI_DEPLOY_PATH }}     # 프로젝트 디렉토리로 이동
      git fetch origin main                 # 최신 코드 가져오기
      git checkout main
      git reset --hard origin/main          # 로컬을 원격과 동일하게 맞춤
      cd deploy
      docker compose -f docker-compose.prod.yml pull
      docker compose -f docker-compose.prod.yml up -d --build   # 빌드 + 재시작
      docker image prune -f                 # 사용하지 않는 이미지 정리 (디스크 절약)
```

**Health check** — 배포 후 컨테이너가 정상 기동했는지 확인.

```yaml
- name: Health check
  uses: appleboy/ssh-action@v1
  with:
    host: ${{ secrets.OCI_HOST }}
    username: ${{ secrets.OCI_USER }}
    key: ${{ secrets.OCI_SSH_KEY }}
    script: |
      sleep 30    # 컨테이너 기동 대기
      # docker ps로 running 상태인지 확인
      # 실패 시 로그 출력 + exit 1 (워크플로우 실패 처리)
```

---

## GitHub Secrets 설정 방법

워크플로우에서 `${{ secrets.XXX }}`로 참조하는 민감 정보들.
코드에 직접 넣으면 보안 사고가 나니까 GitHub이 암호화해서 관리해준다.

### 설정 경로

GitHub 레포 → `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### 설정할 Secret 4개

| Name | Value | 어디서 가져오나 |
|------|-------|----------------|
| `OCI_HOST` | `168.107.30.40` | `.ssh/config`의 HostName |
| `OCI_USER` | `ubuntu` | `.ssh/config`의 User |
| `OCI_SSH_KEY` | SSH 프라이빗 키 내용 전체 | 아래 참고 |
| `OCI_DEPLOY_PATH` | OCI 서버의 프로젝트 경로 | 아래 참고 |

### SSH 키 등록

```bash
# 키 내용을 클립보드에 복사
cat ~/.ssh/main-prod-app-01.key | pbcopy
```

GitHub Secret `OCI_SSH_KEY`에 붙여넣기.
`-----BEGIN OPENSSH PRIVATE KEY-----` 부터 `-----END OPENSSH PRIVATE KEY-----` 까지 전부 포함해야 한다.

### 배포 경로 확인

```bash
ssh oci "ls ~/projects/psgrammers/src/deploy"
```

`docker-compose.prod.yml`, `Dockerfile.backend` 등이 보이면 경로는 `~/projects/psgrammers/src`.
안 보이면 실제 경로를 찾아서 `OCI_DEPLOY_PATH`에 넣는다.

---

## 실무에서 자주 쓰는 패턴들

### Branch Protection Rule 설정 (강력 추천)

CI가 통과해야만 머지할 수 있도록 강제하는 설정.
이게 없으면 CI가 실패해도 머지 버튼을 누를 수 있어서 의미가 없어진다.

GitHub 레포 → `Settings` → `Branches` → `Add rule`

| 설정 | 값 |
|------|-----|
| Branch name pattern | `main` (dev도 별도 추가) |
| Require status checks to pass | ✅ |
| Status checks | `Client Build`, `Server Build` 선택 |

### 수동 배포 트리거 (workflow_dispatch)

자동 배포 외에 수동으로도 트리거할 수 있게 하면 유용하다.

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:    # GitHub UI에서 "Run workflow" 버튼 생성
```

### Slack/Discord 알림

배포 성공·실패를 알려주는 것. 팀 프로젝트에서 유용.

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 트러블슈팅

### CI가 실패할 때

1. GitHub 레포 → `Actions` 탭 → 실패한 workflow 클릭 → 로그 확인
2. 로그에서 빨간색 ❌ 표시된 step 확인
3. 에러 메시지 읽고 로컬에서 같은 명령 실행해보기

```bash
# 프론트엔드 빌드 실패 시 로컬에서 확인
cd client && npm run check && npm run build

# 백엔드 빌드 실패 시 로컬에서 확인
cd server && ./gradlew build
```

### 배포가 실패할 때

| 증상 | 원인 | 해결 |
|------|------|------|
| SSH 연결 실패 | Secret 값이 잘못됨 | `OCI_HOST`, `OCI_USER`, `OCI_SSH_KEY` 재확인 |
| `Permission denied (publickey)` | SSH 키가 안 맞음 | OCI의 `~/.ssh/authorized_keys`에 public key가 있는지 확인 |
| `docker compose` 실패 | Docker가 안 돌아가고 있음 | `ssh oci "docker ps"` 로 확인 |
| Health check 실패 | 컨테이너가 crash | `ssh oci "docker logs psgrammers-backend"` 로 확인 |

### 롤백 (배포가 잘못됐을 때)

```bash
ssh oci
cd ~/projects/psgrammers/src

# 이전 커밋으로 되돌리기
git log --oneline -5       # 돌아갈 커밋 확인
git checkout <커밋해시>

# 재빌드
cd deploy
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 용어 정리

| 용어 | 뜻 |
|------|-----|
| **Runner** | GitHub이 제공하는 가상 서버. 워크플로우가 여기서 실행됨. 무료 계정 월 2,000분 |
| **Action** | `uses:` 로 가져오는 재사용 가능한 모듈. npm 패키지 같은 것 |
| **Secret** | GitHub이 암호화해서 관리하는 민감 정보. 워크플로우 로그에도 마스킹됨 |
| **Artifact** | 워크플로우 실행 중 생성된 파일 (빌드 결과물 등). 다운로드 가능 |
| **Cache** | `node_modules`, `.gradle` 같은 의존성을 캐싱해서 다음 실행 시 빠르게 |
| **concurrency** | 동시 실행 제어. 같은 그룹의 워크플로우가 동시에 돌지 않도록 |
| **paths-filter** | 변경된 파일 경로를 감지해서 필요한 Job만 실행하는 Action |
| **ssh-action** | GitHub Actions에서 원격 서버에 SSH로 명령을 실행하는 Action |

---

## 참고 자료

- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
- [GitHub Actions YAML 문법](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [appleboy/ssh-action](https://github.com/appleboy/ssh-action)
- [dorny/paths-filter](https://github.com/dorny/paths-filter)
