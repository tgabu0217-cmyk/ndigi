"use client";

import type { Edition, NpcData, Overrides, StatKey } from "@/types/npc";
import { calcDerived, normalizeDB, skillFinalValue } from "@/lib/coc/calc";

interface Props {
  npc: NpcData;
  edition: Edition;
  overrides: Overrides;
  statOrder: StatKey[];
  onClose: () => void;
  onCopy: () => void;
  copied: boolean;
}

export function NpcSheet({ npc, edition, overrides, statOrder, onClose, onCopy, copied }: Props) {
  const derived = calcDerived(edition, npc.stats);
  const hp = overrides.hp !== null ? overrides.hp : derived.hp ?? 0;
  const mp = overrides.mp !== null ? overrides.mp : derived.mp ?? 0;
  const san = overrides.san !== null ? overrides.san : derived.san ?? 0;

  const activeSkills = npc.skills.filter((sk) => sk.name && skillFinalValue(sk) != null);

  return (
    <div className="fixed inset-0 z-[300] overflow-y-auto bg-black/55">
      <div className="mx-auto min-h-full max-w-[600px] bg-white pb-20">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-300 bg-white p-3">
          <span className="text-sm font-bold">NPCシート</span>
          <button onClick={onClose} className="rounded border border-neutral-400 bg-neutral-100 px-3.5 py-1.5 text-[13px]">
            ← 編集に戻る
          </button>
        </div>

        <div className="p-3">
          <div className="mb-3.5">
            <div className="mb-0.5 text-xl font-bold">{npc.name || <span className="text-neutral-500">名称未設定</span>}</div>
            {npc.job && <div className="text-[13px] text-neutral-500">{npc.job}</div>}
            <div className="mt-0.5 text-[11px] text-neutral-500">{edition}版</div>
          </div>

          <div className="mb-3.5 flex flex-wrap gap-2">
            <Cell label="HP" value={hp} />
            <Cell label="MP" value={mp} />
            <Cell label="SAN" value={san} />
            {edition === 6 && derived.idea != null && <Cell label="アイデア" value={derived.idea} />}
            {edition === 6 && derived.know != null && <Cell label="知識" value={derived.know} />}
            {edition === 7 && npc.luck != null && <Cell label="幸運" value={npc.luck} />}
          </div>

          <div className="mb-3.5">
            <div className="mb-1.5 text-xs font-bold text-neutral-500">能力値</div>
            <div className="grid grid-cols-4 gap-1.5">
              {statOrder.map((s) => (
                <div key={s} className="rounded border border-neutral-300 bg-neutral-100 px-2 py-1.5 text-center">
                  <div className="text-[10px] text-neutral-500">{s}</div>
                  <div className={`text-lg font-bold ${npc.stats[s] != null ? "" : "text-neutral-500"}`}>
                    {npc.stats[s] != null ? String(npc.stats[s]) : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {npc.db && npc.db.trim() && (
            <div className="mb-3.5 text-xs text-neutral-500">
              ダメージボーナス（DB）: <span className="font-bold text-black">{normalizeDB(npc.db)}</span>
            </div>
          )}

          <div>
            <div className="mb-1.5 text-xs font-bold text-neutral-500">技能（{activeSkills.length}件）</div>
            {activeSkills.length === 0 ? (
              <div className="py-3 text-[13px] text-neutral-500">技能が割り振られていません</div>
            ) : (
              <div className="grid grid-cols-2 gap-x-2.5 gap-y-[3px]">
                {activeSkills.map((sk) => (
                  <div key={sk.id} className="flex flex-col border-b border-neutral-300 py-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px]">{sk.name || "（未設定）"}</span>
                      <span className="min-w-[34px] rounded bg-neutral-900 px-2 text-center text-sm font-bold text-white">
                        {skillFinalValue(sk)}
                      </span>
                    </div>
                    {sk.isAttack && sk.damage && sk.damage.trim() && (
                      <div className="mt-0.5 text-[11px] text-neutral-500">
                        ダメージ: {sk.damage.trim()}
                        {normalizeDB(npc.db)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-[310] mx-auto flex max-w-[600px] gap-2 border-t border-neutral-300 bg-white p-3">
          <button onClick={onClose} className="shrink-0 rounded border border-neutral-400 bg-neutral-100 px-3.5 py-2.5 text-[13px]">
            ← 戻る
          </button>
          <button
            onClick={onCopy}
            className={`flex-1 rounded text-sm font-bold text-white ${copied ? "bg-green-700" : "bg-neutral-900"}`}
          >
            {copied ? "コピー完了 ✓" : "ココフォリアへコピー"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-[60px] rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-center">
      <div className="mb-0.5 text-[10px] text-neutral-500">{label}</div>
      <div className="text-xl font-bold leading-none">{value}</div>
    </div>
  );
}
