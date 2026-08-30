import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatAmount } from "@/lib/amount";
import { roundMoney } from "@/lib/trade";
import {
  useGetPublicShopCatalogQuery,
  usePlacePublicOrderMutation,
} from "@/redux/apis/publicShopApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type {
  PublicCartLine,
  PublicOrderReceipt as Receipt,
  PublicShopProduct,
} from "@/types/domain/publicShop";
import { Minus, Plus, Search, ShoppingBag, Store, Trash2 } from "lucide-react";
import * as React from "react";
import { useParams } from "react-router-dom";
import { PublicCheckoutDialog } from "./components/PublicCheckoutDialog";
import { PublicOrderReceipt } from "./components/PublicOrderReceipt";

export default function PublicShopPage() {
  const { slug = "" } = useParams<{ slug: string }>();

  const [search, setSearch] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [cart, setCart] = React.useState<PublicCartLine[]>([]);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [receipt, setReceipt] = React.useState<Receipt | null>(null);
  const [orderError, setOrderError] = React.useState<string | null>(null);

  const { data, isLoading, isError } = useGetPublicShopCatalogQuery(
    { slug, search: search || undefined, categoryId: categoryId || undefined, limit: 60 },
    { skip: !slug }
  );

  const [placeOrder, { isLoading: isPlacing }] = usePlacePublicOrderMutation();

  const shop = data?.shop;

  const addToCart = (product: PublicShopProduct) => {
    setCart((current) => {
      const existing = current.find((line) => line.productId === product._id);

      if (!existing) {
        return [
          ...current,
          {
            productId: product._id,
            name: product.name,
            imageUrl: product.imageUrl,
            unitPrice: product.sellingPrice,
            quantity: 1,
            availableQuantity: product.availableQuantity,
            inStock: product.inStock,
          },
        ];
      }

      if (existing.quantity >= existing.availableQuantity) return current;

      return current.map((line) =>
        line.productId === product._id ? { ...line, quantity: line.quantity + 1 } : line
      );
    });
    setCartOpen(true);
  };

  const changeQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((current) => current.filter((line) => line.productId !== productId));
      return;
    }

    setCart((current) =>
      current.map((line) =>
        line.productId === productId
          ? { ...line, quantity: Math.min(quantity, line.availableQuantity) }
          : line
      )
    );
  };

  const subTotal = roundMoney(
    cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  );

  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const submitOrder = async (details: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    note: string;
  }) => {
    try {
      const result = await placeOrder({
        slug,
        body: {
          ...details,
          items: cart.map((line) => ({ productId: line.productId, quantity: line.quantity })),
        },
      }).unwrap();

      setOrderError(null);
      setCheckoutOpen(false);
      setCartOpen(false);
      setCart([]);
      setReceipt(result);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      setOrderError(err?.data?.message || "We could not place your order. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !shop) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
        <Store className="h-10 w-10 text-muted-foreground/50" />
        <h1 className="text-lg font-semibold">This shop is not available</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The link may be wrong, or the shop owner has taken it offline.
        </p>
      </div>
    );
  }

  if (receipt) {
    return <PublicOrderReceipt receipt={receipt} onContinue={() => setReceipt(null)} />;
  }

  const products = data?.products ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          {shop.logoUrl ? (
            <img
              src={shop.logoUrl}
              alt={shop.name}
              className="h-9 w-9 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
              <Store className="h-4 w-4" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold sm:text-base">{shop.name}</h1>
            {shop.tagline && (
              <p className="truncate text-xs text-muted-foreground">{shop.tagline}</p>
            )}
          </div>

          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <ShoppingBag className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Basket</span>
                {itemCount > 0 && (
                  <Badge className="ml-2 h-5 min-w-5 justify-center px-1 text-[10px]">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>

            <SheetContent className="flex w-full flex-col sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Your basket</SheetTitle>
              </SheetHeader>

              {cart.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Your basket is empty.</p>
                </div>
              ) : (
                <>
                  <ul className="flex-1 space-y-3 overflow-y-auto px-4">
                    {cart.map((line) => (
                      <li key={line.productId} className="flex gap-3 rounded-lg border p-2">
                        {line.imageUrl ? (
                          <img
                            src={line.imageUrl}
                            alt={line.name}
                            className="h-14 w-14 shrink-0 rounded object-cover"
                          />
                        ) : (
                          <div className="h-14 w-14 shrink-0 rounded bg-muted" />
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{line.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatAmount(line.unitPrice, shop.currency)}
                          </p>

                          <div className="mt-1.5 flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => changeQuantity(line.productId, line.quantity - 1)}
                              aria-label={`Decrease ${line.name}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm tabular-nums">
                              {line.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => changeQuantity(line.productId, line.quantity + 1)}
                              disabled={line.quantity >= line.availableQuantity}
                              aria-label={`Increase ${line.name}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-auto h-6 w-6"
                              onClick={() => changeQuantity(line.productId, 0)}
                              aria-label={`Remove ${line.name}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold tabular-nums">
                        {formatAmount(subTotal, shop.currency)}
                      </span>
                    </div>
                    {shop.deliveryCharge > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Plus {formatAmount(shop.deliveryCharge, shop.currency)} delivery
                      </p>
                    )}
                    <Button
                      className="mt-3 w-full"
                      onClick={() => setCheckoutOpen(true)}
                      disabled={!shop.acceptsOrders}
                    >
                      {shop.acceptsOrders ? "Checkout" : "Not taking orders"}
                    </Button>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {shop.bannerUrl && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <img
            src={shop.bannerUrl}
            alt=""
            className="h-40 w-full rounded-xl object-cover sm:h-56"
          />
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6">
        {shop.description && (
          <p className="mb-5 max-w-2xl text-sm text-muted-foreground">{shop.description}</p>
        )}

        {!shop.acceptsOrders && (
          <p className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            This shop is not taking new orders right now. You can still browse what is available.
          </p>
        )}

        <div className="mb-4 flex flex-col gap-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>

          {(data?.categories.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={categoryId === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryId("")}
              >
                All
              </Button>
              {data?.categories.map((category) => (
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
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 rounded-xl border py-16 text-center">
            <p className="text-sm font-medium">Nothing here yet</p>
            <p className="text-xs text-muted-foreground">
              {search ? "Try a different search." : "This shop has not listed any products."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="flex flex-col overflow-hidden rounded-xl border bg-card"
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-muted">
                    <Store className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-1 p-3">
                  <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
                  {product.categoryName && (
                    <p className="text-[11px] text-muted-foreground">{product.categoryName}</p>
                  )}

                  <div className="mt-auto pt-2">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatAmount(product.sellingPrice, shop.currency)}
                    </p>
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock || !shop.acceptsOrders}
                    >
                      {product.inStock ? "Add to basket" : "Out of stock"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{shop.name}</p>
          {shop.address && <p className="mt-1">{shop.address}</p>}
          <p className="mt-1">
            {[shop.contactPhone, shop.contactEmail].filter(Boolean).join(" · ")}
          </p>
        </div>
      </footer>

      <PublicCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        shop={shop}
        lines={cart}
        subTotal={subTotal}
        isLoading={isPlacing}
        error={orderError}
        onSubmit={submitOrder}
      />
    </div>
  );
}
