"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { NpcEditor } from "@/components/npc-editor/NpcEditor";

function NewEditorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
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
      initialFolderId={folderId}
      onSaved={(id) => {
        router.replace(`/editor/${id}`);
      }}
    />
  );
}

export default function NewEditorPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">読み込み中...</div>}>
      <NewEditorInner />
    </Suspense>
  );
}
