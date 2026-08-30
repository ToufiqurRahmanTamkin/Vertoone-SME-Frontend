import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ShopSettings } from "@/types/domain/shop";
import { Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ShopLinkCardProps {
  shop: ShopSettings;
  canEdit: boolean;
  isSaving: boolean;
  onPublishChange: (isPublished: boolean) => void;
  onAcceptingChange: (acceptsOrders: boolean) => void;
}

export function ShopLinkCard({
  shop,
  canEdit,
  isSaving,
  onPublishChange,
  onAcceptingChange,
}: ShopLinkCardProps) {
  const openPublicShop = () => {
    window.open(`/shop/${shop.slug}`, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shop.publicUrl);
      toast.success("Shop link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">Your public shop</h2>
            <Badge variant={shop.isPublished ? "default" : "secondary"}>
              {shop.isPublished ? "Live" : "Not published"}
            </Badge>
            {shop.isPublished && !shop.acceptsOrders && (
              <Badge variant="secondary">Orders paused</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {shop.isPublished
              ? "Anyone with this link can browse your products and place an order."
              : "Publish the shop to give customers a link they can order from."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy link
          </Button>
          <Button size="sm" onClick={openPublicShop} disabled={!shop.isPublished}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Launch public shop
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Input readOnly value={shop.publicUrl} className="font-mono text-xs" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <div className="min-w-0">
            <Label htmlFor="shop-published" className="text-sm">
              Shop is published
            </Label>
            <p className="text-xs text-muted-foreground">
              Turning this off takes the public page offline immediately.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            <Switch
              id="shop-published"
              checked={shop.isPublished}
              onCheckedChange={onPublishChange}
              disabled={!canEdit || isSaving}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <div className="min-w-0">
            <Label htmlFor="shop-accepting" className="text-sm">
              Accepting orders
            </Label>
            <p className="text-xs text-muted-foreground">
              Pause this to keep the shop visible but stop new orders.
            </p>
          </div>
          <Switch
            id="shop-accepting"
            checked={shop.acceptsOrders}
            onCheckedChange={onAcceptingChange}
            disabled={!canEdit || isSaving}
          />
        </div>
      </div>
    </div>
  );
}
