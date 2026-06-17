"use client";

import type { Edition, NpcData, Overrides } from "@/types/npc";
import { calcAutoInitiative, calcDerived } from "@/lib/coc/calc";
import { OverrideField } from "./OverrideField";

interface Props {
  edition: Edition;
  stats: NpcData["stats"];
  overrides: Overrides;
  onOverride: (key: keyof Overrides, v: number | null) => void;
}

export function DerivedPanel({ edition, stats, overrides, onOverride }: Props) {
  const derived = calcDerived(edition, stats);
  const autoIni = calcAutoInitiative(stats);

  const fields6 = [
    { key: "hp" as const, label: "HP", formula: "ceil((SIZ+CON)÷2)" },
    { key: "mp" as const, label: "MP", formula: "POWと同値" },
    { key: "san" as const, label: "正気度", formula: "POW×5" },
    { key: "idea" as const, label: "アイデア", formula: "INT×5" },
    { key: "know" as const, label: "知識", formula: "EDU×5" },
  ];
  const fields7 = [
    { key: "hp" as const, label: "HP", formula: "floor((SIZ+CON)÷10)" },
    { key: "mp" as const, label: "MP", formula: "POW÷5" },
    { key: "san" as const, label: "正気度", formula: "POWと同値" },
  ];
  const fields = edition === 6 ? fields6 : fields7;

  return (
    <div className="border-b border-neutral-300 p-3">
      <div className="mb-2 text-xs font-bold text-neutral-500">自動計算値</div>
      <div className="mb-2.5 flex items-center gap-3 rounded border border-neutral-300 bg-neutral-100 px-3 py-2">
        <div className="flex-1">
          <div className="mb-1 text-[11px] text-neutral-500">
            イニシアチブ
            <span className="ml-1.5 text-[10px]">（DEX値）</span>
            {overrides.initiative !== null && <span className="ml-1 text-[10px] text-neutral-400">【上書き中】</span>}
          </div>
          <OverrideField
            label="イニシアチブ"
            compact
            autoVal={autoIni}
            override={overrides.initiative}
            onOverride={(v) => onOverride("initiative", v)}
          />
        </div>
        {autoIni == null && <div className="text-xs text-neutral-500">DEXを設定すると自動入力</div>}
      </div>
      <div className="flex flex-wrap gap-2.5">
        {fields.map((f) => (
          <OverrideField
            key={f.key}
            label={f.label}
            formula={f.formula}
            autoVal={derived[f.key]}
            override={overrides[f.key]}
            onOverride={(v) => onOverride(f.key, v)}
          />
        ))}
      </div>
    </div>
  );
}
