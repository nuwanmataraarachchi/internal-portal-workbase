import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { username, email, password } = payload;
    const login = typeof username === "string" ? username.trim() : typeof email === "string" ? email.trim() : "";
    if (!login || typeof password !== "string") {
      return NextResponse.json({ message: "Incorrect email or password." }, { status: 401 });
    }
    const result = await db().query("SELECT id, username, email, password_hash, name, role, details FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1) LIMIT 1", [login]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ message: "Incorrect username or password." }, { status: 401 });
    }
    const sessionUser = {
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      details: user.details || {},
    };
    const token = await createSession(sessionUser);
    const response = NextResponse.json({ user: sessionUser });
    response.cookies.set("workbase_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
    return response;
  } catch (error) {
    console.error("Sign-in request failed:", error);
    return NextResponse.json({ message: "Authentication service is unavailable. Check the database configuration." }, { status: 503 });
  }
}
