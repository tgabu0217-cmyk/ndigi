"use client";

import Link from "next/link";
import type { Edition } from "@/types/npc";

interface Props {
  edition: Edition;
  onEditionChange: (v: Edition) => void;
  cmd: "CCB" | "CC";
  onCmdChange: (v: "CCB" | "CC") => void;
  onSaveJSON: () => void;
}

export function EditorHeader({ edition, onEditionChange, cmd, onCmdChange, onSaveJSON }: Props) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-300 p-2.5">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="text-[13px] text-neutral-500 underline">
          ← マイページ
        </Link>
        <span className="text-sm font-bold">CoC NPC Digitizer</span>
        <div className="flex overflow-hidden rounded border border-neutral-400">
          {[6, 7].map((v, i) => (
            <button
              key={v}
              onClick={() => onEditionChange(v as Edition)}
              className={`px-3.5 py-1.5 text-[13px] ${i > 0 ? "border-l border-neutral-400" : ""} ${
                edition === v ? "bg-neutral-900 font-bold text-white" : "bg-neutral-100"
              }`}
            >
              {v}版
            </button>
          ))}
        </div>
        {edition === 6 && (
          <div className="flex overflow-hidden rounded border border-neutral-400">
            {(["CCB", "CC"] as const).map((v, i) => (
              <button
                key={v}
                onClick={() => onCmdChange(v)}
                className={`px-3 py-1.5 text-xs ${i > 0 ? "border-l border-neutral-400" : ""} ${
                  cmd === v ? "bg-neutral-900 font-bold text-white" : "bg-neutral-100"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>
      <button onClick={onSaveJSON} className="rounded border border-neutral-400 bg-neutral-100 px-3 py-1.5 text-xs">
        JSON保存
      </button>
    </div>
  );
}
