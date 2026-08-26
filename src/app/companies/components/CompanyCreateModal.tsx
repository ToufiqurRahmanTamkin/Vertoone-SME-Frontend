import {
  FormInput,
  FormPassword,
  FormPayment,
  FormPhone,
  FormSelect,
  FormTextarea,
} from "@/components/shared/form-fields";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EMPLOYEE_RANGE_LABELS, toOptions } from "@/constant";
import { formatAmount } from "@/lib/amount";
import { useCreateCompanyMutation } from "@/redux/apis/companyApis";
import { useGetPlansQuery } from "@/redux/apis/planApis";
import type { ApiErrorResponse } from "@/redux/baseApi";
import { EMPLOYEE_RANGES } from "@/types/domain/company";
import { CreateCompanySchema, type CreateCompanyFormValues } from "@/validations/company";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface CompanyCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPLOYEE_RANGE_OPTIONS = toOptions(EMPLOYEE_RANGE_LABELS);

const emptyValues: CreateCompanyFormValues = {
  companyName: "",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  employeeRange: EMPLOYEE_RANGES[0],
  adminName: "",
  adminEmail: "",
  adminPhone: "",
  adminPassword: "",
  planId: "",
  paymentMethod: "CASH",
  transactionId: "",
  amount: "",
  note: "",
};

export function CompanyCreateModal({ open, onOpenChange }: CompanyCreateModalProps) {
  const [createCompany, { isLoading }] = useCreateCompanyMutation();
  const { data: planData } = useGetPlansQuery({ limit: 100, isActive: true });

  const form = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(CreateCompanySchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (open) form.reset(emptyValues);
  }, [open, form]);

  const plans = React.useMemo(() => planData?.data ?? [], [planData]);

  const planOptions = React.useMemo(
    () =>
      plans.map((plan) => ({
        label: `${plan.name}${plan.isPrivate ? " (private)" : ""} — ${formatAmount(
          plan.price,
          plan.currency
        )}`,
        value: plan._id,
      })),
    [plans]
  );

  const planId = useWatch({ control: form.control, name: "planId" });
  const selectedPlan = plans.find((plan) => plan._id === planId);

  const onSubmit = async (values: CreateCompanyFormValues) => {
    try {
      const result = await createCompany({
        companyName: values.companyName,
        companyEmail: values.companyEmail,
        companyPhone: values.companyPhone,
        companyAddress: values.companyAddress,
        employeeRange: values.employeeRange,
        adminName: values.adminName,
        adminEmail: values.adminEmail,
        adminPhone: values.adminPhone,
        adminPassword: values.adminPassword,
        planId: values.planId,
        paymentMethod: values.paymentMethod,
        transactionId: values.transactionId || undefined,
        amount: values.amount === "" ? undefined : values.amount,
        note: values.note || undefined,
      }).unwrap();

      toast.success(`${result.companyName} is live`, {
        description: `Invoice ${result.invoiceNumber} was recorded as paid for ${formatAmount(
          result.amount,
          result.currency
        )}.`,
      });
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not create the company");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New company</DialogTitle>
          <DialogDescription>
            Creating a company here approves it immediately, activates its owner and records the
            plan price as paid revenue — no separate approval step.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody>
              <Tabs defaultValue="company">
                <TabsList className="mb-3">
                  <TabsTrigger value="company" className="cursor-pointer">
                    Company
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="cursor-pointer">
                    Admin
                  </TabsTrigger>
                  <TabsTrigger value="plan" className="cursor-pointer">
                    Plan &amp; payment
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="company" className="grid grid-cols-6 gap-x-3 gap-y-3">
                  <FormInput
                    control={form.control}
                    name="companyName"
                    label="Company name"
                    placeholder="Acme Industries"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormSelect
                    control={form.control}
                    name="employeeRange"
                    label="Company size"
                    options={EMPLOYEE_RANGE_OPTIONS}
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormInput
                    control={form.control}
                    name="companyEmail"
                    label="Company email"
                    type="email"
                    placeholder="hello@acme.com"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormPhone
                    control={form.control}
                    name="companyPhone"
                    label="Company phone"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormTextarea
                    control={form.control}
                    name="companyAddress"
                    label="Address"
                    placeholder="Street, city, country"
                    className="col-span-6"
                  />
                </TabsContent>

                <TabsContent value="admin" className="grid grid-cols-6 gap-x-3 gap-y-3">
                  <p className="col-span-6 text-xs text-muted-foreground">
                    This becomes the company owner account. They can sign in as soon as you save,
                    so share these credentials with them directly.
                  </p>
                  <FormInput
                    control={form.control}
                    name="adminName"
                    label="Admin name"
                    placeholder="Jordan Rivera"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormInput
                    control={form.control}
                    name="adminEmail"
                    label="Admin email"
                    type="email"
                    placeholder="jordan@acme.com"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormPhone
                    control={form.control}
                    name="adminPhone"
                    label="Admin phone"
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormPassword
                    control={form.control}
                    name="adminPassword"
                    label="Temporary password"
                    description="At least 8 characters."
                    className="col-span-6 sm:col-span-3"
                  />
                </TabsContent>

                <TabsContent value="plan" className="grid grid-cols-6 gap-x-3 gap-y-3">
                  <FormSelect
                    control={form.control}
                    name="planId"
                    label="Subscription plan"
                    placeholder="Pick a plan"
                    options={planOptions}
                    description="Private plans are assignable here but hidden from public signup."
                    className="col-span-6 sm:col-span-4"
                  />
                  <FormInput
                    control={form.control}
                    name="amount"
                    label="Amount"
                    type="number"
                    placeholder={selectedPlan ? String(selectedPlan.price) : "Plan price"}
                    description="Leave blank to bill the plan price."
                    className="col-span-6 sm:col-span-2"
                  />

                  {selectedPlan && (
                    <div className="col-span-6 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs">
                      <span className="font-medium">{selectedPlan.name}</span>
                      {selectedPlan.isPrivate && (
                        <StatusBadge color="amber" label="Private" />
                      )}
                      <span className="text-muted-foreground">
                        {formatAmount(selectedPlan.price, selectedPlan.currency)} ·{" "}
                        {selectedPlan.billingCycle.toLowerCase().replace(/_/g, " ")}
                      </span>
                      {selectedPlan.isPrivate && (
                        <span className="ml-auto inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Lock className="size-3" />
                          Not purchasable from the public signup page
                        </span>
                      )}
                    </div>
                  )}

                  <FormPayment
                    control={form.control}
                    methodName="paymentMethod"
                    transactionIdName="transactionId"
                    className="col-span-6"
                  />
                  <FormTextarea
                    control={form.control}
                    name="note"
                    label="Internal note"
                    placeholder="Enterprise deal closed offline"
                    className="col-span-6"
                  />
                </TabsContent>
              </Tabs>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isLoading}>
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                Create company
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
