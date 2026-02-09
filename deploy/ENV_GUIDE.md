# Environment Variables Guide

## 1. Local Development (No .env needed)
- We use default values in `application.properties`.
- Example: `spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:postgres}`
- This means if `SPRING_DATASOURCE_PASSWORD` (env var) is not set, it uses `postgres` (default).

## 2. Production Server (Oracle Cloud)
- **DO NOT** edit code or properties files on the server.
- Instead, create a `.env` file in the `deploy` folder.
- Use `deploy/.env.example` as a template.

### How to set up on server:
```bash
cd ~/psgrammers/deploy
cp .env.example .env
vim .env
# Edit POSTGRES_PASSWORD to a strong password
```
