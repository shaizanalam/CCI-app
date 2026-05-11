import { useEffect, useState } from "react";
import { getSignedUrl } from "@/services/materials.service";
import { Watermark } from "./Watermark";
import { Loader2 } from "lucide-react";

interface Props {
  storagePath: string;
  fileType: "pdf" | "image";
  watermark: string;
}

export function ProtectedViewer({ storagePath, fileType, watermark }: Props) {
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
    <div className="relative h-[78vh] w-full overflow-hidden rounded-2xl bg-muted neo-inset">
      {!url && !error && (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing secure viewer…
        </div>
      )}
      {error && (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-destructive">
          {error}
        </div>
      )}
      {url && fileType === "pdf" && (
        <iframe
          title="PDF"
          // #toolbar=0 hides built-in download/print on most desktop chromium browsers (best-effort)
          src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
          className="absolute inset-0 h-full w-full"
        />
      )}
      {url && fileType === "image" && (
        <img
          src={url}
          alt="material"
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      )}
      <Watermark watermark={watermark} />
    </div>
  );
}
