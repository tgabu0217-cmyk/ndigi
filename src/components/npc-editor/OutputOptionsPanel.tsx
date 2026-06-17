"use client";

interface Props {
  secretMode: boolean;
  onChange: (v: boolean) => void;
}

export function OutputOptionsPanel({ secretMode, onChange }: Props) {
  return (
    <div className="border-b border-neutral-300 p-3">
      <div className="mb-2 text-xs font-bold text-neutral-500">出力オプション</div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold">シークレットダイス（技能ロール）</div>
          <div className="mt-0.5 text-[11px] text-neutral-500">
            ONにすると各技能ロールが通常版【○○】とシークレット版【○○：シークレット】の2行で出力されます
          </div>
        </div>
        <button
          onClick={() => onChange(!secretMode)}
          className={`relative h-7 w-[52px] shrink-0 rounded-full border ${
            secretMode ? "border-neutral-900 bg-neutral-900" : "border-neutral-400 bg-neutral-100"
          }`}
        >
          <div
            className={`absolute top-0.5 h-[22px] w-[22px] rounded-full transition-all ${
              secretMode ? "left-[26px] bg-white" : "left-0.5 bg-neutral-500"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
