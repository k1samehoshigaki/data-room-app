# DataRoom — Virtual Data Room MVP

A full-stack Virtual Data Room application for securely storing, organizing, and sharing documents. Inspired by Google Drive / Dropbox.

**Live Demo:**
- Frontend: _[add Vercel URL after deploy]_
- Backend API: _[add Railway URL after deploy]_

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), Tailwind v4, Zustand, TanStack Query |
| Backend | NestJS 11, PostgreSQL, Prisma 7 |
| Storage | Supabase Storage (S3-compatible presigned URLs) |
| Auth | Email/Password (bcrypt + JWT) + Google OAuth (Passport) |
| Deploy | Frontend → Vercel · Backend + DB → Railway |

---

## Local Setup

### Prerequisites
- Node.js 22+
- Docker (for PostgreSQL)

### 1. Clone & Install

```bash
git clone <repo-url>
cd data-room-app
npm install   # installs all workspaces
```

### 2. Start PostgreSQL

```bash
docker-compose up -d
```

### 3. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env:
#   DATABASE_URL (default works with docker-compose)
#   JWT_SECRET (any random string)
#   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (from Google Cloud Console)
#   SUPABASE_* (from your Supabase project → Storage → S3 credentials)

# Frontend
cp frontend/.env.example frontend/.env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. Run Migrations

```bash
cd backend && npx prisma migrate dev --name init
```

### 5. Start Dev Servers

```bash
# Terminal 1 — Backend (port 3001)
npm run dev:backend

# Terminal 2 — Frontend (port 3000)
npm run dev:frontend
```

---

## Deployment

### Backend → Railway

1. Create a new Railway project
2. Add a **PostgreSQL** plugin
3. Add a **Service** pointing to the `backend/` directory (or link the monorepo root and set root directory to `backend/`)
4. Set environment variables (copy from `.env.example`, use Railway's Postgres `DATABASE_URL`)
5. Set the **Start Command**: `node dist/main`
6. Set the **Build Command**: `npm run build`  
7. Set the **Release Command** (pre-start): `npx prisma migrate deploy`

### Frontend → Vercel

1. Import the repo on Vercel
2. Set **Root Directory** to `frontend/`
3. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL + `/api`

---

## Design Decisions

### Materialized Path for Folder Hierarchy

Each `Folder` stores a `path` string like `/parentId1/parentId2/folderId`. This enables:
- **Efficient subtree queries** via `path LIKE '/prefix/%'` on a btree index — O(log n) with no recursion
- **Breadcrumb construction** without extra round-trips (parse the path string, look up names in one query)
- **Cascade deletes** in Postgres (ON DELETE CASCADE propagates through parentId FK)

### Polymorphic Sharing

`SharePermission` and `ShareLink` use `resourceType` (DATA_ROOM | FOLDER | FILE) + `resourceId` — one model covers all resource types. No join tables per type. Access resolution walks: `owner → direct perm → ancestor-path perm → share token`.

### File Upload Flow

```
Client → POST /api/files/presign → { uploadUrl, storageKey }
Client → PUT uploadUrl (XHR with onprogress) → Supabase S3
Client → POST /api/files { storageKey, name, sizeBytes, ... } → DB record
```

Backend never holds file data in memory. Progress tracked client-side via XHR.

### Name Collision Handling

Files: backend returns `409` by default (`conflictStrategy: 'reject'`). Client can retry with:
- `conflictStrategy: 'auto-rename'` → `file (1).pdf`, `file (2).pdf` etc.
- `conflictStrategy: 'version'` → creates a `FileVersion` record and bumps `currentVersion`

Folders: always reject duplicates within the same parent.

---

## Data Model (ERD)

```
User ──< DataRoom ──< Folder ──< Folder (self-ref, materialized path)
                  ──< File  ──< FileVersion

SharePermission: polymorphic (resourceType + resourceId + granteeUserId)
ShareLink:       polymorphic (resourceType + resourceId + token)
```

Key fields:
- `Folder.path` — materialized path string, indexed
- `Folder.depth` — nesting level (informational)
- `File.storageKey` — S3 object key
- `File.sizeBytes` — BigInt (supports >4 GB files)
- `ShareLink.token` — cuid, unique, used in public URLs

---

## How It Scales

### Computing total size and item count of a subtree

**MVP approach (used):** single aggregate query using the materialized path:

```sql
SELECT count(*), sum("sizeBytes")
FROM "File"
WHERE "dataRoomId" = $1
  AND "folderId" IN (
    SELECT id FROM "Folder"
    WHERE path LIKE '/root_folder_id/%'
  )
```

This is fast with a `path` btree index (text_pattern_ops). No recursion.

**At scale:** add denormalized `itemCount` and `totalSizeBytes` columns on `Folder`, updated transactionally on every insert/delete. Rollup queries then become O(1) point reads. Background job re-syncs counters periodically.

### What changes at 100,000 files

| Concern | Solution |
|---------|----------|
| Listing large folders | Cursor pagination (`WHERE (createdAt, id) > ($cursor_ts, $cursor_id)` instead of `OFFSET`) |
| Index coverage | Composite index `(folderId, name)`, `(dataRoomId, name)` for search, `(path)` for subtree |
| Over-fetching | Never `SELECT *`; only fetch columns needed per view |
| Folder tree | Lazy-load: only fetch one level at a time, not recursive eager fetch |
| Search | Full-text search index (Postgres `tsvector`) or dedicated search (Typesense) |

### How sharing extends to viewer/editor roles without remodeling

The `SharePermission.role` and `ShareLink.role` fields are already `ShareRole` enums (`VIEWER` in MVP). Adding `EDITOR` requires:
1. Add `EDITOR` to the Prisma enum (one migration: `ALTER TYPE "ShareRole" ADD VALUE 'EDITOR'`)
2. Add permission checks in `PermissionsService.resolveAccess` for write operations
3. No table structure change — the polymorphic columns stay the same

---

## AI Usage Note

This project was built with AI assistance (Cursor + Claude Sonnet 4.6):
- **Architecture decisions**: data model, materialized path strategy, S3 upload flow, sharing model — discussed and refined with AI
- **Code generation**: all NestJS modules, React components, Zustand stores, TanStack Query hooks generated with AI
- **Error fixing**: TypeScript strict mode errors (TS1272 with `module: nodenext`, Prisma 7 API changes) debugged iteratively with AI
- **Manual work**: domain-specific logic review, auth flow validation, edge case test scenarios, deployment configuration
