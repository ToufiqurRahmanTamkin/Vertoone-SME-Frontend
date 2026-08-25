import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormInput, FormSelect, FormSwitch, FormTextarea } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { getApiErrorMessage } from "@/lib/api-error";
import { humanizeEnum } from "@/lib/format";
import {
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
} from "@/redux/apis/subscriptionPlanApi";
import { BILLING_CYCLES, type SubscriptionPlan } from "@/types";

const limitField = z
  .union([z.number().int().min(0), z.literal("")])
  .transform((value) => (value === "" || value === undefined ? null : Number(value)))
  .nullable();

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  description: z.string().trim().max(500),
  price: z.number({ message: "Price is required" }).min(0, "Price cannot be negative"),
  currency: z
    .string()
    .trim()
    .length(3, "Use a 3-letter ISO currency code")
    .transform((value) => value.toUpperCase()),
  billingCycle: z.enum(BILLING_CYCLES),
  featuresText: z.string(),
  limitUsers: limitField,
  limitBranches: limitField,
  limitStorageGb: limitField,
  trialDays: z.number().int().min(0).max(365),
  isActive: z.boolean(),
  isPopular: z.boolean(),
  sortOrder: z.number().int(),
});

type FormValues = z.input<typeof schema>;

const EMPTY_VALUES: FormValues = {
  name: "",
  description: "",
  price: 0,
  currency: "BDT",
  billingCycle: "MONTHLY",
  featuresText: "",
  limitUsers: null,
  limitBranches: null,
  limitStorageGb: null,
  trialDays: 0,
  isActive: true,
  isPopular: false,
  sortOrder: 0,
};

const toFormValues = (plan: SubscriptionPlan): FormValues => ({
  name: plan.name,
  description: plan.description,
  price: plan.price,
  currency: plan.currency,
  billingCycle: plan.billingCycle,
  featuresText: plan.features.join("\n"),
  limitUsers: plan.limits?.users ?? null,
  limitBranches: plan.limits?.branches ?? null,
  limitStorageGb: plan.limits?.storageGb ?? null,
  trialDays: plan.trialDays,
  isActive: plan.isActive,
  isPopular: plan.isPopular,
  sortOrder: plan.sortOrder,
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: SubscriptionPlan;
}

export function PlanFormDialog({ open, onOpenChange, plan }: Props) {
  const [createPlan, { isLoading: isCreating }] = useCreateSubscriptionPlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateSubscriptionPlanMutation();
  const isSaving = isCreating || isUpdating;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  const { reset } = form;

  React.useEffect(() => {
    if (open) reset(plan ? toFormValues(plan) : EMPTY_VALUES);
  }, [open, plan, reset]);

  const onSubmit = async (values: FormValues) => {
    const parsed = schema.parse(values);
    const body = {
      name: parsed.name,
      description: parsed.description,
      price: parsed.price,
      currency: parsed.currency,
      billingCycle: parsed.billingCycle,
      features: parsed.featuresText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      limits: {
        users: parsed.limitUsers,
        branches: parsed.limitBranches,
        storageGb: parsed.limitStorageGb,
      },
      trialDays: parsed.trialDays,
      isActive: parsed.isActive,
      isPopular: parsed.isPopular,
      sortOrder: parsed.sortOrder,
    };

    try {
      if (plan) {
        await updatePlan({ id: plan._id, body }).unwrap();
        toast.success("Plan updated");
      } else {
        await createPlan(body).unwrap();
        toast.success("Plan created");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save the plan"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit plan" : "New subscription plan"}</DialogTitle>
          <DialogDescription>
            {plan
              ? "Changes apply to new sales only — existing invoices keep the price they were sold at."
              : "Define the price, billing cycle and limits customers get on this plan."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                control={form.control}
                name="name"
                label="Plan name"
                placeholder="Professional"
              />
              <FormSelect
                control={form.control}
                name="billingCycle"
                label="Billing cycle"
                options={BILLING_CYCLES.map((cycle) => ({
                  label: humanizeEnum(cycle),
                  value: cycle,
                }))}
              />
              <FormInput
                control={form.control}
                name="price"
                type="number"
                label="Price"
                placeholder="0"
              />
              <FormInput
                control={form.control}
                name="currency"
                label="Currency"
                placeholder="BDT"
              />
            </div>

            <FormTextarea
              control={form.control}
              name="description"
              label="Description"
              placeholder="Who this plan is for…"
              rows={2}
            />

            <FormTextarea
              control={form.control}
              name="featuresText"
              label="Features"
              description="One feature per line."
              placeholder={"Unlimited invoices\nPriority support\nCustom branding"}
              rows={4}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormInput
                control={form.control}
                name="limitUsers"
                type="number"
                label="User limit"
                placeholder="Unlimited"
              />
              <FormInput
                control={form.control}
                name="limitBranches"
                type="number"
                label="Branch limit"
                placeholder="Unlimited"
              />
              <FormInput
                control={form.control}
                name="limitStorageGb"
                type="number"
                label="Storage (GB)"
                placeholder="Unlimited"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                control={form.control}
                name="trialDays"
                type="number"
                label="Trial days"
                placeholder="0"
              />
              <FormInput
                control={form.control}
                name="sortOrder"
                type="number"
                label="Sort order"
                description="Lower numbers appear first."
                placeholder="0"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormSwitch
                control={form.control}
                name="isActive"
                label="Active"
                description="Available for new sales."
              />
              <FormSwitch
                control={form.control}
                name="isPopular"
                label="Most popular"
                description="Highlighted in pricing tables."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isSaving}>
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                {plan ? "Save changes" : "Create plan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
