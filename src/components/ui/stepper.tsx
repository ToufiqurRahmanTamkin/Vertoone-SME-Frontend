import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface StepperStep {
  /** Stable identifier, also used as the React key. */
  id: string;
  label: string;
}

interface StepperProps {
  steps: readonly StepperStep[];
  /** Zero-based index of the step being filled in. */
  current: number;
  /**
   * Called when a reachable marker is clicked. Omit to render a read-only rail.
   */
  onStepSelect?: (index: number) => void;
  /**
   * Highest index the user has already reached. Steps beyond it stay
   * unclickable so a form is never skipped past its own validation.
   */
  reachable?: number;
  className?: string;
}

export function Stepper({ steps, current, onStepSelect, reachable, className }: StepperProps) {
  const furthest = reachable ?? current;

  return (
    <ol className={cn("flex items-center gap-2", className)}>
      {steps.map((step, index) => {
        const isDone = index < current;
        const isCurrent = index === current;
        const isSelectable = Boolean(onStepSelect) && index <= furthest && !isCurrent;

        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              onClick={isSelectable ? () => onStepSelect?.(index) : undefined}
              disabled={!isSelectable}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex min-w-0 items-center gap-2 rounded-md text-left",
                isSelectable && "cursor-pointer"
              )}
            >
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
                {step.label}
              </span>
            </button>
            {index < steps.length - 1 && (
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
