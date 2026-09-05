import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import {
  useGetShopSettingsQuery,
  useGetShopSummaryQuery,
  useUpdateShopSettingsMutation,
} from "@/redux/apis/shopApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ShopLinkCard } from "./components/ShopLinkCard";
import { ShopSettingsForm } from "./components/ShopSettingsForm";

export default function ShopPage() {
  const access = useModulePermission("/sme/online-shop");

  const { data: shop, isLoading } = useGetShopSettingsQuery();
  const { data: summary } = useGetShopSummaryQuery();
  const currency = summary?.currency ?? "BDT";
  const [updateShop, { isLoading: isSaving }] = useUpdateShopSettingsMutation();

  const save = async (patch: { isPublished?: boolean; acceptsOrders?: boolean }) => {
    try {
      await updateShop(patch).unwrap();
      toast.success(
        patch.isPublished === true
          ? "Your shop is live"
          : patch.isPublished === false
            ? "Your shop is offline"
            : patch.acceptsOrders
              ? "Now accepting orders"
              : "Orders paused"
      );
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update the shop");
    }
  };

  if (isLoading || !shop) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Shop"
        description="Your online storefront. List products, share the link and orders land in your sales pipeline."
        actions={<CurrencyNote currency={currency} />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Listed products</StatLabel>
          <StatValue>{formatNumber(summary?.listedProducts ?? 0)}</StatValue>
          <StatDescription>
            {summary?.outOfStockProducts
              ? `${formatNumber(summary.outOfStockProducts)} out of stock`
              : "All listings in stock"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Orders to review</StatLabel>
          <StatValue>{formatNumber(summary?.pendingOrders ?? 0)}</StatValue>
          <StatDescription>Draft online orders waiting for you</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Orders (30 days)</StatLabel>
          <StatValue>{formatNumber(summary?.ordersLast30Days ?? 0)}</StatValue>
          <StatDescription>Placed through the public shop</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Revenue (30 days)</StatLabel>
          <StatValue>{formatAmountValue(summary?.revenueLast30Days ?? 0)}</StatValue>
          <StatDescription>Excluding cancelled orders</StatDescription>
        </Stat>
      </StatGrid>

      <ShopLinkCard
        shop={shop}
        canEdit={access.canEdit}
        isSaving={isSaving}
        onPublishChange={(isPublished) => void save({ isPublished })}
        onAcceptingChange={(acceptsOrders) => void save({ acceptsOrders })}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 p-4">
        <div className="flex items-start gap-3">
          <PackageSearch className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">What customers can buy</p>
            <p className="text-sm text-muted-foreground">
              A product appears in the shop when it is active and its Shop channel is turned on.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/sme/products/all-products">Manage products</Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 p-4">
        <div>
          <p className="text-sm font-medium">Where online orders go</p>
          <p className="text-sm text-muted-foreground">
            Every shop order arrives as a draft sales order. Confirm it to reserve stock, then
            deliver and invoice as normal.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/sme/sales/orders">Open sales orders</Link>
        </Button>
      </div>

      <ShopSettingsForm shop={shop} canEdit={access.canEdit} />
    </>
  );
}
