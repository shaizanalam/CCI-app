import { useId } from "react";
import { toast } from "sonner";
import { FileText, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadPickerProps {
  file: File | null;
  onChange: (file: File | null) => void;
  maxBytes?: number;
  className?: string;
}

export function FileUploadPicker({
  file,
  onChange,
  maxBytes = 25 * 1024 * 1024,
  className,
}: FileUploadPickerProps) {
  const pdfId = useId();
  const imageId = useId();

  const pick = (next: File | null) => {
    if (next && next.size > maxBytes) {
      toast.error(`File exceeds ${maxBytes / (1024 * 1024)}MB limit`);
      return;
    }
    onChange(next);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "rounded-3xl border-2 border-dashed border-primary/35 bg-primary/[0.06] px-4 py-8 text-center transition-colors duration-300",
          file && "border-primary/50 bg-primary/10",
        )}
      >
        {file ? (
          <div className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-md">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <p className="max-w-full truncate px-2 font-semibold text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(2)} MB · Tap a button below to replace
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Choose a file type</p>
            <p className="text-sm text-muted-foreground">
              PDF or image · Maximum {maxBytes / (1024 * 1024)}MB
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label
          htmlFor={pdfId}
          className="tap-highlight-none neo-pressable flex min-h-[52px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card px-3 py-4 text-center shadow-[var(--shadow-float-sm-value)] transition hover:border-primary/40"
        >
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-sm font-semibold text-foreground">PDF</span>
        </label>
        <input
          id={pdfId}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(e) => {
            pick(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
        <label
          htmlFor={imageId}
          className="tap-highlight-none neo-pressable flex min-h-[52px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card px-3 py-4 text-center shadow-[var(--shadow-float-sm-value)] transition hover:border-primary/40"
        >
          <ImageIcon className="h-6 w-6 text-primary" />
          <span className="text-sm font-semibold text-foreground">Image</span>
        </label>
        <input
          id={imageId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          className="sr-only"
          onChange={(e) => {
            pick(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
