import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

type Session = { email: string; name: string };

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "local-development-secret-change-before-production");

export async function createSession(user: Session) {
  return new SignJWT(user).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(secret);
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get("workbase_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.email !== "string" || typeof payload.name !== "string") return null;
    return { email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}
