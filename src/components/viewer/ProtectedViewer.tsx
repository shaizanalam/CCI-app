import { useEffect, useState } from "react";
import { getSignedUrl } from "@/services/materials.service";
import { Watermark } from "./Watermark";
import { BookOpen, ChevronLeft, ChevronRight, Loader2, Pencil, Search, X } from "lucide-react";

interface Props {
  storagePath: string;
  fileType: "pdf" | "image";
  watermark: string;
  title: string;
  onClose: () => void;
}

export function ProtectedViewer({ storagePath, fileType, watermark, title, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setUrl(null);
    setError(null);
    getSignedUrl(storagePath, 60 * 10)
      .then((u) => {
        if (alive) setUrl(u);
      })
      .catch((e) => {
        if (alive) setError(e.message ?? "Could not load file");
      });
    return () => {
      alive = false;
    };
  }, [storagePath]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-background via-background to-card">
      <header className="flex shrink-0 items-center gap-3 border-b border-border/60 bg-card/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          className="tap-highlight-none flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary transition hover:bg-primary/15"
          aria-label="Close and return"
          onClick={onClose}
        >
          <BookOpen className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center font-display text-base font-semibold text-foreground">
          {title}
        </h1>
        <button
          type="button"
          onClick={onClose}
          className="tap-highlight-none flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-background text-muted-foreground transition hover:text-foreground"
          aria-label="Close viewer"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="relative min-h-0 flex-1 p-3 sm:p-4">
        <div className="relative mx-auto flex h-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border/50 bg-card shadow-[var(--shadow-float-value)]">
          <div className="relative min-h-0 flex-1 overflow-hidden bg-muted/30">
            {!url && !error && (
              <div className="flex h-[65vh] min-h-[240px] items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Preparing secure viewer…
              </div>
            )}
            {error && (
              <div className="flex h-[65vh] min-h-[240px] items-center justify-center px-6 text-center text-sm text-destructive">
                {error}
              </div>
            )}
            {url && fileType === "pdf" && (
              <iframe
                title="PDF"
                src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
                className="absolute inset-0 h-full w-full bg-card"
              />
            )}
            {url && fileType === "image" && (
              <img
                src={url}
                alt="Study material"
                className="absolute inset-0 h-full w-full object-contain bg-card"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            )}
            <Watermark watermark={watermark} />
          </div>
        </div>
      </div>

      <footer className="flex shrink-0 justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
        <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/95 px-2 py-2 text-foreground shadow-[var(--shadow-float-value)] backdrop-blur-md">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-full opacity-40"
            aria-hidden
          >
            <ChevronLeft className="h-5 w-5" />
          </span>
          <div className="min-w-[8rem] border-x border-border/80 px-4 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Reading
            </p>
            <p className="text-xs font-semibold text-foreground">Secure view</p>
          </div>
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-full opacity-40"
            aria-hidden
          >
            <ChevronRight className="h-5 w-5" />
          </span>
          <div className="ml-1 flex items-center gap-0.5 border-l border-border/80 pl-2">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground"
              title="Find in document"
            >
              <Search className="h-4 w-4" />
            </span>
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground"
              title="Study mode"
            >
              <Pencil className="h-4 w-4" />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
