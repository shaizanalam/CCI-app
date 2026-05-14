import { useEffect, useRef } from "react";

interface Props {
  watermark: string;
}

/**
 * Diagonally repeated watermark overlay. pointer-events: none so scrolling/zoom still work.
 */
export function Watermark({ watermark }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("contextmenu", block);
    return () => el.removeEventListener("contextmenu", block);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none overflow-hidden"
      style={{
        background:
          "repeating-linear-gradient(-28deg, transparent 0 140px, rgba(91, 91, 214, 0.04) 140px 141px)",
      }}
    >
      <div className="absolute inset-0 flex flex-wrap content-around justify-around opacity-[0.22]">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="rotate-[-28deg] whitespace-nowrap text-[11px] font-semibold tracking-wide text-primary/50"
            style={{ width: "32%", textAlign: "center", padding: "36px 0" }}
          >
            {watermark}
          </span>
        ))}
      </div>
    </div>
  );
}
