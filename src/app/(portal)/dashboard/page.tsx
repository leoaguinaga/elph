import { requireSession } from "@/lib/session";
import { getDashboardData } from "@/server/db/dashboard";
import { HomeScreen } from "./_HomeScreen";

export default async function DashboardPage() {
  const session   = await requireSession();
  const dashboard = await getDashboardData(session.user.id);
  return (
    <HomeScreen
      userName={session.user.name}
      dashboard={dashboard}
    />
  );
}
