"use client";

interface Props {
  onReset: () => void;
  onShowSheet: () => void;
  onCopy: () => void;
  copied: boolean;
  onSave?: () => void;
  saving?: boolean;
  saved?: boolean;
  isLoggedIn?: boolean;
}

export function CopyBar({ onReset, onShowSheet, onCopy, copied, onSave, saving, saved, isLoggedIn }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] mx-auto flex max-w-[600px] gap-2 border-t border-neutral-300 bg-white p-3">
      <button onClick={onReset} className="shrink-0 rounded border border-neutral-400 bg-neutral-100 px-2.5 py-2.5 text-[13px]">
        リセット
      </button>
      <button onClick={onShowSheet} className="shrink-0 rounded border border-neutral-400 bg-neutral-100 px-2.5 py-2.5 text-[13px] font-semibold">
        📋 確認
      </button>
      {isLoggedIn && onSave && (
        <button
          onClick={onSave}
          disabled={saving}
          className={`shrink-0 rounded border px-2.5 py-2.5 text-[13px] font-semibold ${
            saved ? "border-green-700 bg-green-700 text-white" : "border-neutral-400 bg-neutral-100"
          }`}
        >
          {saving ? "保存中..." : saved ? "保存済み ✓" : "💾 データを保存"}
        </button>
      )}
      <button
        onClick={onCopy}
        className={`flex-1 rounded text-sm font-bold text-white ${copied ? "bg-green-700" : "bg-neutral-900"}`}
      >
        {copied ? "コピー完了" : "ココフォリアへコピー"}
      </button>
    </div>
  );
}
