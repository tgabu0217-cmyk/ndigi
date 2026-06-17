import type { Edition, NpcData, Overrides, StatKey } from "@/types/npc";
import { calcAutoInitiative, calcDerived, normalizeDB, skillFinalValue, STAT_ORDERS } from "./calc";

export function buildCocoforiaJSON(
  npc: NpcData,
  edition: Edition,
  overrides: Overrides,
  cmd: "CCB" | "CC" = "CCB",
  statOrderKey: "default" | "doujin" = "default",
  secretMode = false
): string {
  const derived = calcDerived(edition, npc.stats);
  const statOrder = STAT_ORDERS[statOrderKey];

  const sv = (s: StatKey) => String(npc.stats[s] ?? 0);
  const hp = overrides.hp !== null ? overrides.hp : derived.hp ?? 0;
  const mp = overrides.mp !== null ? overrides.mp : derived.mp ?? 0;
  const san = overrides.san !== null ? overrides.san : derived.san ?? 0;
  const autoIni = calcAutoInitiative(npc.stats);
  const initiative = overrides.initiative !== null ? overrides.initiative : autoIni ?? 0;

  const luck7 = edition === 7 ? npc.luck ?? 0 : 0;
  const idea6 = derived.idea ?? 0;
  const know6 = derived.know ?? 0;
  const luck6san = derived.san ?? 0;
  const dbStr = normalizeDB(npc.db);

  const activeSkills = npc.skills.filter((sk) => sk.name && skillFinalValue(sk) != null);

  const rollLines = (baseCmd: string, value: number, name: string): string[] => {
    const normal = `${baseCmd}<=${value} 【${name}】`;
    if (!secretMode) return [normal];
    const secret = `s${baseCmd}<=${value} 【${name}：シークレット】`;
    return [normal, secret];
  };

  const commandLines: string[] = [
    `${edition === 6 ? cmd : "CC"}<={SAN} 【正気度ロール】`,
    ...(edition === 6
      ? [
          ...rollLines(cmd, idea6, "アイデア"),
          ...rollLines(cmd, luck6san, "幸運"),
          ...rollLines(cmd, know6, "知識"),
        ]
      : [...rollLines("CC", luck7, "幸運")]),
    ...activeSkills.flatMap((sk) =>
      rollLines(edition === 6 ? cmd : "CC", skillFinalValue(sk)!, sk.name)
    ),
    ...activeSkills
      .filter((sk) => sk.isAttack && sk.damage && sk.damage.trim())
      .map((sk) => `${sk.damage.trim()}${dbStr} 【${sk.name}：ダメージ】`),
    ...statOrder.map((s) =>
      edition === 6 ? `${cmd}<={${s}}*5 【${s} × 5】` : `CC<={${s}} 【${s}】`
    ),
  ];

  const statusArr = [
    { label: "HP", value: hp, max: hp },
    { label: "MP", value: mp, max: mp },
    { label: "SAN", value: san, max: san },
  ];

  const paramsArr = [
    ...statOrder.map((s) => ({ label: s, value: sv(s) })),
    ...(edition === 6
      ? [
          { label: "アイデア", value: String(derived.idea ?? 0) },
          { label: "知識", value: String(derived.know ?? 0) },
        ]
      : [{ label: "幸運", value: String(npc.luck ?? 0) }]),
  ];

  return JSON.stringify({
    kind: "character",
    data: {
      name: npc.name || "名称不明",
      initiative,
      externalUrl: "",
      iconUrl: "",
      commands: commandLines.join("\n") + "\n",
      status: statusArr,
      params: paramsArr,
    },
  });
}
