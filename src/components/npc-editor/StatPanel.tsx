"use client";

import type { NpcData, StatKey } from "@/types/npc";
import { LUCK_BTNS_7 } from "@/lib/coc/calc";
import { StatRow6 } from "./StatRow6";
import { StatRow7 } from "./StatRow7";
import { ScrollBtns } from "./ScrollBtns";

interface Props6 {
  edition: 6;
  stats: NpcData["stats"];
  statOrder: StatKey[];
  onChange: (stat: StatKey, v: number | undefined) => void;
}
interface Props7 {
  edition: 7;
  stats: NpcData["stats"];
  statOrder: StatKey[];
  luck: number | null;
  onChange: (stat: StatKey, v: number | null) => void;
  onLuckChange: (v: number | null) => void;
}

export function StatPanel({ ...props }: Props6 | Props7) {
  if (props.edition === 6) {
    return (
      <div className="border-b border-neutral-300 p-3">
        <div className="mb-2 text-xs font-bold text-neutral-500">能力値（6版）</div>
        <div className="flex flex-col gap-1.5">
          {props.statOrder.map((stat) => (
            <StatRow6
              key={stat}
              stat={stat}
              selected={props.stats[stat]}
              onSelect={(v) => props.onChange(stat, v)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-neutral-300 p-3">
      <div className="mb-2 text-xs font-bold text-neutral-500">能力値（7版・×5後の値）</div>
      <div className="flex flex-col gap-2.5">
        {props.statOrder.map((stat) => (
          <StatRow7
            key={stat}
            stat={stat}
            value={props.stats[stat]}
            onChange={(v) => props.onChange(stat, v)}
          />
        ))}
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <span className="min-w-[46px] text-[13px] font-bold">幸運</span>
            {props.luck != null ? (
              <span className="rounded bg-neutral-900 px-2 text-[13px] font-bold text-white">{props.luck}</span>
            ) : (
              <span className="text-xs text-neutral-500">未選択</span>
            )}
          </div>
          <ScrollBtns items={LUCK_BTNS_7} selected={props.luck} onSelect={props.onLuckChange} btnW={34} />
        </div>
      </div>
    </div>
  );
}
