"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { FolderListItem, NpcListItem } from "@/types/npc";

interface BreadcrumbItem {
  id: string | null; // null = ルート
  name: string;
}

export function FolderBrowser() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: "マイページ" }]);
  const [allFolders, setAllFolders] = useState<FolderListItem[]>([]);
  const [npcs, setNpcs] = useState<NpcListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadFolders = useCallback(async () => {
    const res = await fetch("/api/folders");
    if (res.ok) {
      const body = await res.json();
      setAllFolders(body.folders ?? []);
    }
  }, []);

  const loadNpcs = useCallback(async (folderId: string | null) => {
    const url = folderId ? `/api/npcs?folderId=${folderId}` : "/api/npcs?folderId=root";
    const res = await fetch(url);
    if (res.ok) {
      const body = await res.json();
      setNpcs(body.npcs ?? []);
    } else {
      const body = await res.json().catch(() => ({}));
      setErrorMsg(body.error || "一覧の取得に失敗しました");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await Promise.all([loadFolders(), loadNpcs(currentFolderId)]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentFolderId, loadFolders, loadNpcs]);


  const subFolders = allFolders.filter((f) => f.parent_id === currentFolderId);

  const enterFolder = (folder: FolderListItem) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const goToBreadcrumb = (index: number) => {
    const target = breadcrumbs[index];
    setCurrentFolderId(target.id);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const handleCreateFolder = async () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, parentId: currentFolderId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "フォルダの作成に失敗しました");
      }
      setNewFolderName("");
      setCreatingFolder(false);
      await loadFolders();
    } catch (e) {
      alert(e instanceof Error ? e.message : "フォルダの作成に失敗しました");
    }
  };

  const handleRenameFolder = async (id: string) => {
    const trimmed = renameDraft.trim();
    if (!trimmed) return;
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "リネームに失敗しました");
      }
      setRenamingFolderId(null);
      await loadFolders();
    } catch (e) {
      alert(e instanceof Error ? e.message : "リネームに失敗しました");
    }
  };

  const handleDeleteFolder = async (folder: FolderListItem) => {
    if (!window.confirm(`「${folder.name}」を削除しますか？\n中のNPCは未分類に戻り、サブフォルダも削除されます。`)) return;
    setDeletingId(folder.id);
    try {
      const res = await fetch(`/api/folders/${folder.id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "削除に失敗しました");
      }
      await Promise.all([loadFolders(), loadNpcs(currentFolderId)]);
    } catch (e) {
      alert(e instanceof Error ? e.message : "削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteNpc = async (id: string, name: string) => {
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

  const handleMoveNpc = async (npcId: string, targetFolderId: string | null) => {
    try {
      const res = await fetch(`/api/npcs/${npcId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: targetFolderId, moveOnly: true }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "移動に失敗しました");
      }
      await loadNpcs(currentFolderId);
    } catch (e) {
      alert(e instanceof Error ? e.message : "移動に失敗しました");
    }
  };

  if (loading && npcs.length === 0 && allFolders.length === 0) {
    return <div className="p-3 text-sm text-neutral-500">読み込み中...</div>;
  }

  return (
    <div className="p-3">
      {/* パンくずナビ */}
      <div className="mb-3 flex flex-wrap items-center gap-1 text-sm">
        {breadcrumbs.map((b, i) => (
          <span key={b.id ?? "root"} className="flex items-center gap-1">
            {i > 0 && <span className="text-neutral-400">/</span>}
            <button
              onClick={() => goToBreadcrumb(i)}
              className={i === breadcrumbs.length - 1 ? "font-bold text-black" : "text-neutral-500 underline"}
            >
              {b.name}
            </button>
          </span>
        ))}
      </div>

      {errorMsg && <div className="mb-3 text-sm text-red-600">{errorMsg}</div>}

      {/* 操作ボタン */}
      <div className="mb-4 flex gap-2">
        <Link
          href={`/editor${currentFolderId ? `?folderId=${currentFolderId}` : ""}`}
          className="flex-1 rounded border border-neutral-900 bg-neutral-900 px-3 py-2.5 text-center text-sm font-bold text-white"
        >
          + 新しいNPCを作成
        </Link>
        <button
          onClick={() => setCreatingFolder((v) => !v)}
          className="shrink-0 rounded border border-neutral-400 bg-neutral-100 px-3 py-2.5 text-sm font-semibold"
        >
          📁 + フォルダ
        </button>
      </div>

      {creatingFolder && (
        <div className="mb-4 flex items-center gap-2 rounded border border-neutral-300 bg-neutral-50 p-2">
          <input
            type="text"
            autoFocus
            value={newFolderName}
            placeholder="フォルダ名（シナリオ名など）"
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            className="flex-1 rounded border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
          />
          <button onClick={handleCreateFolder} className="shrink-0 rounded border border-neutral-900 bg-neutral-900 px-3 py-1.5 text-sm text-white">
            作成
          </button>
          <button
            onClick={() => {
              setCreatingFolder(false);
              setNewFolderName("");
            }}
            className="shrink-0 rounded border border-neutral-400 bg-neutral-100 px-2.5 py-1.5 text-sm"
          >
            x
          </button>
        </div>
      )}

      {/* サブフォルダ一覧 */}
      {subFolders.length > 0 && (
        <div className="mb-4">
          <div className="mb-1.5 text-xs font-bold text-neutral-500">フォルダ</div>
          <div className="flex flex-col gap-1.5">
            {subFolders.map((f) => (
              <div key={f.id} className="flex items-center gap-2 rounded border border-neutral-300 bg-neutral-50 p-2.5">
                {renamingFolderId === f.id ? (
                  <>
                    <input
                      type="text"
                      autoFocus
                      value={renameDraft}
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRenameFolder(f.id)}
                      className="flex-1 rounded border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-neutral-900"
                    />
                    <button onClick={() => handleRenameFolder(f.id)} className="shrink-0 rounded border border-neutral-900 bg-neutral-900 px-2.5 py-1 text-xs text-white">
                      保存
                    </button>
                    <button onClick={() => setRenamingFolderId(null)} className="shrink-0 rounded border border-neutral-400 bg-neutral-100 px-2 py-1 text-xs">
                      x
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => enterFolder(f)} className="flex-1 text-left text-sm font-semibold">
                      📁 {f.name}
                    </button>
                    <button
                      onClick={() => {
                        setRenamingFolderId(f.id);
                        setRenameDraft(f.name);
                      }}
                      className="shrink-0 rounded border border-neutral-400 px-2 py-1 text-xs"
                    >
                      名前変更
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(f)}
                      disabled={deletingId === f.id}
                      className="shrink-0 rounded border border-red-300 px-2 py-1 text-xs text-red-600"
                    >
                      削除
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NPC一覧 */}
      <div>
        <div className="mb-1.5 text-xs font-bold text-neutral-500">NPC（{npcs.length}件）</div>
        {npcs.length === 0 ? (
          <div className="rounded border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500">
            このフォルダにNPCはありません。
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {npcs.map((n) => (
              <div key={n.id} className="flex items-center gap-2 rounded border border-neutral-300 bg-white p-3">
                <Link href={`/editor/${n.id}`} className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{n.name || "名称未設定"}</span>
                    <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-600">{n.edition}版</span>
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-500">
                    {n.job || "職業未設定"} ・ 更新: {new Date(n.updated_at).toLocaleString("ja-JP")}
                  </div>
                </Link>
                <FolderMoveSelect
                  npcId={n.id}
                  currentFolderId={n.folder_id}
                  folders={allFolders}
                  onMove={handleMoveNpc}
                />
                <button
                  onClick={() => handleDeleteNpc(n.id, n.name)}
                  disabled={deletingId === n.id}
                  className="shrink-0 rounded border border-red-300 px-2.5 py-1.5 text-xs text-red-600"
                >
                  {deletingId === n.id ? "削除中..." : "削除"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FolderMoveSelect({
  npcId,
  currentFolderId,
  folders,
  onMove,
}: {
  npcId: string;
  currentFolderId: string | null;
  folders: FolderListItem[];
  onMove: (npcId: string, folderId: string | null) => void;
}) {
  return (
    <select
      value={currentFolderId ?? ""}
      onChange={(e) => onMove(npcId, e.target.value || null)}
      className="shrink-0 rounded border border-neutral-300 bg-white px-1.5 py-1.5 text-xs"
      title="フォルダを移動"
    >
      <option value="">未分類</option>
      {folders.map((f) => (
        <option key={f.id} value={f.id}>
          {f.name}
        </option>
      ))}
    </select>
  );
}
