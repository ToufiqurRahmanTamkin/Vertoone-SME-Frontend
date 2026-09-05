import { BreakdownBars, type BreakdownRow } from "@/app/dashboard/components/BreakdownBars";
import { KpiCard } from "@/app/dashboard/components/KpiCard";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatGrid } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { safeDistanceToNow } from "@/lib/date";
import { useGetProductOverviewQuery } from "@/redux/apis/productOverviewApis";
import {
  Boxes,
  Layers,
  Package,
  Percent,
  Ruler,
  ScanLine,
  Sparkles,
  Store,
  Tags,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

const LIST_SKELETON = Array.from({ length: 5 });

const BAR_COLORS = ["blue", "violet", "green", "amber", "orange", "red", "zinc", "muted"] as const;

export default function ProductsOverviewPage() {
  const { data, isLoading } = useGetProductOverviewQuery();

  const productsAccess = useModulePermission("/sme/products/all-products");
  const variantsAccess = useModulePermission("/sme/products/variants");
  const priceListAccess = useModulePermission("/sme/products/price-lists");

  const currency = data?.currency ?? "BDT";
  const catalogue = data?.catalogue;
  const structure = data?.structure;
  const variants = data?.variants;
  const commerce = data?.commerce;
  const pricing = data?.pricing;
  const completeness = data?.completeness;

  const kpiCards = [
    {
      label: "Products",
      value: formatNumber(catalogue?.total),
      description: `${formatNumber(catalogue?.active)} active · ${formatNumber(
        catalogue?.inactive
      )} paused`,
      icon: Package,
      color: "info" as const,
      changePercent: catalogue?.addedChangePercent,
      changeLabel: "new this month",
    },
    {
      label: "Stock value",
      value: formatAmountValue(pricing?.stockValue),
      description: `${formatAmountValue(pricing?.retailValue)} at retail`,
      icon: Boxes,
      color: "default" as const,
    },
    {
      label: "Average margin",
      value: `${pricing?.averageMarginPercent ?? 0}%`,
      description: `Sells at ${formatAmountValue(
        pricing?.averageSellingPrice
      )}, costs ${formatAmountValue(pricing?.averagePurchasePrice)}`,
      icon: TrendingUp,
      color: "success" as const,
    },
    {
      label: "On sale now",
      value: formatNumber(commerce?.activePromotions),
      description: `${formatNumber(commerce?.promotions)} promotions set up in total`,
      icon: Percent,
      color: (commerce?.activePromotions ?? 0) > 0 ? ("warning" as const) : ("default" as const),
    },
  ];

  const structureCards = [
    {
      label: "Categories",
      value: formatNumber(structure?.categories),
      description: `${formatNumber(structure?.subCategories)} subcategories beneath them`,
      icon: Tags,
      color: "default" as const,
    },
    {
      label: "Brands",
      value: formatNumber(structure?.brands),
      description: `${formatNumber(completeness?.withBrand)} products carry one`,
      icon: Store,
      color: "default" as const,
    },
    {
      label: "Units of measure",
      value: formatNumber(structure?.units),
      description: `${formatNumber(completeness?.withUnit)} products are measured`,
      icon: Ruler,
      color: "default" as const,
    },
    {
      label: "Variants",
      value: formatNumber(variants?.variants),
      description: `${formatNumber(variants?.options)} option sets across ${formatNumber(
        variants?.productsWithVariants
      )} products`,
      icon: Layers,
      color: "info" as const,
    },
  ];

  const commerceCards = [
    {
      label: "Bundles & kits",
      value: formatNumber(commerce?.bundles),
      description: "Products sold together as one item",
      icon: Package,
      color: "default" as const,
    },
    {
      label: "Price lists",
      value: formatNumber(commerce?.priceLists),
      description: `${formatNumber(commerce?.priceListItems)} special prices recorded`,
      icon: Tags,
      color: "default" as const,
    },
    {
      label: "Barcodes",
      value: formatNumber(commerce?.barcodes),
      description: `${formatNumber(commerce?.productsWithoutBarcode)} products still without one`,
      icon: ScanLine,
      color:
        (commerce?.productsWithoutBarcode ?? 0) > 0 ? ("warning" as const) : ("success" as const),
    },
    {
      label: "Sales channels",
      value: formatNumber(catalogue?.posCount),
      description: `${formatNumber(catalogue?.shopCount)} online · ${formatNumber(
        catalogue?.bothChannelCount
      )} on both`,
      icon: Sparkles,
      color: "default" as const,
    },
  ];

  const categoryRows: BreakdownRow[] = (data?.categories ?? []).map((point, index) => ({
    key: point._id || point.name,
    label: point.name,
    count: point.count,
    color: BAR_COLORS[index % BAR_COLORS.length],
  }));

  const brandRows: BreakdownRow[] = (data?.brands ?? []).map((point, index) => ({
    key: point._id || point.name,
    label: point.name,
    count: point.count,
    color: BAR_COLORS[(index + 3) % BAR_COLORS.length],
  }));

  const completenessRows = [
    { key: "image", label: "Have a photo", value: completeness?.withImage ?? 0 },
    { key: "barcode", label: "Have a barcode", value: completeness?.withBarcode ?? 0 },
    { key: "unit", label: "Have a unit", value: completeness?.withUnit ?? 0 },
    { key: "brand", label: "Have a brand", value: completeness?.withBrand ?? 0 },
    { key: "subCategory", label: "Have a subcategory", value: completeness?.withSubCategory ?? 0 },
  ];

  const completenessTotal = completeness?.total ?? 0;

  return (
    <>
      <PageHeader
        title="Products overview"
        description="Catalogue size, pricing spread, and how much of your product data is filled in."
        actions={<CurrencyNote currency={currency} />}
      />

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        {structureCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        {commerceCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={Tags}
          title="Products by category"
          description="Where the catalogue is concentrated."
        >
          <BreakdownBars
            rows={categoryRows}
            isLoading={isLoading}
            emptyMessage="No products filed under a category yet."
            rowCount={6}
          />
        </SectionCard>

        <SectionCard
          icon={Store}
          title="Products by brand"
          description="Which makers you stock the most of."
        >
          <BreakdownBars
            rows={brandRows}
            isLoading={isLoading}
            emptyMessage="No products carry a brand yet."
            rowCount={6}
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={Boxes}
          title="Where your money is sitting"
          description="The five products holding the most stock value right now."
          action={
            productsAccess.canView && (
              <Link
                to="/sme/inventory/valuation"
                className="text-sm font-medium text-primary hover:underline"
              >
                Full valuation
              </Link>
            )
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (data?.topValueProducts ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing is in stock yet.
            </p>
          ) : (
            <ul className="divide-y">
              {(data?.topValueProducts ?? []).map((product) => (
                <li key={product._id} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                      {product.sku}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium tabular-nums">
                      {formatAmountValue(product.stockValue)}
                    </p>
                    <p className="text-xs tabular-nums text-muted-foreground">
                      {formatNumber(product.quantity)} on hand
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={Package}
          title="Added recently"
          description="The last five products to join the catalogue."
          action={
            productsAccess.canView && (
              <Link
                to="/sme/products/all-products"
                className="text-sm font-medium text-primary hover:underline"
              >
                All products
              </Link>
            )
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (data?.recentProducts ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing has been added yet.
            </p>
          ) : (
            <ul className="divide-y">
              {(data?.recentProducts ?? []).map((product) => (
                <li key={product._id} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {product.category?.name ?? "Uncategorised"}
                      {product.brand ? ` · ${product.brand.name}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium tabular-nums">
                      {formatAmountValue(product.sellingPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {safeDistanceToNow(product.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={Sparkles}
          title="How complete your catalogue is"
          description="The fields that make products easier to find, sell and count."
          action={
            variantsAccess.canView && (
              <Link
                to="/sme/products/variants"
                className="text-sm font-medium text-primary hover:underline"
              >
                Variants
              </Link>
            )
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-9 w-full" />
              ))}
            </div>
          ) : completenessTotal === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Add your first product to see this.
            </p>
          ) : (
            <ul className="space-y-3">
              {completenessRows.map((row) => {
                const share = Math.round((row.value / completenessTotal) * 100);
                return (
                  <li key={row.key}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate font-medium">{row.label}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {formatNumber(row.value)} of {formatNumber(completenessTotal)}
                        <span className="ml-1.5 text-xs">({share}%)</span>
                      </span>
                    </div>
                    <Progress value={share} className="mt-1.5 h-2" />
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={TrendingUp}
          title="Running low"
          description="The products closest to running out."
          action={
            priceListAccess.canView && (
              <Link
                to="/sme/inventory/stock"
                className="text-sm font-medium text-primary hover:underline"
              >
                Stock on hand
              </Link>
            )
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (data?.lowStockProducts ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing is running low.
            </p>
          ) : (
            <ul className="divide-y">
              {(data?.lowStockProducts ?? []).map((product) => (
                <li key={product._id} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                      {product.sku}
                    </p>
                  </div>
                  <StatusBadge
                    color={product.quantity <= 0 ? "red" : "amber"}
                    label={
                      product.quantity <= 0
                        ? "Out of stock"
                        : `${formatNumber(product.quantity)} left`
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}
