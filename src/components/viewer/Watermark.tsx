import { useEffect, useRef } from "react";

interface Props {
  watermark: string;
}

/**
 * Renders a diagonally repeated watermark overlay on top of any positioned parent.
 * Uses pointer-events: none so it never blocks scrolling/zoom of the underlying content.
 */
export function Watermark({ watermark }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // best-effort: attempt to deter screen capture API usage / right-click
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
          "repeating-linear-gradient(-30deg, transparent 0 120px, rgba(31,41,55,0.06) 120px 121px)",
      }}
    >
      <div className="absolute inset-0 flex flex-wrap content-around justify-around opacity-30">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="rotate-[-30deg] whitespace-nowrap text-xs font-semibold text-foreground/40"
            style={{ width: "33%", textAlign: "center", padding: "32px 0" }}
          >
            {watermark}
          </span>
        ))}
      </div>
    </div>
  );
}
