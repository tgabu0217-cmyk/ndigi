"use client";

import { useState } from "react";
import { DB_PRESETS } from "@/lib/coc/calc";

interface Props {
  name: string;
  job: string;
  db: string;
  onChange: (field: "name" | "job" | "db", value: string) => void;
}

export function BasicInfo({ name, job, db, onChange }: Props) {
  const isPreset = DB_PRESETS.includes(db);
  const [customMode, setCustomMode] = useState(!!db && !isPreset);
  const [customVal, setCustomVal] = useState(customMode ? db : "");

  const selectPreset = (v: string) => {
    setCustomMode(false);
    onChange("db", db === v ? "" : v);
  };
  const openCustom = () => {
    setCustomMode(true);
    setCustomVal("");
  };
  const confirmCustom = () => {
    if (customVal.trim()) onChange("db", customVal.trim());
  };

  return (
    <div className="border-b border-neutral-300 p-3">
      <div className="mb-2 text-xs font-bold text-neutral-500">基本情報</div>
      <div className="flex flex-col gap-2">
        <div>
          <label className="mb-0.5 block text-[11px] font-semibold text-neutral-500">NPC名</label>
          <input
            type="text"
            value={name}
            placeholder="NPC名"
            onChange={(e) => onChange("name", e.target.value)}
            className="w-full rounded border border-neutral-300 px-2.5 py-2 text-[15px] outline-none focus:border-neutral-900"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-[11px] font-semibold text-neutral-500">職業</label>
          <input
            type="text"
            value={job}
            placeholder="職業"
            onChange={(e) => onChange("job", e.target.value)}
            className="w-full rounded border border-neutral-300 px-2.5 py-2 text-[15px] outline-none focus:border-neutral-900"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-[11px] font-semibold text-neutral-500">
            ダメージボーナス（DB）
            <span className="ml-1 font-normal">※攻撃技能のダメージに加算されます</span>
          </label>
          {!customMode && db && (
            <div className="mb-1.5 inline-block rounded bg-neutral-900 px-2 text-xs font-bold text-white">{db}</div>
          )}
          <div className="flex gap-[3px] overflow-x-auto [scrollbar-width:none]">
            {DB_PRESETS.map((v) => (
              <button
                key={v}
                onClick={() => selectPreset(v)}
                className={`h-8 min-w-[42px] shrink-0 rounded border text-xs font-medium ${
                  !customMode && db === v
                    ? "border-neutral-900 bg-neutral-900 font-bold text-white"
                    : "border-neutral-400 bg-neutral-100"
                }`}
              >
                {v}
              </button>
            ))}
            {!customMode && (
              <button
                onClick={openCustom}
                className="h-8 min-w-[42px] shrink-0 rounded border border-dashed border-neutral-400 bg-white text-[11px] text-neutral-500"
              >
                自由記入
              </button>
            )}
          </div>
          {customMode && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                value={customVal}
                placeholder="例: +1d6+1, -1d2"
                onChange={(e) => setCustomVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmCustom()}
                className="flex-1 rounded border border-neutral-300 px-2 py-1.5 text-[13px] outline-none focus:border-neutral-900"
              />
              <button onClick={confirmCustom} className="shrink-0 rounded border border-neutral-900 bg-neutral-900 px-3 py-1.5 text-[13px] text-white">
                確定
              </button>
              <button
                onClick={() => {
                  setCustomMode(false);
                  setCustomVal("");
                }}
                className="shrink-0 rounded border border-neutral-400 bg-neutral-100 px-2.5 py-1.5 text-[13px]"
              >
                x
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
