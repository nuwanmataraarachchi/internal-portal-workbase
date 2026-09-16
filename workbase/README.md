# Workbase

Workbase is a Next.js internal portal for team announcements, users, teams, calendar views, and profile access. It uses PostgreSQL for data, Docker for the local database, and JWT session cookies for authentication.

## Stack

- Frontend: Next.js App Router, React, Tailwind CSS
- Backend: Next.js API routes, PostgreSQL, Zod validation
- Auth: HTTP-only JWT cookie signed with `AUTH_SECRET`
- Database: PostgreSQL 16 via Docker Compose

## Features

- Secure sign in and sign out
- Dashboard with workspace overview
- Announcements with scheduling, active/inactive state, and audience targeting
- Target announcements to everyone, selected users, or selected teams
- Calendar view for scheduled announcements
- User management for admins/HR
- Team management for admins/HR
- User profile page from the top-right account menu
- Collapsible sidebar navigation

## Requirements

- Node.js 20+
- npm
- Docker Desktop or Docker Engine

## Environment

Create `.env.local`:

```env
DATABASE_URL=postgresql://workbase:workbase@localhost:5432/workbase
AUTH_SECRET=replace-with-a-long-random-secret
```

If port `5432` is already used, run PostgreSQL on another port and update `DATABASE_URL`, for example `5433`.

## Start Locally

```bash
npm install
docker compose up -d
npm run dev
```

Open `http://localhost:3000`.

The Docker database initializes from:

- `database/schema.sql`
- `database/seed.sql`

## Demo Accounts

| Username | Password | Role |
| --- | --- | --- |
| `Admin` | `Admin@123` | Admin |
| `kasun-dev` | `Dev@123` | Member |
| `rosy-ba` | `BA@123` | Member |

## Useful Commands

```bash
npm run dev      # start development server
npm run lint     # run ESLint
npm run build    # production build
npm run start    # start production server after build
docker compose up -d      # start PostgreSQL
docker compose down       # stop PostgreSQL
```

## Project Structure

```text
app/                 Next.js pages, layouts, and API routes
components/          UI components for layout, auth, users, announcements
lib/                 auth, database, validation, and shared helpers
database/            PostgreSQL schema and seed data
store/               Redux Toolkit API/store setup
docker-compose.yml   local PostgreSQL service
```

## Backend Overview

The backend runs inside Next.js API routes under `app/api`. Routes read the signed session cookie, validate inputs with Zod, and query PostgreSQL using parameterized SQL through `pg`.

Main API areas:

- `app/api/auth/signin` and `app/api/auth/logout`
- `app/api/announcements`
- `app/api/audiences`
- `app/api/teams`
- `app/api/users`

## Database Overview

Core tables:

- `users`: account, role, status, and profile details
- `announcements`: announcement content, author, schedule, and active state
- `teams`: team records
- `team_members`: users assigned to teams
- `announcement_targets`: user/team targeting for announcements

## Access Rules

- Signed-out users are redirected to `/auth/signin`.
- Admin and HR users can manage users and teams.
- Members can view their visible announcements, calendar, dashboard, and profile.
- Announcement visibility includes public announcements, authored announcements, directly targeted users, and team-targeted users.
