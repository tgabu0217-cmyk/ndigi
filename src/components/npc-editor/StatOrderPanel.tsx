"use client";

import type { StatOrderKey } from "@/types/npc";

interface Props {
  statOrderKey: StatOrderKey;
  onChange: (key: StatOrderKey) => void;
}

const OPTIONS: { key: StatOrderKey; label: string; desc: string }[] = [
  { key: "default", label: "初期版", desc: "STR,CON,DEX,INT,POW,SIZ,APP,EDU" },
  { key: "doujin", label: "同人シナリオ用", desc: "STR,CON,POW,DEX,APP,SIZ,INT,EDU" },
];

export function StatOrderPanel({ statOrderKey, onChange }: Props) {
  return (
    <div className="border-b border-neutral-300 p-3">
      <div className="mb-2 text-xs font-bold text-neutral-500">能力値の並び順</div>
      <div className="flex gap-1.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`flex-1 rounded border px-1.5 py-2 text-center ${
              statOrderKey === opt.key ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-400 bg-neutral-100"
            }`}
          >
            <div className="mb-0.5 text-[13px] font-bold">{opt.label}</div>
            <div className="text-[10px] opacity-80">{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
