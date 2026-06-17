"use client";

import { useState } from "react";
import type { StatKey } from "@/types/npc";
import { STAT_RANGE_6 } from "@/lib/coc/calc";

interface Props {
  stat: StatKey;
  selected: number | undefined;
  onSelect: (v: number | undefined) => void;
}

export function StatRow6({ stat, selected, onSelect }: Props) {
  const [customMode, setCustomMode] = useState(false);
  const [customVal, setCustomVal] = useState("");
  const range = STAT_RANGE_6(stat);

  const confirm = () => {
    const n = parseInt(customVal, 10);
    if (!isNaN(n)) {
      onSelect(n);
      setCustomMode(false);
      setCustomVal("");
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="w-[46px] shrink-0">
        <div className="text-[13px] font-bold">{stat}</div>
        {selected != null && (
          <div className="mt-px inline-block rounded bg-neutral-900 px-1 text-xs font-bold text-white">
            {selected}
          </div>
        )}
      </div>
      <div className="flex flex-1 gap-[3px] overflow-x-auto [scrollbar-width:none]">
        {range.map((n) => (
          <button
            key={n}
            onClick={() => onSelect(selected === n ? undefined : n)}
            className={`h-[30px] min-w-[30px] shrink-0 rounded border text-xs font-medium ${
              selected === n
                ? "border-neutral-900 bg-neutral-900 font-bold text-white"
                : "border-neutral-400 bg-neutral-100 text-neutral-900"
            }`}
          >
            {n}
          </button>
        ))}
        {!customMode ? (
          <button
            onClick={() => setCustomMode(true)}
            className="h-[30px] min-w-[30px] shrink-0 rounded border border-dashed border-neutral-400 bg-white text-[11px] text-neutral-500"
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
              onKeyDown={(e) => e.key === "Enter" && confirm()}
              className="h-[30px] w-11 rounded border border-neutral-900 text-center text-[13px] outline-none"
            />
            <button
              onClick={confirm}
              className="h-[30px] rounded border border-neutral-900 bg-neutral-900 px-2 text-xs text-white"
            >
              確定
            </button>
            <button
              onClick={() => {
                setCustomMode(false);
                setCustomVal("");
              }}
              className="h-[30px] rounded border border-neutral-400 bg-neutral-100 px-1.5 text-xs"
            >
              x
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
