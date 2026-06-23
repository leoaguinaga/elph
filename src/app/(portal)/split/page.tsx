import { requireSession } from "@/lib/session";
import { getActivePlanSummary } from "@/server/db/plans";
import { SplitScreen } from "./_SplitScreen";

export default async function SplitPage() {
  const session = await requireSession();
  const plan = await getActivePlanSummary(session.user.id);
  return <SplitScreen plan={plan} todayWeekday={new Date().getDay()} />;
}
