import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

export type Session = {
  username: string;
  email: string;
  name: string;
  role: string;
  details: Record<string, string>;
};

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "local-development-secret-change-before-production");

export async function createSession(user: Session) {
  return new SignJWT(user).setProtectedHeader({ alg: "HS256" }).setSubject(user.username).setIssuer("workbase").setIssuedAt().setExpirationTime("8h").sign(secret);
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get("workbase_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.username !== "string" || typeof payload.email !== "string" || typeof payload.name !== "string" || typeof payload.role !== "string" || !isDetails(payload.details)) return null;
    return { username: payload.username, email: payload.email, name: payload.name, role: payload.role, details: payload.details };
  } catch {
    return null;
  }
}

function isDetails(value: unknown): value is Record<string, string> {
  return typeof value === "object" && value !== null && Object.values(value).every((item) => typeof item === "string");
}
