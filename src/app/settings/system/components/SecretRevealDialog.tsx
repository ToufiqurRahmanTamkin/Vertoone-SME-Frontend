import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Check, Copy } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface SecretRevealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  secret: string;
}

export function SecretRevealDialog({
  open,
  onOpenChange,
  title,
  description,
  secret,
}: SecretRevealDialogProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
    } catch {
      toast.error("Could not copy — select the text and copy it manually");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-3">
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              This is the only time you will see it. Copy it somewhere safe before closing.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
            <code className="min-w-0 flex-1 break-all font-mono text-xs">{secret}</code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 cursor-pointer"
              onClick={() => void copy()}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button type="button" className="cursor-pointer" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
