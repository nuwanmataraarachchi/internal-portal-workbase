import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ensureTeamSchema } from "@/lib/team-data";
import { toUserSummary } from "@/lib/users";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  await ensureTeamSchema();
  const [users, teams] = await Promise.all([db().query("SELECT id, name, details FROM users WHERE is_active = TRUE ORDER BY name ASC"), db().query("SELECT id, name FROM teams ORDER BY name ASC")]);
  return NextResponse.json({ users: users.rows.map(toUserSummary), teams: teams.rows });
}
