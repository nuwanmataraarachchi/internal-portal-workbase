import { db } from "@/lib/db";

let schemaPromise;

export function ensureTeamSchema() {
  if (!schemaPromise) {
    schemaPromise = db().query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
      ALTER TABLE announcements ADD COLUMN IF NOT EXISTS author_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE announcements ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
      ALTER TABLE announcements ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ;
      ALTER TABLE announcements ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ;
      CREATE TABLE IF NOT EXISTS teams (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL UNIQUE,
        description TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS team_members (
        team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (team_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS announcement_targets (
        announcement_id BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
        target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('individual', 'team')),
        target_id BIGINT NOT NULL,
        PRIMARY KEY (announcement_id, target_type, target_id)
      );
    `);
  }
  return schemaPromise;
}
