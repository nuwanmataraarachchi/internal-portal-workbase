import { redirect } from "next/navigation";
import DashboardContent from "@/components/layout/DashboardContent";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  return <DashboardContent name={session.name} />;
}
