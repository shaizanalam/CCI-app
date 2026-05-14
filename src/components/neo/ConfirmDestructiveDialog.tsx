import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NeoButton } from "@/components/neo/NeoButton";
import { cn } from "@/lib/utils";

interface ConfirmDestructiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDestructiveDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
}: ConfirmDestructiveDialogProps) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // Caller surfaces errors (e.g. toast); keep dialog open.
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <AlertDialogContent
        className={cn(
          "max-w-[min(100vw-2rem,26rem)] gap-4 rounded-3xl border-border/80 bg-card p-6 shadow-[var(--shadow-float-value)] sm:rounded-3xl",
        )}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-lg text-foreground">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-left text-sm leading-relaxed text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 flex-col gap-2 sm:flex-col sm:space-x-0">
          <NeoButton
            type="button"
            variant="danger"
            className="w-full min-h-[48px]"
            disabled={busy}
            onClick={() => void run()}
          >
            {busy ? "…" : confirmLabel}
          </NeoButton>
          <AlertDialogCancel asChild>
            <NeoButton type="button" variant="secondary" className="w-full min-h-[48px] border-border" disabled={busy}>
              {cancelLabel}
            </NeoButton>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
