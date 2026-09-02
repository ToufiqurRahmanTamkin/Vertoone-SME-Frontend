import { PlanAccessDialog } from "@/app/auth/register/PlanAccessDialog";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BILLING_CYCLE_LABELS } from "@/constant";
import { formatAmount, formatLimit } from "@/lib/amount";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types/domain/plan";
import { Check, Eye, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";

interface PlanPickerProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  plans: SubscriptionPlan[];
  isLoading: boolean;
  onPlanSelected?: (plan: SubscriptionPlan) => void;
}

export function PlanPicker<TFieldValues extends FieldValues>({
  control,
  name,
  plans,
  isLoading,
  onPlanSelected,
}: PlanPickerProps<TFieldValues>) {
  const [previewPlan, setPreviewPlan] = useState<SubscriptionPlan | null>(null);

  return (
    <>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Choose a plan</FormLabel>

            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <Skeleton key={index} className="h-40 w-full rounded-xl" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                No plans are available for sign-up right now. Please contact support.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {plans.map((plan) => {
                  const isSelected = field.value === plan._id;

                  return (
                    <div
                      key={plan._id}
                      role="radio"
                      tabIndex={0}
                      aria-checked={isSelected}
                      onClick={() => {
                        field.onChange(plan._id);
                        onPlanSelected?.(plan);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          field.onChange(plan._id);
                          onPlanSelected?.(plan);
                        }
                      }}
                      className={cn(
                        "relative flex cursor-pointer flex-col gap-2 rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                          : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                      )}
                    >
                      <div className="absolute right-2 top-2 flex items-center gap-1.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 cursor-pointer text-muted-foreground hover:text-foreground"
                              aria-label={`See what ${plan.name} includes`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setPreviewPlan(plan);
                              }}
                            >
                              <Eye className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>See included menus and permissions</TooltipContent>
                        </Tooltip>
                        {isSelected && (
                          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 pr-16">
                        <p className="truncate text-sm font-semibold">{plan.name}</p>
                        {plan.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {plan.description}
                          </p>
                        )}
                      </div>

                      <p className="text-xl font-bold tabular-nums">
                        {formatAmount(plan.price, plan.currency)}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          / {BILLING_CYCLE_LABELS[plan.billingCycle].toLowerCase()}
                        </span>
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Up to {formatLimit(plan.limits?.users)} users
                        {plan.trialDays > 0 ? ` · ${plan.trialDays}-day trial` : ""}
                      </p>

                      {plan.features.length > 0 && (
                        <ul className="mt-1 space-y-1">
                          {plan.features.slice(0, 3).map((feature) => (
                            <li
                              key={feature}
                              className="flex items-start gap-1.5 text-xs text-muted-foreground"
                            >
                              <Sparkles className="mt-0.5 size-3 shrink-0 text-primary" />
                              <span className="min-w-0 truncate">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <FormMessage />
          </FormItem>
        )}
      />

      <PlanAccessDialog
        plan={previewPlan}
        open={Boolean(previewPlan)}
        onOpenChange={(open) => {
          if (!open) setPreviewPlan(null);
        }}
      />
    </>
  );
}
