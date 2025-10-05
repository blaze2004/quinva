import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ProfilePage from "@/app/(app)/profile/profile-form";
import { auth } from "@/lib/auth";

export default async function Profile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return <ProfilePage user={session.user} />;
}
