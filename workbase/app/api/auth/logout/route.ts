import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/auth/signin", request.url), { status: 303 });
  response.cookies.set("workbase_session", "", { path: "/", maxAge: 0 });
  return response;
}
