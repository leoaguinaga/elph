import { requireSession } from "@/lib/session";
import { getProfile } from "@/server/db/profile";
import { ProfileScreen } from "./_ProfileScreen";

export default async function ProfilePage() {
  const session = await requireSession();
  const profile = await getProfile(session.user.id);
  return (
    <ProfileScreen
      user={{ name: session.user.name, email: session.user.email }}
      profile={profile}
    />
  );
}
