# Triton Platform (NextJS + NestJS + Prisma + PostgreSQL + MinIO)

## Stack

- Frontend: `Next.js` (`apps/web`)
- Backend API: `NestJS` (`apps/api`)
- Database: `PostgreSQL` + `Prisma`
- Object storage: `MinIO` (S3-compatible)
- Auth: `JWT` (admin authentication)

## Requirements

- Node.js 20+ (tested on Node 24)
- Docker Desktop

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Start infrastructure:

```bash
npm run docker:up
```

3. Configure backend env:

```bash
cp apps/api/.env.example apps/api/.env
```

4. Configure frontend env:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

5. Run migrations and seed admin user:

```bash
npm run db:migrate
npm run db:seed
```

6. Start both apps:

```bash
npm run dev
```

## URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000/api`
- MinIO console: `http://localhost:9001` (`minioadmin` / `minioadmin`)

## Admin access

- Username: value from `ADMIN_USERNAME` in `apps/api/.env` (default `admin`)
- Password: value from `ADMIN_PASSWORD` in `apps/api/.env`

## Test and quality gates

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

## API overview

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/issues`
- `GET /api/issues/:id`
- `POST /api/admin/issues` (JWT admin)
- `PUT /api/admin/issues/:id` (JWT admin)
- `DELETE /api/admin/issues/:id` (JWT admin)
- `GET /api/files?key=<s3-key>`

