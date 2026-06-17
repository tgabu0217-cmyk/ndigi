"use client";

import { useState } from "react";
import type { StatKey } from "@/types/npc";
import { ONES, STAT_TENS_7 } from "@/lib/coc/calc";
import { ScrollBtns } from "./ScrollBtns";

interface Props {
  stat: StatKey;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
}

export function StatRow7({ stat, value, onChange }: Props) {
  const [customMode, setCustomMode] = useState(false);
  const [customVal, setCustomVal] = useState("");
  const tens = value != null ? Math.floor(value / 10) * 10 : null;
  const ones = value != null ? value % 10 : null;
  const tensRange = STAT_TENS_7(stat);

  const handleTens = (n: number | null) => {
    if (n == null || tens === n) {
      onChange(null);
      return;
    }
    onChange(n + (ones ?? 0));
  };
  const handleOnes = (n: number | null) => {
    if (tens == null) return;
    if (n == null) return;
    onChange(tens + (ones === n ? 0 : n));
  };
  const confirmCustom = () => {
    const n = parseInt(customVal, 10);
    if (!isNaN(n)) {
      onChange(n);
      setCustomMode(false);
      setCustomVal("");
    }
  };

  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <span className="min-w-[46px] text-[13px] font-bold">{stat}</span>
        {value != null ? (
          <span className="rounded bg-neutral-900 px-2 text-[13px] font-bold text-white">{value}</span>
        ) : (
          <span className="text-xs text-neutral-500">未選択</span>
        )}
      </div>
      <div className="mb-0.5">
        <div className="mb-0.5 text-[10px] text-neutral-500">十の位</div>
        <div className="flex gap-[3px] overflow-x-auto [scrollbar-width:none]">
          <ScrollBtns items={tensRange} selected={tens} onSelect={handleTens} btnW={36} />
          {!customMode ? (
            <button
              onClick={() => setCustomMode(true)}
              className="h-8 min-w-[34px] shrink-0 rounded border border-dashed border-neutral-400 bg-white text-[11px] text-neutral-500"
            >
              他
            </button>
          ) : (
            <div className="flex shrink-0 gap-0.5">
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={customVal}
                onChange={(e) => setCustomVal(e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && confirmCustom()}
                className="h-8 w-[50px] rounded border border-neutral-900 text-center text-[13px] outline-none"
              />
              <button onClick={confirmCustom} className="h-8 rounded border border-neutral-900 bg-neutral-900 px-2 text-xs text-white">
                確定
              </button>
              <button
                onClick={() => {
                  setCustomMode(false);
                  setCustomVal("");
                }}
                className="h-8 rounded border border-neutral-400 bg-neutral-100 px-1.5 text-xs"
              >
                x
              </button>
            </div>
          )}
        </div>
      </div>
      <div className={tens != null ? "" : "opacity-35"}>
        <div className="mb-0.5 text-[10px] text-neutral-500">
          {tens != null ? `一の位（${tens}+${ones ?? "?"}=${value ?? "?"}）` : "一の位（十の位を先に）"}
        </div>
        <ScrollBtns items={ONES} selected={ones} onSelect={tens != null ? handleOnes : () => {}} btnW={30} />
      </div>
    </div>
  );
}
