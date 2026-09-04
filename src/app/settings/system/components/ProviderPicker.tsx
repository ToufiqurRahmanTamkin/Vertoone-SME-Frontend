import { cn } from "@/lib/utils";
import type { EmailProvider, EmailProviderPreset } from "@/types/domain/emailSettings";
import { Check } from "lucide-react";

interface ProviderPickerProps {
  providers: EmailProviderPreset[];
  value: EmailProvider;
  disabled?: boolean;
  onSelect: (preset: EmailProviderPreset) => void;
}

export function ProviderPicker({
  providers,
  value,
  disabled = false,
  onSelect,
}: ProviderPickerProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {providers.map((preset) => {
        const selected = preset.provider === value;

        return (
          <button
            key={preset.provider}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onSelect(preset)}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-colors",
              "hover:border-primary/60 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60",
              selected && "border-primary bg-primary/5"
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                selected ? "border-primary bg-primary text-primary-foreground" : "bg-background"
              )}
            >
              {selected && <Check className="size-3" />}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{preset.label}</span>
              <span className="block text-xs text-muted-foreground">{preset.blurb}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
