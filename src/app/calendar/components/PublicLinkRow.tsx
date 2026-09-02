import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy, ExternalLink } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface PublicLinkRowProps {
  publicUrl: string;
  publicPath: string;
  disabled?: boolean;
  disabledHint?: string;
  className?: string;
}

const absoluteUrl = (publicUrl: string, publicPath: string): string =>
  publicUrl || `${window.location.origin}${publicPath}`;

export function PublicLinkRow({
  publicUrl,
  publicPath,
  disabled,
  disabledHint,
  className,
}: PublicLinkRowProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl(publicUrl, publicPath));
      setCopied(true);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  return (
    <div className={cn("rounded-lg border bg-muted/30 p-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium">Public link</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">{publicPath}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            Copy
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={absoluteUrl(publicUrl, publicPath)} target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5" />
              Open
            </a>
          </Button>
        </div>
      </div>
      {disabled && disabledHint && (
        <p className="mt-2 text-[11px] text-muted-foreground">{disabledHint}</p>
      )}
    </div>
  );
}
