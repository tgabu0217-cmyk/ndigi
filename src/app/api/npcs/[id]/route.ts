import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateNpcPayload } from "@/lib/validate-npc";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }

  const { data, error } = await supabase.from("npcs").select("*").eq("id", id).single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ npc: data });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const { folderId, moveOnly } = body as { folderId?: string | null; moveOnly?: boolean };

  // フォルダ移動だけのリクエスト（マイページのドロップダウンから）はNPC本体データの検証をスキップする
  if (moveOnly) {
    const retryAfter = checkRateLimit(`${userData.user.id}:move-npc`, 60, 60_000);
    if (retryAfter !== null) {
      return NextResponse.json(
        { error: "操作の頻度が高すぎます。少し時間をおいて再度お試しください" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

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

    const { error } = await supabase
      .from("npcs")
      .update({ folder_id: folderId || null })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ id });
  }

  // 通常の保存（NPC本体データの更新）
  const retryAfter = checkRateLimit(`${userData.user.id}:save-npc`, 20, 60_000);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: "保存の頻度が高すぎます。少し時間をおいて再度お試しください" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const validated = validateNpcPayload(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

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

  const update: Record<string, unknown> = {
    name: validated.name,
    job: validated.job,
    edition: validated.edition,
    data: validated.payload,
  };
  if (folderId !== undefined) {
    update.folder_id = folderId || null;
  }

  const { error } = await supabase.from("npcs").update(update).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }

  const { error } = await supabase.from("npcs").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
