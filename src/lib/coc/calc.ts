import type { Edition, NpcData, StatKey, Skill } from "@/types/npc";

export const STAT_ORDERS: Record<"default" | "doujin", StatKey[]> = {
  default: ["STR", "CON", "DEX", "INT", "POW", "SIZ", "APP", "EDU"],
  doujin: ["STR", "CON", "POW", "DEX", "APP", "SIZ", "INT", "EDU"],
};

export const STAT_RANGE_6 = (stat: StatKey): number[] =>
  stat === "EDU"
    ? Array.from({ length: 19 }, (_, i) => i + 3)
    : Array.from({ length: 16 }, (_, i) => i + 3);

export const STAT_TENS_7 = (stat: StatKey): number[] =>
  stat === "EDU"
    ? [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110]
    : [10, 20, 30, 40, 50, 60, 70, 80, 90];

export const LUCK_BTNS_7 = Array.from({ length: 16 }, (_, i) => (i + 3) * 5);
export const STEP10 = [10, 20, 30, 40, 50, 60, 70, 80, 90];
export const STEP5 = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95];
export const ONES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const DB_PRESETS = ["-2", "-1", "+0", "+1d4", "+1d6", "+2d6", "+3d6", "+4d6", "+5d6"];

export interface Derived {
  hp: number | null;
  mp: number | null;
  san: number | null;
  idea: number | null;
  know: number | null;
}

export function calcDerived6(stats: Partial<Record<StatKey, number>>): Derived {
  const { CON: con, SIZ: siz, POW: pow, INT: intStat, EDU: edu } = stats;
  return {
    hp: con != null && siz != null ? Math.ceil((siz + con) / 2) : null,
    mp: pow != null ? pow : null,
    san: pow != null ? pow * 5 : null,
    idea: intStat != null ? intStat * 5 : null,
    know: edu != null ? edu * 5 : null,
  };
}

export function calcDerived7(stats: Partial<Record<StatKey, number>>): Derived {
  const { CON: con, SIZ: siz, POW: pow } = stats;
  return {
    hp: con != null && siz != null ? Math.floor((siz + con) / 10) : null,
    mp: pow != null ? Math.round(pow / 5) : null,
    san: pow != null ? pow : null,
    idea: null,
    know: null,
  };
}

export function calcDerived(edition: Edition, stats: Partial<Record<StatKey, number>>): Derived {
  return edition === 6 ? calcDerived6(stats) : calcDerived7(stats);
}

// イニシアチブ自動計算（6版・7版とも DEX の素値そのまま）
export function calcAutoInitiative(stats: Partial<Record<StatKey, number>>): number | null {
  const dex = stats.DEX;
  if (dex == null) return null;
  return dex;
}

export function skillFinalValue(sk: Skill): number | null {
  if (sk.step === "free") return sk.freeVal ?? null;
  if (sk.tens == null) return null;
  if (sk.step === 5) return sk.tens;
  return sk.tens + (sk.ones ?? 0);
}

// DB文字列を正規化（"1d4"→"+1d4"、"-1"→"-1"、"+0"/"0"/""→""）
export function normalizeDB(db: string | null | undefined): string {
  const t = (db || "").trim();
  if (!t || t === "+0" || t === "0" || t === "-0") return "";
  if (t.startsWith("+") || t.startsWith("-")) return t;
  return "+" + t;
}

export function emptySkill(): Skill {
  return {
    id: `${Date.now()}_${Math.random()}`,
    name: "",
    step: 10,
    tens: null,
    ones: null,
    freeVal: null,
    isAttack: false,
    damage: "",
  };
}

export function emptyNpc(): NpcData {
  return { name: "", job: "", stats: {}, luck: null, skills: [], db: "" };
}
