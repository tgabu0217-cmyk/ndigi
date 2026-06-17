"use client";

import { useState } from "react";
import type { Skill } from "@/types/npc";
import { ONES, STEP10, STEP5, skillFinalValue } from "@/lib/coc/calc";
import { ScrollBtns } from "./ScrollBtns";

interface Props {
  skill: Skill;
  onUpdate: (patch: Partial<Skill>) => void;
  onRemove: () => void;
}

export function SkillRow({ skill, onUpdate, onRemove }: Props) {
  const [freeDraft, setFreeDraft] = useState("");
  const tensButtons = skill.step === 5 ? STEP5 : STEP10;
  const finalValue = skillFinalValue(skill);

  const handleTens = (n: number | null) =>
    onUpdate({ tens: n == null || skill.tens === n ? null : n, ones: null });
  const handleOnes = (n: number | null) =>
    onUpdate({ ones: n == null || skill.ones === n ? null : n });
  const handleStep = (v: 10 | 5 | "free") =>
    onUpdate({ step: v, tens: null, ones: null, freeVal: null });
  const confirmFree = () => {
    const n = parseInt(freeDraft, 10);
    if (!isNaN(n)) {
      onUpdate({ freeVal: n });
      setFreeDraft("");
    }
  };

  return (
    <div className="rounded border border-neutral-300 bg-neutral-100 p-2">
      <div className="mb-1.5 flex items-center gap-1.5">
        <div className="flex-1">
          <input
            type="text"
            value={skill.name}
            placeholder="技能名"
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-neutral-900"
          />
        </div>
        {finalValue != null && (
          <span className="min-w-[36px] shrink-0 rounded bg-neutral-900 px-2.5 py-0.5 text-center text-sm font-bold text-white">
            {finalValue}
          </span>
        )}
        <button
          onClick={onRemove}
          className="h-7 w-7 shrink-0 rounded border border-neutral-400 bg-neutral-100 text-sm text-neutral-500"
        >
          x
        </button>
      </div>

      <div className="mb-1.5 flex items-center gap-1.5">
        <label className="flex items-center gap-1.5 text-xs text-neutral-500">
          <input
            type="checkbox"
            checked={!!skill.isAttack}
            onChange={(e) => onUpdate({ isAttack: e.target.checked })}
            className="h-[15px] w-[15px]"
          />
          攻撃技能
        </label>
        {skill.isAttack && (
          <input
            type="text"
            value={skill.damage || ""}
            placeholder="例: 1d6"
            onChange={(e) => onUpdate({ damage: e.target.value })}
            className="flex-1 rounded border border-neutral-300 bg-white px-2 py-1 text-[13px] outline-none focus:border-neutral-900"
          />
        )}
      </div>

      <div className="mb-1.5 flex gap-1">
        {[
          { label: "10刻み", v: 10 as const },
          { label: "5刻み", v: 5 as const },
          { label: "自由値", v: "free" as const },
        ].map(({ label, v }) => (
          <button
            key={v}
            onClick={() => handleStep(v)}
            className={`flex-1 rounded border py-1 text-xs font-medium ${
              skill.step === v
                ? "border-neutral-900 bg-neutral-900 font-bold text-white"
                : "border-neutral-400 bg-neutral-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {skill.step === "free" ? (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            inputMode="numeric"
            value={freeDraft}
            placeholder="数値を入力"
            onChange={(e) => setFreeDraft(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && confirmFree()}
            className="w-[120px] rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-neutral-900"
          />
          <button onClick={confirmFree} className="shrink-0 rounded border border-neutral-900 bg-neutral-900 px-3.5 py-1.5 text-sm text-white">
            確定
          </button>
          {skill.freeVal != null && (
            <button
              onClick={() => onUpdate({ freeVal: null })}
              className="shrink-0 rounded border border-neutral-400 bg-neutral-100 px-2 py-1.5 text-xs text-neutral-500"
            >
              クリア
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={skill.step === 10 ? "mb-1" : ""}>
            <div className="mb-0.5 text-[10px] text-neutral-500">
              {skill.step === 5 ? "技能値" : "十の位"}
            </div>
            <ScrollBtns items={tensButtons} selected={skill.tens} onSelect={handleTens} />
          </div>
          {skill.step === 10 && (
            <div className={skill.tens != null ? "" : "opacity-35"}>
              <div className="mb-0.5 text-[10px] text-neutral-500">
                {skill.tens != null
                  ? `一の位（${skill.tens}+${skill.ones ?? "?"}=${finalValue ?? "?"}）`
                  : "一の位（十の位を先に選択）"}
              </div>
              <ScrollBtns
                items={ONES}
                selected={skill.ones}
                onSelect={skill.tens != null ? handleOnes : () => {}}
                btnW={30}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
