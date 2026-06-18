import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_NAME_LENGTH = 100;

export async function GET() {
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("folders")
    .select("id, name, parent_id, created_at, updated_at")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ folders: data });
}

export async function POST(request: Request) {
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

  const trimmedName = (name || "").trim();
  if (!trimmedName) {
    return NextResponse.json({ error: "フォルダ名を入力してください" }, { status: 400 });
  }
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: `フォルダ名は${MAX_NAME_LENGTH}文字以内にしてください` }, { status: 400 });
  }

  // 親フォルダを指定する場合、自分自身が所有しているフォルダか確認（RLSでも守られるが明示チェック）
  if (parentId) {
    const { data: parent, error: parentErr } = await supabase
      .from("folders")
      .select("id")
      .eq("id", parentId)
      .single();
    if (parentErr || !parent) {
      return NextResponse.json({ error: "親フォルダが見つかりません" }, { status: 400 });
    }
  }

  const { data: inserted, error } = await supabase
    .from("folders")
    .insert({ user_id: userData.user.id, name: trimmedName, parent_id: parentId || null })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: inserted.id });
}
