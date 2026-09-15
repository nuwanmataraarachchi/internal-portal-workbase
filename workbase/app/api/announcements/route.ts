import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { announcementSchema } from "@/lib/validation";

export const runtime = "nodejs";

type AnnouncementRow = {
  id: number;
  title: string;
  body: string;
  author_name: string;
  created_at: Date;
};

function toAnnouncement(row: AnnouncementRow) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    authorName: row.author_name,
    createdAt: row.created_at.toISOString(),
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  try {
    const result = await db().query("SELECT id, title, body, author_name, created_at FROM announcements ORDER BY created_at DESC, id DESC");
    return NextResponse.json({ announcements: result.rows.map(toAnnouncement) });
  } catch {
    return NextResponse.json({ message: "Unable to load announcements." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  try {
    const input = announcementSchema.safeParse(await request.json());
    if (!input.success) {
      return NextResponse.json({ message: input.error.issues[0]?.message ?? "Invalid announcement." }, { status: 422 });
    }

    const result = await db().query(
      "INSERT INTO announcements (title, body, author_name) VALUES ($1, $2, $3) RETURNING id, title, body, author_name, created_at",
      [input.data.title, input.data.body, session.name],
    );
    return NextResponse.json({ announcement: toAnnouncement(result.rows[0]) }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to publish announcement." }, { status: 500 });
  }
}
