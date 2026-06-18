import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NpcEditor } from "@/components/npc-editor/NpcEditor";
import type { SavedNpcPayload } from "@/types/npc";

export default async function EditNpcPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/");
  }

  const { data, error } = await supabase.from("npcs").select("*").eq("id", id).single();

  if (error || !data) {
    redirect("/dashboard");
  }

  const payload = data.data as SavedNpcPayload;

  return (
    <NpcEditor
      isLoggedIn={true}
      npcId={id}
      initialPayload={payload}
      initialFolderId={data.folder_id}
    />
  );
}
