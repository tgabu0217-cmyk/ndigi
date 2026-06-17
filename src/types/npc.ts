export type Edition = 6 | 7;

export type StatKey = "STR" | "CON" | "DEX" | "INT" | "POW" | "SIZ" | "APP" | "EDU";

export type StatOrderKey = "default" | "doujin";

export interface Skill {
  id: string;
  name: string;
  step: 10 | 5 | "free";
  tens: number | null;
  ones: number | null;
  freeVal: number | null;
  isAttack: boolean;
  damage: string;
}

export interface Overrides {
  hp: number | null;
  mp: number | null;
  san: number | null;
  idea: number | null;
  know: number | null;
  initiative: number | null;
}

export interface NpcData {
  name: string;
  job: string;
  stats: Partial<Record<StatKey, number>>;
  luck: number | null;
  skills: Skill[];
  db: string;
}

export interface SavedNpcPayload {
  edition: Edition;
  npc: NpcData;
  overrides: Overrides;
  statOrderKey: StatOrderKey;
  cmd: "CCB" | "CC";
  secretMode: boolean;
}

// Supabase の npcs テーブル行
export interface NpcRow {
  id: string;
  user_id: string;
  name: string;
  job: string | null;
  edition: Edition;
  data: SavedNpcPayload;
  created_at: string;
  updated_at: string;
}
