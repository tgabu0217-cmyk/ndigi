import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginButtons } from "@/components/auth/LoginButtons";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-center text-xl font-bold">CoC NPC Digitizer</h1>
        <p className="mb-6 text-center text-sm text-neutral-500">
          クトゥルフ神話TRPGのNPCをすばやくデジタル化
        </p>
        <LoginButtons />
        <div className="mt-6 text-center">
          <Link href="/editor" className="text-xs text-neutral-500 underline">
            ログインせずに使う（保存機能なし）
          </Link>
        </div>
      </div>
    </div>
  );
}
