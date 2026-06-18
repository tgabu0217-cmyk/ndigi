import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { FolderBrowser } from "@/components/dashboard/FolderBrowser";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/");
  }

  return (
    <div className="mx-auto min-h-screen max-w-[600px] bg-white">
      <div className="flex items-center justify-between border-b border-neutral-300 p-3">
        <div>
          <div className="text-sm font-bold">マイページ</div>
          <div className="text-xs text-neutral-500">{userData.user.email ?? userData.user.id}</div>
        </div>
        <LogoutButton />
      </div>

      <FolderBrowser />
    </div>
  );
}
