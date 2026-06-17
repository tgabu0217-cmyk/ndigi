"use client";

import { createClient } from "@/lib/supabase/client";

export function LoginButtons() {
  const supabase = createClient();

  const signIn = async (provider: "google" | "discord") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => signIn("google")}
        className="flex items-center justify-center gap-2 rounded border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
      >
        Googleでログイン
      </button>
      <button
        onClick={() => signIn("discord")}
        className="flex items-center justify-center gap-2 rounded bg-[#5865F2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4752c4]"
      >
        Discordでログイン
      </button>
    </div>
  );
}
