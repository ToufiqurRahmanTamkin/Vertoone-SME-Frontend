import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FormListItem } from "@/types/domain/formBuilder";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { absoluteFormUrl, embedSnippet } from "../formBuilder.utils";

interface FormShareDialogProps {
  form: FormListItem | null;
  onOpenChange: (open: boolean) => void;
}

const copy = async (value: string, label: string) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Could not copy the ${label.toLowerCase()}`);
  }
};

export function FormShareDialog({ form, onOpenChange }: FormShareDialogProps) {
  const url = form ? absoluteFormUrl(form.publicUrl, form.publicPath) : "";
  const snippet = form ? embedSnippet(url, form.name) : "";
  const isLive = form?.status === "PUBLISHED";

  return (
    <Dialog open={Boolean(form)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Share “{form?.name ?? ""}”
            <Badge variant={isLive ? "default" : "secondary"}>{isLive ? "Live" : "Draft"}</Badge>
          </DialogTitle>
          <DialogDescription>
            {isLive
              ? "Anyone with this link can fill the form in. No sign-in needed."
              : "This form is still a draft. Publish it before you share the link — visitors will see a “not found” page until then."}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <Tabs defaultValue="link">
            <TabsList className="w-full">
              <TabsTrigger value="link" className="flex-1">
                Link
              </TabsTrigger>
              <TabsTrigger value="embed" className="flex-1">
                Embed
              </TabsTrigger>
              <TabsTrigger value="website" className="flex-1">
                On your website
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-3 pt-4">
              <Label htmlFor="share-link" className="text-xs font-medium text-muted-foreground">
                Public link
              </Label>
              <div className="flex gap-2">
                <Input id="share-link" readOnly value={url} className="font-mono text-xs" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => void copy(url, "Link")}
                  aria-label="Copy link"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Send it in an email, put it in a QR code, or post it anywhere you like.
              </p>
            </TabsContent>

            <TabsContent value="embed" className="space-y-3 pt-4">
              <Label htmlFor="share-embed" className="text-xs font-medium text-muted-foreground">
                Embed code
              </Label>
              <textarea
                id="share-embed"
                readOnly
                value={snippet}
                rows={4}
                className="w-full rounded-md border bg-muted/30 px-3 py-2 font-mono text-[11px] leading-relaxed outline-none"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void copy(snippet, "Embed code")}
              >
                <Copy className="size-4" />
                Copy embed code
              </Button>
              <p className="text-[11px] text-muted-foreground">
                Paste this into any website that accepts HTML. The form keeps its own styling
                inside the frame.
              </p>
            </TabsContent>

            <TabsContent value="website" className="space-y-3 pt-4">
              <p className="text-sm">
                On a site you built in the Web Builder, you do not need embed code at all.
              </p>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
                <li>Open the page you want the form on in the Web Builder.</li>
                <li>
                  Add a <span className="font-medium text-foreground">Form</span> section from the
                  Sections library.
                </li>
                <li>
                  Pick “{form?.name ?? "this form"}” in the section’s settings, then publish the
                  page.
                </li>
              </ol>
              <p className="text-[11px] text-muted-foreground">
                Forms placed this way inherit your site’s colours and fonts, and submissions land
                here alongside the rest.
              </p>
            </TabsContent>
          </Tabs>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            type="button"
            disabled={!isLive}
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="size-4" />
            Open form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
