"use client";

import type { Skill } from "@/types/npc";
import { SkillRow } from "./SkillRow";

interface Props {
  skills: Skill[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<Skill>) => void;
  onRemove: (index: number) => void;
}

export function SkillPanel({ skills, onAdd, onUpdate, onRemove }: Props) {
  return (
    <div className="border-b border-neutral-300 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-500">技能</span>
        <button
          onClick={onAdd}
          className="rounded border border-neutral-400 bg-neutral-100 px-3.5 py-1.5 text-[13px] font-bold"
        >
          + 技能を追加
        </button>
      </div>
      {skills.length === 0 && (
        <div className="rounded border border-dashed border-neutral-300 p-4 text-center text-[13px] text-neutral-500">
          技能を追加してください
        </div>
      )}
      <div className="flex flex-col gap-2">
        {skills.map((sk, i) => (
          <SkillRow key={sk.id} skill={sk} onUpdate={(patch) => onUpdate(i, patch)} onRemove={() => onRemove(i)} />
        ))}
      </div>
    </div>
  );
}
