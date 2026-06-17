"use client";

interface ScrollBtnsProps {
  items: number[];
  selected: number | null;
  onSelect: (n: number | null) => void;
  btnW?: number;
}

export function ScrollBtns({ items, selected, onSelect, btnW = 34 }: ScrollBtnsProps) {
  return (
    <div className="flex gap-[3px] overflow-x-auto [scrollbar-width:none]">
      {items.map((n) => (
        <button
          key={n}
          onClick={() => onSelect(selected === n ? null : n)}
          style={{ minWidth: btnW }}
          className={`h-8 shrink-0 rounded border text-xs font-medium transition-colors ${
            selected === n
              ? "border-neutral-900 bg-neutral-900 text-white font-bold"
              : "border-neutral-400 bg-neutral-100 text-neutral-900"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
