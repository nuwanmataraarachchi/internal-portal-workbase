import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function UsersLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/auth/signin");
  if (session.role !== "admin" && session.role !== "hr") redirect("/dashboard");
  return children;
}
