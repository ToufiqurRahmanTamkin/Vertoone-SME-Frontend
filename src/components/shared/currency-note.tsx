import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Coins } from "lucide-react";

interface CurrencyNoteProps {
  currency: string;
  className?: string;
}

export function CurrencyNote({ currency, className }: CurrencyNoteProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("gap-1.5 px-2.5 py-1 font-normal", className)}
      title="Set under System · Configuration"
    >
      <Coins className="size-3.5" />
      Amounts in <span className="font-semibold">{currency}</span>
    </Badge>
  );
}
