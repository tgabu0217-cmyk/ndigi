import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NpcList } from "@/components/dashboard/NpcList";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/");
  }

  const { data: npcs, error } = await supabase
    .from("npcs")
    .select("id, name, job, edition, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto min-h-screen max-w-[600px] bg-white">
      <div className="flex items-center justify-between border-b border-neutral-300 p-3">
        <div>
          <div className="text-sm font-bold">マイページ</div>
          <div className="text-xs text-neutral-500">{userData.user.email ?? userData.user.id}</div>
        </div>
        <LogoutButton />
      </div>

      <div className="p-3">
        <Link
          href="/editor"
          className="mb-4 block rounded border border-neutral-900 bg-neutral-900 px-4 py-2.5 text-center text-sm font-bold text-white"
        >
          + 新しいNPCを作成
        </Link>

        {error && <div className="text-sm text-red-600">一覧の取得に失敗しました: {error.message}</div>}

        <NpcList initialNpcs={npcs ?? []} />
      </div>
    </div>
  );
}
