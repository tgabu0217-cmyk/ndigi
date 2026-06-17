"use client";

import { useState } from "react";

interface Props {
  label: string;
  formula?: string;
  autoVal: number | null;
  override: number | null;
  onOverride: (v: number | null) => void;
  compact?: boolean;
}

export function OverrideField({ label, formula, autoVal, override, onOverride, compact = false }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const display = override !== null ? override : autoVal;
  const isOver = override !== null;

  const startEdit = () => {
    setDraft(String(display ?? ""));
    setEditing(true);
  };
  const confirm = () => {
    const n = parseInt(draft, 10);
    onOverride(isNaN(n) ? null : n);
    setEditing(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`min-w-9 text-[26px] font-bold ${display == null ? "text-neutral-500" : ""}`}>
          {display ?? "—"}
        </div>
        {editing ? (
          <div className="flex gap-[3px]">
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && confirm()}
              className="h-7 w-[50px] rounded border border-neutral-900 text-center text-[13px] outline-none"
            />
            <button onClick={confirm} className="h-7 rounded border border-neutral-900 bg-neutral-900 px-2 text-[11px] text-white">
              OK
            </button>
            <button
              onClick={() => {
                if (isOver) onOverride(null);
                setEditing(false);
              }}
              className="h-7 rounded border border-neutral-400 bg-neutral-100 px-1.5 text-[11px]"
            >
              x
            </button>
          </div>
        ) : (
          <button onClick={startEdit} className="rounded border border-neutral-400 bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500">
            {isOver ? "編集" : "上書き"}
          </button>
        )}
        {isOver && !editing && (
          <button onClick={() => onOverride(null)} className="text-[10px] text-neutral-500 underline">
            自動
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-w-[90px] rounded border border-neutral-300 bg-neutral-100 px-2.5 py-2">
      <div className="mb-0.5 text-[11px] text-neutral-500">
        {label}
        {isOver && (
          <button onClick={() => onOverride(null)} className="ml-1 text-[10px] text-neutral-500 underline">
            自動
          </button>
        )}
      </div>
      {formula && <div className="mb-1 text-[10px] text-neutral-500">{formula}</div>}
      {editing ? (
        <div className="flex gap-[3px]">
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && confirm()}
            className="h-7 w-[50px] rounded border border-neutral-900 text-center text-[13px] outline-none"
          />
          <button onClick={confirm} className="h-7 rounded border border-neutral-900 bg-neutral-900 px-2 text-[11px] text-white">
            OK
          </button>
          <button onClick={() => setEditing(false)} className="h-7 rounded border border-neutral-400 bg-neutral-100 px-1.5 text-[11px]">
            x
          </button>
        </div>
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className={`text-[22px] font-bold ${display == null ? "text-neutral-500" : ""}`}>{display ?? "—"}</span>
          <button onClick={startEdit} className="rounded border border-neutral-400 bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500">
            {isOver ? "編集" : "上書き"}
          </button>
        </div>
      )}
    </div>
  );
}
