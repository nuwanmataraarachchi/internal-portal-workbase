import { db } from "@/lib/db";
import { ensureTeamSchema } from "@/lib/team-data";
import { getUserDesignation } from "@/lib/users";
import UserDirectory from "@/components/users/UserDirectory";

export default async function UsersPage() {
  await ensureTeamSchema();
  const result = await db().query("SELECT id, name, username, email, role, details, is_active FROM users ORDER BY name ASC");
  const users = result.rows.map((user) => ({ id: user.id, name: user.name, username: user.username, email: user.email, role: user.role, designation: getUserDesignation(user.details), birthday: user.details?.birthday ?? null, isActive: user.is_active }));
  return <UserDirectory initialUsers={users} />;
}
