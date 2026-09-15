import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";

const DEMO_USER = { email: "admin@example.com", password: "TeamBaseDemo123!", name: "Alex" };

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== "string" || typeof password !== "string" || email.toLowerCase() !== DEMO_USER.email || password !== DEMO_USER.password) {
      return NextResponse.json({ message: "Incorrect email or password." }, { status: 401 });
    }
    const token = await createSession({ email: DEMO_USER.email, name: DEMO_USER.name });
    const response = NextResponse.json({ user: { email: DEMO_USER.email, name: DEMO_USER.name } });
    response.cookies.set("workbase_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
    return response;
  } catch {
    return NextResponse.json({ message: "Invalid sign-in request." }, { status: 400 });
  }
}
