import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureTeamSchema } from "@/lib/team-data";
import { getUserDesignation } from "@/lib/users";
import { userDeleteSchema, userSchema, userUpdateSchema } from "@/lib/validation";

export const runtime = "nodejs";

function isUserManager(role: string) {
  return role === "admin" || role === "hr";
}

function toUser(row: { id: number; name: string; username: string; email: string; role: string; details: Record<string, string>; is_active: boolean }) {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    role: row.role,
    designation: getUserDesignation(row.details),
    birthday: row.details?.birthday ?? null,
    isActive: row.is_active,
  };
}

export async function GET() {
  const session = await getSession();
  if (!session || !isUserManager(session.role)) return NextResponse.json({ message: "Forbidden." }, { status: 403 });

  await ensureTeamSchema();
  const result = await db().query("SELECT id, name, username, email, role, details, is_active FROM users ORDER BY name ASC");
  return NextResponse.json({ users: result.rows.map(toUser) });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !isUserManager(session.role)) return NextResponse.json({ message: "Forbidden." }, { status: 403 });

  try {
    await ensureTeamSchema();
    const input = userSchema.safeParse(await request.json());
    if (!input.success) return NextResponse.json({ message: input.error.issues[0]?.message ?? "Invalid user." }, { status: 422 });

    const passwordHash = await bcrypt.hash(input.data.password, 12);
    const result = await db().query(
      "INSERT INTO users (username, email, password_hash, name, role, details, is_active) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7) RETURNING id, name, username, email, role, details, is_active",
      [input.data.username, input.data.email, passwordHash, input.data.name, input.data.role, JSON.stringify({ birthday: input.data.birthday, designation: input.data.designation }), input.data.isActive ?? true],
    );
    return NextResponse.json({ user: toUser(result.rows[0]) }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json({ message: "That username or email is already in use." }, { status: 409 });
    }
    return NextResponse.json({ message: "Unable to create user." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || !isUserManager(session.role)) return NextResponse.json({ message: "Forbidden." }, { status: 403 });

  try {
    await ensureTeamSchema();
    const input = userUpdateSchema.safeParse(await request.json());
    if (!input.success) return NextResponse.json({ message: input.error.issues[0]?.message ?? "Invalid user." }, { status: 422 });

    const details = JSON.stringify({ birthday: input.data.birthday, designation: input.data.designation, title: input.data.designation });
    const values = [input.data.name, input.data.username, input.data.email, input.data.role, details, input.data.isActive ?? true, input.data.id];
    let result;

    if (input.data.password) {
      const passwordHash = await bcrypt.hash(input.data.password, 12);
      result = await db().query(
        "UPDATE users SET name = $1, username = $2, email = $3, role = $4, details = $5::jsonb, is_active = $6, password_hash = $8 WHERE id = $7 RETURNING id, name, username, email, role, details, is_active",
        [...values, passwordHash],
      );
    } else {
      result = await db().query(
        "UPDATE users SET name = $1, username = $2, email = $3, role = $4, details = $5::jsonb, is_active = $6 WHERE id = $7 RETURNING id, name, username, email, role, details, is_active",
        values,
      );
    }

    if (!result.rowCount) return NextResponse.json({ message: "User not found." }, { status: 404 });
    return NextResponse.json({ user: toUser(result.rows[0]) });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json({ message: "That username or email is already in use." }, { status: 409 });
    }
    return NextResponse.json({ message: "Unable to update user." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || !isUserManager(session.role)) return NextResponse.json({ message: "Forbidden." }, { status: 403 });

  try {
    await ensureTeamSchema();
    const input = userDeleteSchema.safeParse(await request.json());
    if (!input.success) return NextResponse.json({ message: input.error.issues[0]?.message ?? "Invalid user." }, { status: 422 });
    if (input.data.id === session.userId) return NextResponse.json({ message: "You cannot delete your own account while signed in." }, { status: 422 });

    const result = await db().query("DELETE FROM users WHERE id = $1 RETURNING id", [input.data.id]);
    if (!result.rowCount) return NextResponse.json({ message: "User not found." }, { status: 404 });
    return NextResponse.json({ id: input.data.id });
  } catch {
    return NextResponse.json({ message: "Unable to delete user." }, { status: 500 });
  }
}
