import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateNpcPayload } from "@/lib/validate-npc";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request, _context?: unknown) {
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folderId");

  let query = supabase
    .from("npcs")
    .select("id, name, job, edition, folder_id, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (folderId === "root") {
    query = query.is("folder_id", null);
  } else if (folderId) {
    query = query.eq("folder_id", folderId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ npcs: data });
}

export async function POST(request: Request, _context?: unknown) {
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }

  const retryAfter = checkRateLimit(`${userData.user.id}:save-npc`, 20, 60_000);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: "保存の頻度が高すぎます。少し時間をおいて再度お試しください" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const body = await request.json().catch(() => null);
  const validated = validateNpcPayload(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { folderId } = (body as { folderId?: string | null }) ?? {};

  if (folderId) {
    const { data: folder, error: folderErr } = await supabase
      .from("folders")
      .select("id")
      .eq("id", folderId)
      .single();
    if (folderErr || !folder) {
      return NextResponse.json({ error: "指定されたフォルダが見つかりません" }, { status: 400 });
    }
  }

  const { data: inserted, error } = await supabase
    .from("npcs")
    .insert({
      user_id: userData.user.id,
      name: validated.name,
      job: validated.job,
      edition: validated.edition,
      data: validated.payload,
      folder_id: folderId || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: inserted.id });
}