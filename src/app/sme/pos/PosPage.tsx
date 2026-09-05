import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { formatAmount, formatAmountValue, formatNumber } from "@/lib/amount";
import { roundMoney, toNumber } from "@/lib/trade";
import { useGetPosCatalogQuery, useGetPosSummaryQuery, usePosCheckoutMutation } from "@/redux/apis/posApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { PosCartLine, PosProduct, PosSaleResult } from "@/types/domain/pos";
import type { TradePaymentMethod } from "@/types/domain/trade";
import { Search } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { PosCart } from "./components/PosCart";
import { PosPaymentDialog } from "./components/PosPaymentDialog";
import { PosReceiptDialog } from "./components/PosReceiptDialog";

export default function PosPage() {
  const access = useModulePermission("/sme/point-of-sale");

  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();

  const [selectedWarehouseId, setSelectedWarehouseId] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [lines, setLines] = React.useState<PosCartLine[]>([]);
  const [discount, setDiscount] = React.useState("");
  const [payOpen, setPayOpen] = React.useState(false);
  const [sale, setSale] = React.useState<PosSaleResult | null>(null);

  const searchRef = React.useRef<HTMLInputElement>(null);

  const warehouseId = selectedWarehouseId || warehouseOptions[0]?._id || "";

  const { data: catalog, isLoading } = useGetPosCatalogQuery(
    {
      warehouseId: warehouseId || undefined,
      search: search || undefined,
      categoryId: categoryId || undefined,
      limit: 100,
    },
    { skip: !warehouseId }
  );

  const { data: summary } = useGetPosSummaryQuery();
  const currency = summary?.currency ?? "BDT";
  const [checkout, { isLoading: isCheckingOut }] = usePosCheckoutMutation();

  const addProduct = React.useCallback((product: PosProduct) => {
    if (product.isTracked && product.availableQuantity <= 0) {
      toast.error(`${product.name} is out of stock at this till`);
      return;
    }

    setLines((current) => {
      const existing = current.find((line) => line.productId === product._id);

      if (!existing) {
        return [
          ...current,
          {
            productId: product._id,
            name: product.name,
            sku: product.sku,
            unitPrice: product.sellingPrice,
            taxRate: product.taxRate,
            quantity: 1,
            isTracked: product.isTracked,
            availableQuantity: product.availableQuantity,
          },
        ];
      }

      if (existing.isTracked && existing.quantity >= existing.availableQuantity) {
        toast.error(`Only ${existing.availableQuantity} of ${product.name} left at this till`);
        return current;
      }

      return current.map((line) =>
        line.productId === product._id ? { ...line, quantity: line.quantity + 1 } : line
      );
    });
  }, []);

  const products = catalog?.products ?? [];

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    const term = search.trim().toLowerCase();
    if (!term) return;

    const exact = products.find(
      (product) =>
        product.barcode.toLowerCase() === term || product.sku.toLowerCase() === term
    );

    const target = exact ?? (products.length === 1 ? products[0] : null);

    if (target) {
      addProduct(target);
      setSearch("");
    }
  };

  const changeQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setLines((current) => current.filter((line) => line.productId !== productId));
      return;
    }

    setLines((current) =>
      current.map((line) => {
        if (line.productId !== productId) return line;
        const capped = line.isTracked ? Math.min(quantity, line.availableQuantity) : quantity;
        return { ...line, quantity: capped };
      })
    );
  };

  const totals = React.useMemo(() => {
    const subTotal = roundMoney(
      lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
    );
    const taxTotal = roundMoney(
      lines.reduce((sum, line) => sum + (line.unitPrice * line.quantity * line.taxRate) / 100, 0)
    );
    const saleDiscount = Math.min(Math.max(0, toNumber(discount)), subTotal + taxTotal);

    return {
      subTotal,
      taxTotal,
      discount: saleDiscount,
      grandTotal: Math.max(0, roundMoney(subTotal + taxTotal - saleDiscount)),
    };
  }, [lines, discount]);

  const completeSale = async (payload: {
    paymentMethod: TradePaymentMethod;
    amountTendered: number;
    customerName: string;
    customerPhone: string;
  }) => {
    try {
      const result = await checkout({
        warehouseId,
        customerName: payload.customerName || undefined,
        customerPhone: payload.customerPhone || undefined,
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
        })),
        discountAmount: totals.discount,
        paymentMethod: payload.paymentMethod,
        amountTendered: payload.amountTendered,
      }).unwrap();

      setPayOpen(false);
      setSale(result);
      setLines([]);
      setDiscount("");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not complete the sale");
    }
  };

  const warehouseName =
    warehouseOptions.find((warehouse) => warehouse._id === warehouseId)?.name ?? "";

  return (
    <>
      <PageHeader
        title="Point of sale"
        description="Ring up walk-in customers. Each sale issues an invoice and takes the stock off the shelf immediately."
        actions={<CurrencyNote currency={currency} />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Sales today</StatLabel>
          <StatValue>{summary?.salesCount ?? 0}</StatValue>
          <StatDescription>{formatNumber(summary?.itemsSold ?? 0)} items sold</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Takings today</StatLabel>
          <StatValue>{formatAmountValue(summary?.takings ?? 0)}</StatValue>
          <StatDescription>Across every payment method</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Cash taken</StatLabel>
          <StatValue>{formatAmountValue(summary?.cashTakings ?? 0)}</StatValue>
          <StatDescription>What should be in the drawer</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Average sale</StatLabel>
          <StatValue>{formatAmountValue(summary?.averageSale ?? 0)}</StatValue>
          <StatDescription>Today so far</StatDescription>
        </Stat>
      </StatGrid>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_360px]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-56 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder="Scan a barcode or search products..."
                className="pl-9"
                autoFocus
              />
            </div>

            <Select value={warehouseId} onValueChange={setSelectedWarehouseId}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Till warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouseOptions.map((warehouse) => (
                  <SelectItem key={warehouse._id} value={warehouse._id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(catalog?.categories.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={categoryId === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryId("")}
              >
                All
              </Button>
              {catalog?.categories.map((category) => (
                <Button
                  key={category._id}
                  variant={categoryId === category._id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryId(category._id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}

          <ScrollArea className="min-h-0 flex-1 rounded-xl border">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : products.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-1 text-center">
                <p className="text-sm font-medium">Nothing to sell here yet</p>
                <p className="text-xs text-muted-foreground">
                  Turn on the POS channel on a product to make it available at the till.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => {
                  const soldOut = product.isTracked && product.availableQuantity <= 0;

                  return (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => addProduct(product)}
                      disabled={soldOut || !access.canCreate}
                      className="flex flex-col gap-1 rounded-lg border bg-card p-3 text-left transition hover:border-primary hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="line-clamp-2 text-sm font-medium">{product.name}</span>
                        {soldOut && (
                          <Badge variant="secondary" className="shrink-0 text-[10px]">
                            Out
                          </Badge>
                        )}
                      </div>
                      <span className="font-mono text-[10px] uppercase text-muted-foreground">
                        {product.sku}
                      </span>
                      <div className="mt-auto flex items-baseline justify-between gap-2 pt-1">
                        <span className="text-sm font-semibold tabular-nums">
                          {formatAmount(product.sellingPrice)}
                        </span>
                        {product.isTracked && (
                          <span className="text-[10px] text-muted-foreground">
                            {formatNumber(product.availableQuantity)} left
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="min-h-100 lg:min-h-0">
          <PosCart
            lines={lines}
            discount={discount}
            onDiscountChange={setDiscount}
            onQuantityChange={changeQuantity}
            onRemove={(productId) =>
              setLines((current) => current.filter((line) => line.productId !== productId))
            }
            onClear={() => {
              setLines([]);
              setDiscount("");
            }}
            onCheckout={() => setPayOpen(true)}
            subTotal={totals.subTotal}
            taxTotal={totals.taxTotal}
            grandTotal={totals.grandTotal}
            isBusy={isCheckingOut}
          />
        </div>
      </div>

      <PosPaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        total={totals.grandTotal}
        isLoading={isCheckingOut}
        onConfirm={completeSale}
      />

      <PosReceiptDialog
        sale={sale}
        onClose={() => {
          setSale(null);
          searchRef.current?.focus();
        }}
      />

      {warehouseName && (
        <p className="text-xs text-muted-foreground">
          Selling from <span className="font-medium">{warehouseName}</span>. Stock is deducted from
          this warehouse the moment a sale completes.
        </p>
      )}
    </>
  );
}
