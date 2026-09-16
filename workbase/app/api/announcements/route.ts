import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ensureTeamSchema } from "@/lib/team-data";
import { announcementSchema, announcementUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

type AnnouncementTarget = {
  type: "individual" | "team";
  id: number | string;
};

type AnnouncementRow = {
  id: number;
  title: string;
  body: string;
  author_name: string;
  created_at: Date;
  scheduled_start: Date | null;
  scheduled_end: Date | null;
  is_active: boolean;
  audience: string;
  targets: AnnouncementTarget[];
};

type AudienceType = "all" | "individual" | "team";

function toDateInput(value: Date | null) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

function toTimeInput(value: Date | null) {
  if (!value) return "";
  return value.toISOString().slice(11, 16);
}

function toAnnouncement(row: AnnouncementRow) {
  const targets = row.targets ?? [];
  const audienceType = targets[0]?.type ?? "all";

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    authorName: row.author_name,
    createdAt: row.created_at.toISOString(),
    scheduledStart: row.scheduled_start?.toISOString() ?? null,
    scheduledEnd: row.scheduled_end?.toISOString() ?? null,
    startDate: toDateInput(row.scheduled_start),
    startTime: toTimeInput(row.scheduled_start),
    endDate: toDateInput(row.scheduled_end),
    endTime: toTimeInput(row.scheduled_end),
    isActive: row.is_active,
    audience: row.audience,
    audienceType,
    audienceIds: targets.map((target) => Number(target.id)),
  };
}

function scheduleFromInput(input: { startDate: string; startTime: string; endDate: string; endTime: string }) {
  return {
    scheduledStart: new Date(`${input.startDate}T${input.startTime}`),
    scheduledEnd: new Date(`${input.endDate}T${input.endTime}`),
  };
}

async function findAudienceLabel(client: ReturnType<typeof db>, type: AudienceType, ids: number[]) {
  if (type === "all") return "All Workbase";
  const table = type === "individual" ? "users" : "teams";
  const result = await client.query(`SELECT name FROM ${table} WHERE id = ANY($1::bigint[]) ORDER BY name ASC`, [ids]);
  return result.rows.map((row) => row.name).join(", ") || (type === "team" ? "Selected teams" : "Selected users");
}

async function validateRecipients(client: ReturnType<typeof db>, type: AudienceType, ids: number[]) {
  if (type === "all") return true;
  const table = type === "individual" ? "users" : "teams";
  const activeFilter = type === "individual" ? " AND is_active = TRUE" : "";
  const recipients = await client.query(`SELECT id FROM ${table} WHERE id = ANY($1::bigint[])${activeFilter}`, [ids]);
  return recipients.rowCount === new Set(ids).size;
}

async function replaceTargets(client: ReturnType<typeof db>, announcementId: number, type: AudienceType, ids: number[]) {
  await client.query("DELETE FROM announcement_targets WHERE announcement_id = $1", [announcementId]);
  if (type === "all") return;
  for (const targetId of new Set(ids)) {
    await client.query("INSERT INTO announcement_targets (announcement_id, target_type, target_id) VALUES ($1, $2, $3)", [announcementId, type, targetId]);
  }
}

const announcementSelect = `
  SELECT
    a.id,
    a.title,
    a.body,
    a.author_name,
    a.created_at,
    a.scheduled_start,
    a.scheduled_end,
    a.is_active,
    COALESCE(NULLIF(string_agg(DISTINCT CASE at.target_type WHEN 'individual' THEN u.name WHEN 'team' THEN t.name END, ', '), ''), 'All Workbase') AS audience,
    COALESCE(json_agg(DISTINCT jsonb_build_object('type', at.target_type, 'id', at.target_id)) FILTER (WHERE at.target_id IS NOT NULL), '[]') AS targets
  FROM announcements a
  LEFT JOIN announcement_targets at ON at.announcement_id = a.id
  LEFT JOIN users u ON at.target_type = 'individual' AND at.target_id = u.id
  LEFT JOIN teams t ON at.target_type = 'team' AND at.target_id = t.id
`;

const visibleWhere = `
  WHERE NOT EXISTS (SELECT 1 FROM announcement_targets targets WHERE targets.announcement_id = a.id)
    OR a.author_user_id = $1
    OR EXISTS (SELECT 1 FROM announcement_targets targets WHERE targets.announcement_id = a.id AND targets.target_type = 'individual' AND targets.target_id = $1)
    OR EXISTS (SELECT 1 FROM announcement_targets targets JOIN team_members tm ON tm.team_id = targets.target_id WHERE targets.announcement_id = a.id AND targets.target_type = 'team' AND tm.user_id = $1)
`;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  try {
    await ensureTeamSchema();
    const result = await db().query(`${announcementSelect} ${visibleWhere} GROUP BY a.id ORDER BY a.scheduled_start DESC NULLS LAST, a.created_at DESC, a.id DESC`, [session.userId]);
    return NextResponse.json({ announcements: result.rows.map(toAnnouncement) });
  } catch {
    return NextResponse.json({ message: "Unable to load announcements." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const client = await db().connect();
  try {
    await ensureTeamSchema();
    const input = announcementSchema.safeParse(await request.json());
    if (!input.success) return NextResponse.json({ message: input.error.issues[0]?.message ?? "Invalid announcement." }, { status: 422 });
    if (!(await validateRecipients(client, input.data.audienceType, input.data.audienceIds))) return NextResponse.json({ message: "One or more selected recipients no longer exist." }, { status: 422 });

    const { scheduledStart, scheduledEnd } = scheduleFromInput(input.data);
    await client.query("BEGIN");
    const created = await client.query(
      "INSERT INTO announcements (title, body, author_name, author_user_id, scheduled_start, scheduled_end, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, title, body, author_name, created_at, scheduled_start, scheduled_end, is_active",
      [input.data.title, input.data.body, session.name, session.userId, scheduledStart, scheduledEnd, input.data.isActive ?? true],
    );
    await replaceTargets(client, created.rows[0].id, input.data.audienceType, input.data.audienceIds);
    await client.query("COMMIT");

    const audience = await findAudienceLabel(client, input.data.audienceType, input.data.audienceIds);
    const targets = input.data.audienceType === "all" ? [] : input.data.audienceIds.map((id) => ({ type: input.data.audienceType, id }));
    return NextResponse.json({ announcement: toAnnouncement({ ...created.rows[0], audience, targets }) }, { status: 201 });
  } catch {
    await client.query("ROLLBACK");
    return NextResponse.json({ message: "Unable to publish announcement." }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const client = await db().connect();
  try {
    await ensureTeamSchema();
    const input = announcementUpdateSchema.safeParse(await request.json());
    if (!input.success) return NextResponse.json({ message: input.error.issues[0]?.message ?? "Invalid announcement." }, { status: 422 });
    if (!(await validateRecipients(client, input.data.audienceType, input.data.audienceIds))) return NextResponse.json({ message: "One or more selected recipients no longer exist." }, { status: 422 });

    const { scheduledStart, scheduledEnd } = scheduleFromInput(input.data);
    await client.query("BEGIN");
    const updated = await client.query(
      "UPDATE announcements SET title = $1, body = $2, scheduled_start = $3, scheduled_end = $4, is_active = $5 WHERE id = $6 RETURNING id, title, body, author_name, created_at, scheduled_start, scheduled_end, is_active",
      [input.data.title, input.data.body, scheduledStart, scheduledEnd, input.data.isActive ?? true, input.data.id],
    );
    if (!updated.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Announcement not found." }, { status: 404 });
    }
    await replaceTargets(client, input.data.id, input.data.audienceType, input.data.audienceIds);
    await client.query("COMMIT");

    const audience = await findAudienceLabel(client, input.data.audienceType, input.data.audienceIds);
    const targets = input.data.audienceType === "all" ? [] : input.data.audienceIds.map((id) => ({ type: input.data.audienceType, id }));
    return NextResponse.json({ announcement: toAnnouncement({ ...updated.rows[0], audience, targets }) });
  } catch {
    await client.query("ROLLBACK");
    return NextResponse.json({ message: "Unable to update announcement." }, { status: 500 });
  } finally {
    client.release();
  }
}
