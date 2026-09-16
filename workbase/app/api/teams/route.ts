import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ensureTeamSchema } from "@/lib/team-data";
import { toUserSummary } from "@/lib/users";
import { teamSchema, teamUpdateSchema } from "@/lib/validation";

function canManageTeams(role: string) { return role === "admin" || role === "hr"; }

export async function GET() {
  const session = await getSession();
  if (!session || !canManageTeams(session.role)) return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  await ensureTeamSchema();
  const result = await db().query("SELECT t.id, t.name, t.description, COALESCE(json_agg(json_build_object('id', u.id, 'name', u.name, 'designation', COALESCE(u.details->>'designation', u.details->>'title', 'Not specified')) ORDER BY u.name) FILTER (WHERE u.id IS NOT NULL), '[]') AS members FROM teams t LEFT JOIN team_members tm ON tm.team_id = t.id LEFT JOIN users u ON u.id = tm.user_id GROUP BY t.id ORDER BY t.name");
  return NextResponse.json({ teams: result.rows });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !canManageTeams(session.role)) return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  const client = await db().connect();
  try {
    await ensureTeamSchema();
    const input = teamSchema.safeParse(await request.json());
    if (!input.success) return NextResponse.json({ message: input.error.issues[0]?.message ?? "Invalid team." }, { status: 422 });
    const members = await client.query("SELECT id FROM users WHERE id = ANY($1::bigint[])", [input.data.memberIds]);
    if (members.rowCount !== new Set(input.data.memberIds).size) return NextResponse.json({ message: "One or more selected users no longer exist." }, { status: 422 });
    await client.query("BEGIN");
    const team = await client.query("INSERT INTO teams (name, description) VALUES ($1, $2) RETURNING id, name, description", [input.data.name, input.data.description]);
    for (const userId of new Set(input.data.memberIds)) await client.query("INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)", [team.rows[0].id, userId]);
    await client.query("COMMIT");
    const users = await client.query("SELECT id, name, details FROM users WHERE id = ANY($1::bigint[]) ORDER BY name ASC", [input.data.memberIds]);
    return NextResponse.json({ team: { ...team.rows[0], members: users.rows.map(toUserSummary) } }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") return NextResponse.json({ message: "A team with that name already exists." }, { status: 409 });
    return NextResponse.json({ message: "Unable to create team." }, { status: 500 });
  } finally { client.release(); }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || !canManageTeams(session.role)) return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  const client = await db().connect();
  try {
    await ensureTeamSchema();
    const input = teamUpdateSchema.safeParse(await request.json());
    if (!input.success) return NextResponse.json({ message: input.error.issues[0]?.message ?? "Invalid team." }, { status: 422 });

    const members = await client.query("SELECT id FROM users WHERE id = ANY($1::bigint[]) AND is_active = TRUE", [input.data.memberIds]);
    if (members.rowCount !== new Set(input.data.memberIds).size) return NextResponse.json({ message: "One or more selected users no longer exist or are inactive." }, { status: 422 });

    await client.query("BEGIN");
    const team = await client.query("UPDATE teams SET name = $1, description = $2 WHERE id = $3 RETURNING id, name, description", [input.data.name, input.data.description, input.data.id]);
    if (!team.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Team not found." }, { status: 404 });
    }
    await client.query("DELETE FROM team_members WHERE team_id = $1", [input.data.id]);
    for (const userId of new Set(input.data.memberIds)) await client.query("INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)", [input.data.id, userId]);
    await client.query("COMMIT");

    const users = await client.query("SELECT id, name, details FROM users WHERE id = ANY($1::bigint[]) ORDER BY name ASC", [input.data.memberIds]);
    return NextResponse.json({ team: { ...team.rows[0], members: users.rows.map(toUserSummary) } });
  } catch (error) {
    await client.query("ROLLBACK");
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") return NextResponse.json({ message: "A team with that name already exists." }, { status: 409 });
    return NextResponse.json({ message: "Unable to update team." }, { status: 500 });
  } finally { client.release(); }
}
