"use client";

import Link from "next/link";
import { useState } from "react";

interface NpcListItem {
  id: string;
  name: string;
  job: string | null;
  edition: number;
  updated_at: string;
}

interface Props {
  initialNpcs: NpcListItem[];
}

export function NpcList({ initialNpcs }: Props) {
  const [npcs, setNpcs] = useState(initialNpcs);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`「${name}」を削除しますか？この操作は取り消せません。`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/npcs/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "削除に失敗しました");
      }
      setNpcs((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  if (npcs.length === 0) {
    return (
      <div className="rounded border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
        保存されたNPCはまだありません。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {npcs.map((n) => (
        <div key={n.id} className="flex items-center gap-2 rounded border border-neutral-300 bg-neutral-50 p-3">
          <Link href={`/editor/${n.id}`} className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{n.name || "名称未設定"}</span>
              <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-600">{n.edition}版</span>
            </div>
            <div className="mt-0.5 text-xs text-neutral-500">
              {n.job || "職業未設定"} ・ 更新: {new Date(n.updated_at).toLocaleString("ja-JP")}
            </div>
          </Link>
          <button
            onClick={() => handleDelete(n.id, n.name)}
            disabled={deletingId === n.id}
            className="shrink-0 rounded border border-red-300 px-2.5 py-1.5 text-xs text-red-600"
          >
            {deletingId === n.id ? "削除中..." : "削除"}
          </button>
        </div>
      ))}
    </div>
  );
}
