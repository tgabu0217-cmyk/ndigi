import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("npcs")
    .select("id, name, job, edition, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ npcs: data });
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

  const { name, job, edition, data } = body as {
    name?: string;
    job?: string;
    edition?: number;
    data?: unknown;
  };

  if (!data || (edition !== 6 && edition !== 7)) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const { data: inserted, error } = await supabase
    .from("npcs")
    .insert({
      user_id: userData.user.id,
      name: name || "名称未設定",
      job: job || "",
      edition,
      data,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: inserted.id });
}
