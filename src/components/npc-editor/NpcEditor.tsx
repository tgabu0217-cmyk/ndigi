"use client";

import { useCallback, useState } from "react";
import type { Edition, NpcData, Overrides, SavedNpcPayload, StatKey, StatOrderKey } from "@/types/npc";
import { emptyNpc, emptySkill, STAT_ORDERS } from "@/lib/coc/calc";
import { buildCocoforiaJSON } from "@/lib/coc/cocofolia";
import { EditorHeader } from "./EditorHeader";
import { BasicInfo } from "./BasicInfo";
import { StatOrderPanel } from "./StatOrderPanel";
import { OutputOptionsPanel } from "./OutputOptionsPanel";
import { DerivedPanel } from "./DerivedPanel";
import { StatPanel } from "./StatPanel";
import { SkillPanel } from "./SkillPanel";
import { CopyBar } from "./CopyBar";
import { NpcSheet } from "./NpcSheet";

const EMPTY_OVR: Overrides = { hp: null, mp: null, san: null, idea: null, know: null, initiative: null };

interface Props {
  isLoggedIn: boolean;
  npcId?: string; // 既存NPCを編集中の場合に渡す
  initialPayload?: SavedNpcPayload;
  onSaved?: (id: string) => void;
}

export function NpcEditor({ isLoggedIn, npcId, initialPayload, onSaved }: Props) {
  const [edition, setEditionRaw] = useState<Edition>(initialPayload?.edition ?? 6);
  const [npc, setNpcRaw] = useState<NpcData>(initialPayload?.npc ?? emptyNpc());
  const [overrides, setOverridesRaw] = useState<Overrides>(initialPayload?.overrides ?? EMPTY_OVR);
  const [cmd, setCmdRaw] = useState<"CCB" | "CC">(initialPayload?.cmd ?? "CCB");
  const [statOrderKey, setStatOrderKeyRaw] = useState<StatOrderKey>(initialPayload?.statOrderKey ?? "default");
  const [secretMode, setSecretModeRaw] = useState(initialPayload?.secretMode ?? false);

  const [showSheet, setShowSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const statOrder = STAT_ORDERS[statOrderKey];

  // 内容が変更されたら「保存済み」表示を解除するラッパー群
  const setEdition: typeof setEditionRaw = (v) => {
    setSaved(false);
    setEditionRaw(v);
  };
  const setNpc: typeof setNpcRaw = (v) => {
    setSaved(false);
    setNpcRaw(v);
  };
  const setOverrides: typeof setOverridesRaw = (v) => {
    setSaved(false);
    setOverridesRaw(v);
  };
  const setCmd: typeof setCmdRaw = (v) => {
    setSaved(false);
    setCmdRaw(v);
  };
  const setStatOrderKey: typeof setStatOrderKeyRaw = (v) => {
    setSaved(false);
    setStatOrderKeyRaw(v);
  };
  const setSecretMode: typeof setSecretModeRaw = (v) => {
    setSaved(false);
    setSecretModeRaw(v);
  };

  const handleEditionChange = (v: Edition) => {
    if (v === edition) return;
    setEdition(v);
    setNpc((prev) => ({ ...prev, stats: {}, luck: null }));
    setOverrides(EMPTY_OVR);
  };

  const handleStatChange = (stat: StatKey, value: number | null | undefined) => {
    setNpc((prev) => ({ ...prev, stats: { ...prev.stats, [stat]: value ?? undefined } }));
    setOverrides((prev) => ({ ...prev, hp: null, mp: null, san: null, idea: null, know: null }));
  };

  const handleAddSkill = () => setNpc((prev) => ({ ...prev, skills: [...prev.skills, emptySkill()] }));
  const handleUpdateSkill = (i: number, patch: Partial<NpcData["skills"][number]>) =>
    setNpc((prev) => ({ ...prev, skills: prev.skills.map((sk, idx) => (idx === i ? { ...sk, ...patch } : sk)) }));
  const handleRemoveSkill = (i: number) =>
    setNpc((prev) => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }));

  const handleReset = () => {
    if (window.confirm("リセットしますか？")) {
      setNpc(emptyNpc());
      setOverrides(EMPTY_OVR);
    }
  };

  const handleSaveJSONFile = () => {
    const blob = new Blob(
      [JSON.stringify({ edition, npc, overrides, statOrderKey, cmd, secretMode }, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${npc.name || "npc"}_coc.json`;
    a.click();
  };

  const effectiveCmd = edition === 6 ? cmd : "CC";

  const handleCopy = useCallback(async () => {
    const text = buildCocoforiaJSON(npc, edition, overrides, effectiveCmd, statOrderKey, secretMode);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [npc, edition, overrides, effectiveCmd, statOrderKey, secretMode]);

  const handleSaveToCloud = useCallback(async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const payload: SavedNpcPayload = { edition, npc, overrides, statOrderKey, cmd, secretMode };
      const res = await fetch(npcId ? `/api/npcs/${npcId}` : "/api/npcs", {
        method: npcId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: npc.name || "名称未設定",
          job: npc.job,
          edition,
          data: payload,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "保存に失敗しました");
      }
      const body = await res.json();
      setSaved(true);
      if (!npcId && body.id && onSaved) onSaved(body.id);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }, [npc, edition, overrides, statOrderKey, cmd, secretMode, npcId, onSaved]);

  return (
    <div className="mx-auto min-h-screen max-w-[600px] bg-white">
      <EditorHeader edition={edition} onEditionChange={handleEditionChange} cmd={cmd} onCmdChange={setCmd} onSaveJSON={handleSaveJSONFile} />
      <BasicInfo
        name={npc.name}
        job={npc.job}
        db={npc.db}
        onChange={(f, v) => setNpc((p) => ({ ...p, [f]: v }))}
      />
      <StatOrderPanel statOrderKey={statOrderKey} onChange={setStatOrderKey} />
      <OutputOptionsPanel secretMode={secretMode} onChange={setSecretMode} />
      <DerivedPanel
        edition={edition}
        stats={npc.stats}
        overrides={overrides}
        onOverride={(k, v) => setOverrides((p) => ({ ...p, [k]: v }))}
      />
      {edition === 6 ? (
        <StatPanel edition={6} stats={npc.stats} statOrder={statOrder} onChange={handleStatChange} />
      ) : (
        <StatPanel
          edition={7}
          stats={npc.stats}
          statOrder={statOrder}
          luck={npc.luck}
          onChange={handleStatChange}
          onLuckChange={(v) => setNpc((p) => ({ ...p, luck: v }))}
        />
      )}
      <SkillPanel skills={npc.skills} onAdd={handleAddSkill} onUpdate={handleUpdateSkill} onRemove={handleRemoveSkill} />

      {errorMsg && <div className="border-b border-red-300 bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>}
      {!isLoggedIn && (
        <div className="border-b border-neutral-300 bg-neutral-50 p-3 text-xs text-neutral-500">
          ログインするとNPCをクラウドに保存し、マイページから読み込めるようになります。
        </div>
      )}

      <div className="h-[88px]" />
      <CopyBar
        onReset={handleReset}
        onShowSheet={() => setShowSheet(true)}
        onCopy={handleCopy}
        copied={copied}
        onSave={handleSaveToCloud}
        saving={saving}
        saved={saved}
        isLoggedIn={isLoggedIn}
      />
      {showSheet && (
        <NpcSheet
          npc={npc}
          edition={edition}
          overrides={overrides}
          statOrder={statOrder}
          onClose={() => setShowSheet(false)}
          onCopy={handleCopy}
          copied={copied}
        />
      )}
    </div>
  );
}
