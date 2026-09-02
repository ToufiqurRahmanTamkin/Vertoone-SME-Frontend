import { FormTextarea } from "@/components/shared/form-fields";
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
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { BILLING_CYCLE_LABELS } from "@/constant";
import { formatAmount } from "@/lib/amount";
import { cn } from "@/lib/utils";
import { useGetPublicPlansQuery } from "@/redux/apis/planApis";
import { useRequestUpgradeMutation } from "@/redux/apis/subscriptionRequestApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  UpgradeRequestSchema,
  type UpgradeRequestFormValues,
} from "@/validations/subscriptionRequest";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Info, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface UpgradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanId: string | null;
  currentPlanName: string;
}

export function UpgradePlanModal({
  open,
  onOpenChange,
  currentPlanId,
  currentPlanName,
}: UpgradePlanModalProps) {
  const { data: plans, isLoading: isPlansLoading } = useGetPublicPlansQuery(undefined, {
    skip: !open,
  });
  const [requestUpgrade, { isLoading }] = useRequestUpgradeMutation();

  const form = useForm<UpgradeRequestFormValues>({
    resolver: zodResolver(UpgradeRequestSchema),
    defaultValues: { planId: "", reason: "" },
  });

  React.useEffect(() => {
    if (open) form.reset({ planId: "", reason: "" });
  }, [open, form]);

  const selectedPlanId = form.watch("planId");
  const options = (plans ?? []).filter((plan) => plan._id !== currentPlanId);

  const onSubmit = async (values: UpgradeRequestFormValues) => {
    try {
      await requestUpgrade({ planId: values.planId, reason: values.reason }).unwrap();
      toast.success("Upgrade requested — we will confirm once the payment is approved");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not request the upgrade");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change your plan</DialogTitle>
          <DialogDescription>
            You are on {currentPlanName}. Pick the plan you want to move to and we will raise the
            invoice for it.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground">
                  The term you already paid for is not forfeited and no trial applies to an
                  upgrade. Your current plan keeps running until our team approves the payment,
                  then the new plan takes effect immediately.
                </p>
              </div>

              {isPlansLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : options.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  There is no other plan available right now.
                </p>
              ) : (
                <div className="space-y-2">
                  {options.map((plan) => (
                    <button
                      key={plan._id}
                      type="button"
                      onClick={() =>
                        form.setValue("planId", plan._id, { shouldValidate: true })
                      }
                      className={cn(
                        "flex w-full cursor-pointer items-start justify-between gap-4 rounded-lg border p-3 text-left transition-colors",
                        selectedPlanId === plan._id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-medium">
                          {plan.name}
                          {selectedPlanId === plan._id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {plan.description || `${plan.features.length} feature(s) included`}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-semibold tabular-nums">
                          {formatAmount(plan.price, plan.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {BILLING_CYCLE_LABELS[plan.billingCycle]}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {form.formState.errors.planId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.planId.message}
                </p>
              )}

              <FormTextarea
                control={form.control}
                name="reason"
                label="Anything we should know?"
                placeholder="Optional — tell us why you are changing plan."
                showCharCount={false}
                rows={3}
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || options.length === 0}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request upgrade
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
