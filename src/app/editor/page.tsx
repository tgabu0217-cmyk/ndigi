"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { NpcEditor } from "@/components/npc-editor/NpcEditor";

export default function NewEditorPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  if (isLoggedIn === null) {
    return <div className="p-6 text-sm text-neutral-500">読み込み中...</div>;
  }

  return (
    <NpcEditor
      isLoggedIn={isLoggedIn}
      onSaved={(id) => {
        router.replace(`/editor/${id}`);
      }}
    />
  );
}
