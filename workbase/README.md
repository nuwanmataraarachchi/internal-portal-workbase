# Workbase

Workbase is a small internal portal with protected access and a team announcements feed. The announcements section is intentionally the single completed content area: authenticated users can view updates and publish new ones.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set a secure `AUTH_SECRET`.
3. Start PostgreSQL with `docker compose up -d`. If port 5432 is already in use, run `POSTGRES_PORT=5433 docker compose up -d` and change the port in `DATABASE_URL` to `5433`.
4. Run `npm run dev` and open `http://localhost:3000`.

The database schema and one starter announcement are initialized automatically the first time the PostgreSQL volume is created.

Demo sign-in credentials:

- Email: `admin@example.com`
- Password: `TeamBaseDemo123!`

## Key decisions

- Authentication uses an HTTP-only, signed JWT session cookie. The dashboard, announcements page, and announcements API each validate the session.
- Announcements are persisted in PostgreSQL. API inputs are validated with Zod and database queries use parameterized values.
- The app uses the Next.js App Router. The announcements page renders its initial feed on the server, while the create form updates the local feed immediately after the API confirms the post.
- The dark, collapsible sidebar is shared by application routes and provides navigation to the dashboard and announcements feed.
