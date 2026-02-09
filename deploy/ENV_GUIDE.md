# 환경 변수 가이드 (Environment Variables Guide)

## 1. 로컬 개발 환경 (Local Development)
- **별도의 `.env` 파일이 필요 없습니다.**
- `application.properties`에 설정된 기본값(`postgres`)을 자동으로 사용합니다.
- 예시: `spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:postgres}`
    - 이 설정은 환경변수가 없으면 `postgres`를 사용한다는 뜻입니다.

## 2. 배포 서버 (Production Server - Oracle Cloud)
- **서버에서 코드를 직접 수정하지 마세요.**
- 대신, `deploy` 폴더 안에 `.env` 파일을 새로 만들어야 합니다.
- `deploy/.env.example` 파일을 복사해서 사용하면 됩니다.

### 서버 설정 방법:
```bash
cd ~/psgrammers/deploy
cp .env.example .env
vim .env
# POSTGRES_PASSWORD 값을 강력한 비밀번호로 변경하세요!
# (변경 후 ESC -> :wq 로 저장)
```
