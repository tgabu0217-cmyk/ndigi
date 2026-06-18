import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_NAME_LENGTH = 100;

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

  const { name, parentId } = body as { name?: string; parentId?: string | null };

  const update: { name?: string; parent_id?: string | null } = {};

  if (name !== undefined) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return NextResponse.json({ error: "フォルダ名を入力してください" }, { status: 400 });
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: `フォルダ名は${MAX_NAME_LENGTH}文字以内にしてください` }, { status: 400 });
    }
    update.name = trimmedName;
  }

  if (parentId !== undefined) {
    if (parentId === id) {
      return NextResponse.json({ error: "自分自身を親フォルダにはできません" }, { status: 400 });
    }
    update.parent_id = parentId;
  }

  const { error } = await supabase.from("folders").update(update).eq("id", id);

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

  // フォルダ削除時、直下のNPCは「未分類」に戻す（folder_id を null に）
  const { error: unsetErr } = await supabase
    .from("npcs")
    .update({ folder_id: null })
    .eq("folder_id", id);
  if (unsetErr) {
    return NextResponse.json({ error: unsetErr.message }, { status: 500 });
  }

  // サブフォルダは DB の on delete cascade により自動的に削除される
  const { error } = await supabase.from("folders").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
