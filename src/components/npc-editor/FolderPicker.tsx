"use client";

import { useEffect, useState } from "react";
import type { FolderListItem } from "@/types/npc";

interface Props {
  folderId: string | null;
  onChange: (folderId: string | null) => void;
}

export function FolderPicker({ folderId, onChange }: Props) {
  const [folders, setFolders] = useState<FolderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/folders")
      .then((res) => (res.ok ? res.json() : { folders: [] }))
      .then((body) => setFolders(body.folders ?? []))
      .finally(() => setLoading(false));
  }, []);

  // 親子関係を見やすくするため、階層に応じてインデントしたラベルを作る
  const buildLabel = (folder: FolderListItem, depth: number): string =>
    `${"　".repeat(depth)}${depth > 0 ? "└ " : ""}${folder.name}`;

  const orderedOptions: { id: string; label: string }[] = [];
  const addChildren = (parentId: string | null, depth: number) => {
    folders
      .filter((f) => f.parent_id === parentId)
      .forEach((f) => {
        orderedOptions.push({ id: f.id, label: buildLabel(f, depth) });
        addChildren(f.id, depth + 1);
      });
  };
  addChildren(null, 0);

  return (
    <div className="border-b border-neutral-300 p-3">
      <div className="mb-1.5 text-xs font-bold text-neutral-500">保存先フォルダ</div>
      <select
        value={folderId ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={loading}
        className="w-full rounded border border-neutral-300 px-2.5 py-2 text-sm outline-none focus:border-neutral-900"
      >
        <option value="">未分類</option>
        {orderedOptions.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
