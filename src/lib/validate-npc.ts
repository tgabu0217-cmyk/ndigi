import type { SavedNpcPayload } from "@/types/npc";

export const LIMITS = {
  NAME_MAX: 100,
  JOB_MAX: 100,
  DB_MAX: 50,
  SKILL_NAME_MAX: 50,
  SKILL_DAMAGE_MAX: 30,
  MAX_SKILLS: 200,
  // JSON文字列化した全体のバイト数上限（雑に十分大きいが無限ではない値）
  PAYLOAD_MAX_BYTES: 200_000,
} as const;

export function validateNpcPayload(body: unknown): { ok: true; payload: SavedNpcPayload; name: string; job: string; edition: 6 | 7 } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "不正なリクエストです" };
  }

  const { name, job, edition, data } = body as {
    name?: string;
    job?: string;
    edition?: number;
    data?: unknown;
  };

  if (edition !== 6 && edition !== 7) {
    return { ok: false, error: "版（edition）が不正です" };
  }
  if (!data || typeof data !== "object") {
    return { ok: false, error: "データが不足しています" };
  }

  const payload = data as SavedNpcPayload;

  if (!payload.npc || typeof payload.npc !== "object") {
    return { ok: false, error: "NPCデータが不正です" };
  }

  const trimmedName = (name || payload.npc.name || "名称未設定").toString().slice(0, LIMITS.NAME_MAX);
  const trimmedJob = (job || payload.npc.job || "").toString().slice(0, LIMITS.JOB_MAX);

  if (Array.isArray(payload.npc.skills)) {
    if (payload.npc.skills.length > LIMITS.MAX_SKILLS) {
      return { ok: false, error: `技能の登録数が多すぎます（上限${LIMITS.MAX_SKILLS}件）` };
    }
    for (const sk of payload.npc.skills) {
      if (typeof sk?.name === "string" && sk.name.length > LIMITS.SKILL_NAME_MAX) {
        return { ok: false, error: `技能名は${LIMITS.SKILL_NAME_MAX}文字以内にしてください` };
      }
      if (typeof sk?.damage === "string" && sk.damage.length > LIMITS.SKILL_DAMAGE_MAX) {
        return { ok: false, error: `ダメージの入力は${LIMITS.SKILL_DAMAGE_MAX}文字以内にしてください` };
      }
    }
  }

  if (typeof payload.npc.db === "string" && payload.npc.db.length > LIMITS.DB_MAX) {
    return { ok: false, error: `ダメージボーナスは${LIMITS.DB_MAX}文字以内にしてください` };
  }

  const byteLength = Buffer.byteLength(JSON.stringify(payload), "utf8");
  if (byteLength > LIMITS.PAYLOAD_MAX_BYTES) {
    return { ok: false, error: "データサイズが大きすぎます" };
  }

  return { ok: true, payload, name: trimmedName, job: trimmedJob, edition };
}
