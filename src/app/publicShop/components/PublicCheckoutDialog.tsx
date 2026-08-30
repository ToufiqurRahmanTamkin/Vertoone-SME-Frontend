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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatAmount } from "@/lib/amount";
import type { PublicCartLine, PublicShopProfile } from "@/types/domain/publicShop";
import { Loader2 } from "lucide-react";
import * as React from "react";

interface PublicCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shop: PublicShopProfile;
  lines: PublicCartLine[];
  subTotal: number;
  isLoading: boolean;
  error: string | null;
  onSubmit: (details: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    note: string;
  }) => void;
}

export function PublicCheckoutDialog({
  open,
  onOpenChange,
  shop,
  lines,
  subTotal,
  isLoading,
  error,
  onSubmit,
}: PublicCheckoutDialogProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [note, setNote] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setLocalError(null);
  }, [open]);

  const total = subTotal + shop.deliveryCharge;
  const belowMinimum = shop.minimumOrderValue > 0 && subTotal < shop.minimumOrderValue;

  const submit = () => {
    if (!name.trim()) {
      setLocalError("Please tell us your name");
      return;
    }
    if (phone.trim().length < 4) {
      setLocalError("Please give a phone number we can reach you on");
      return;
    }
    if (!address.trim()) {
      setLocalError("Please give a delivery address");
      return;
    }

    setLocalError(null);
    onSubmit({
      customerName: name.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim(),
      shippingAddress: address.trim(),
      note: note.trim(),
    });
  };

  const shown = localError ?? error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            Pay cash when your order is delivered. We will call to confirm before sending it.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div className="rounded-lg border p-3">
            <ul className="space-y-1 text-sm">
              {lines.map((line) => (
                <li key={line.productId} className="flex justify-between gap-2">
                  <span className="min-w-0 truncate">
                    {line.quantity} × {line.name}
                  </span>
                  <span className="tabular-nums">
                    {formatAmount(line.unitPrice * line.quantity, shop.currency)}
                  </span>
                </li>
              ))}
            </ul>

            <Separator className="my-2" />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatAmount(subTotal, shop.currency)}</span>
              </div>
              {shop.deliveryCharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="tabular-nums">
                    {formatAmount(shop.deliveryCharge, shop.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatAmount(total, shop.currency)}</span>
              </div>
            </div>
          </div>

          {belowMinimum && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              Orders start at {formatAmount(shop.minimumOrderValue, shop.currency)}. Please add a
              little more to your basket.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="checkout-name">Your name</Label>
              <Input
                id="checkout-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
                autoComplete="name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="checkout-phone">Phone</Label>
              <Input
                id="checkout-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="We will call to confirm"
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="checkout-email">Email (optional)</Label>
            <Input
              id="checkout-email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="For your order confirmation"
              autoComplete="email"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="checkout-address">Delivery address</Label>
            <Textarea
              id="checkout-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="House, road, area and any landmark"
              autoComplete="street-address"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="checkout-note">Note (optional)</Label>
            <Textarea
              id="checkout-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Anything we should know about the delivery"
            />
          </div>

          {shown && <p className="text-sm text-destructive">{shown}</p>}
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Keep shopping
          </Button>
          <Button type="button" onClick={submit} disabled={isLoading || belowMinimum}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Place order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
