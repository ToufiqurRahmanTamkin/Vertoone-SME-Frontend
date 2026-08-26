import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = ["Company", "Administrator", "Plan & payment"];

interface RegistrationStepsProps {
  current: number;
}

export function RegistrationSteps({ current }: RegistrationStepsProps) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((label, index) => {
        const isDone = index < current;
        const isCurrent = index === current;

        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                isDone && "border-primary bg-primary text-primary-foreground",
                isCurrent && "border-primary bg-primary/10 text-primary",
                !isDone && !isCurrent && "border-border bg-muted text-muted-foreground"
              )}
            >
              {isDone ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span
              className={cn(
                "hidden min-w-0 truncate text-xs font-medium sm:block",
                isCurrent ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <span
                className={cn(
                  "h-px flex-1 transition-colors",
                  index < current ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
