import { FileUploader } from "@/components/shared/file-uploader";
import {
  FormCitySelect,
  FormCountrySelect,
  FormInput,
  FormPassword,
  FormPhone,
  FormSelect,
  FormTextarea,
} from "@/components/shared/form-fields";
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
import { Stepper, type StepperStep } from "@/components/ui/stepper";
import { EMPLOYEE_RANGE_LABELS, toOptions } from "@/constant";
import { currencyForCountry } from "@/constant/locale";
import { useCreateCompanyMutation } from "@/redux/apis/companyApis";
import type { ApiErrorResponse } from "@/redux/baseApi";
import { EMPLOYEE_RANGES } from "@/types/domain/company";
import { CreateCompanySchema, type CreateCompanyFormValues } from "@/validations/company";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Image as ImageIcon, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface CompanyCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPLOYEE_RANGE_OPTIONS = toOptions(EMPLOYEE_RANGE_LABELS);

const LOGO_ASPECT = 1;
const BANNER_ASPECT = 4;

const STEPS: readonly StepperStep[] = [
  { id: "company", label: "Company" },
  { id: "branding", label: "Branding" },
  { id: "admin", label: "Admin" },
];

const STEP_FIELDS: readonly (keyof CreateCompanyFormValues)[][] = [
  [
    "companyName",
    "employeeRange",
    "companyEmail",
    "companyPhone",
    "companyCountry",
    "companyCity",
    "companyZipCode",
    "companyStreet",
    "note",
  ],
  ["logoUrl", "logoPublicId", "bannerUrl", "bannerPublicId"],
  ["adminName", "adminEmail", "adminPhone", "adminPassword"],
];

const LAST_STEP = STEPS.length - 1;

const stepOf = (field: string): number => {
  const index = STEP_FIELDS.findIndex((fields) =>
    fields.includes(field as keyof CreateCompanyFormValues)
  );
  return index === -1 ? 0 : index;
};

const emptyValues: CreateCompanyFormValues = {
  companyName: "",
  companyEmail: "",
  companyPhone: "",
  companyCountry: "",
  companyCity: "",
  companyZipCode: "",
  companyStreet: "",
  employeeRange: EMPLOYEE_RANGES[0],
  adminName: "",
  adminEmail: "",
  adminPhone: "",
  adminPassword: "",
  note: "",
  logoUrl: "",
  logoPublicId: "",
  bannerUrl: "",
  bannerPublicId: "",
};

export function CompanyCreateModal({ open, onOpenChange }: CompanyCreateModalProps) {
  const [createCompany, { isLoading }] = useCreateCompanyMutation();
  const [step, setStep] = React.useState(0);
  const [furthestStep, setFurthestStep] = React.useState(0);

  const form = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(CreateCompanySchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (open) form.reset(emptyValues);
  }, [open, form]);

  const [seededFor, setSeededFor] = React.useState(false);

  if (seededFor !== open) {
    setSeededFor(open);
    setStep(0);
    setFurthestStep(0);
  }

  const selectedCountry = useWatch({ control: form.control, name: "companyCountry" });
  const countryCurrency = selectedCountry ? currencyForCountry(selectedCountry) : "";

  const companyName = useWatch({ control: form.control, name: "companyName" });
  const logoUrl = useWatch({ control: form.control, name: "logoUrl" });
  const logoPublicId = useWatch({ control: form.control, name: "logoPublicId" });
  const bannerUrl = useWatch({ control: form.control, name: "bannerUrl" });
  const bannerPublicId = useWatch({ control: form.control, name: "bannerPublicId" });

  const goNext = async () => {
    const isValid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (!isValid) return;
    const next = Math.min(step + 1, LAST_STEP);
    setStep(next);
    setFurthestStep((previous) => Math.max(previous, next));
  };

  const onSubmit = async (values: CreateCompanyFormValues) => {
    try {
      const result = await createCompany({
        companyName: values.companyName,
        companyEmail: values.companyEmail,
        companyPhone: values.companyPhone,
        companyCountry: values.companyCountry,
        companyCity: values.companyCity,
        companyZipCode: values.companyZipCode,
        companyStreet: values.companyStreet,
        employeeRange: values.employeeRange,
        adminName: values.adminName,
        adminEmail: values.adminEmail,
        adminPhone: values.adminPhone,
        adminPassword: values.adminPassword,
        note: values.note || undefined,
        logoUrl: values.logoUrl || undefined,
        logoPublicId: values.logoPublicId || undefined,
        bannerUrl: values.bannerUrl || undefined,
        bannerPublicId: values.bannerPublicId || undefined,
      }).unwrap();

      toast.success(`${result.companyName} is live`, {
        description: `${result.adminEmail} can sign in now. Record a sale from Sold subscriptions to put this company on a plan.`,
      });
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not create the company");
    }
  };

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstStep = Object.keys(errors)
      .map(stepOf)
      .sort((a, b) => a - b)[0];
    if (firstStep !== undefined) setStep(firstStep);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < LAST_STEP) {
      void goNext();
      return;
    }
    void form.handleSubmit(onSubmit, onInvalid)(event);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New company</DialogTitle>
          <DialogDescription>
            Creating a company here approves it immediately, activates its owner and emails them
            their sign-in credentials. It starts without a plan — sell it a subscription from Sold
            subscriptions to unlock the paid modules.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleFormSubmit}>
            <DialogBody className="space-y-4">
              <Stepper
                steps={STEPS}
                current={step}
                reachable={furthestStep}
                onStepSelect={setStep}
              />

              {step === 0 && (
                <div className="grid grid-cols-6 gap-x-3 gap-y-3">
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
                  <FormCountrySelect
                    control={form.control}
                    name="companyCountry"
                    label="Country"
                    placeholder="Select a country"
                    className="col-span-6 sm:col-span-3"
                    onValueChange={() => form.setValue("companyCity", "")}
                  />
                  <FormCitySelect
                    control={form.control}
                    name="companyCity"
                    label="City"
                    countryName={selectedCountry}
                    className="col-span-6 sm:col-span-3"
                  />
                  <FormInput
                    control={form.control}
                    name="companyZipCode"
                    label="Zip code"
                    placeholder="1207"
                    className="col-span-6 sm:col-span-2"
                  />
                  <FormInput
                    control={form.control}
                    name="companyStreet"
                    label="Street address"
                    placeholder="House, road, area"
                    className="col-span-6 sm:col-span-4"
                  />
                  {countryCurrency && (
                    <p className="col-span-6 text-xs text-muted-foreground">
                      Billing currency for this company and its concerns:{" "}
                      <span className="font-medium text-foreground">{countryCurrency}</span>, set
                      from {selectedCountry}.
                    </p>
                  )}
                  <FormTextarea
                    control={form.control}
                    name="note"
                    label="Internal note"
                    placeholder="Optional — why this company was created here"
                    className="col-span-6"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-6 gap-x-3 gap-y-3">
                  <p className="col-span-6 text-xs text-muted-foreground">
                    Both are optional. Leave them empty and the company starts without
                    artwork — its owner can add it later from Company profile.
                  </p>

                  <div className="col-span-6 overflow-hidden rounded-xl border bg-card">
                    <div
                      className="relative w-full bg-gradient-to-r from-primary/25 via-primary/10 to-transparent"
                      style={{ aspectRatio: String(BANNER_ASPECT) }}
                    >
                      {bannerUrl && (
                        <img src={bannerUrl} alt="" className="size-full object-cover" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 p-3">
                      <div className="-mt-10 size-16 shrink-0 overflow-hidden rounded-lg border bg-background shadow-sm">
                        {logoUrl ? (
                          <img src={logoUrl} alt="" className="size-full object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <ImageIcon className="size-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="min-w-0 truncate text-sm font-medium">
                        {companyName || "Company preview"}
                      </p>
                    </div>
                  </div>

                  <FileUploader
                    className="col-span-6 sm:col-span-3"
                    value={logoUrl || undefined}
                    publicId={logoPublicId || undefined}
                    folder="companies"
                    label="Company logo"
                    description="Square. Shown next to the company across the platform."
                    cropAspect={LOGO_ASPECT}
                    cropTitle="Position the logo"
                    cropDescription="Drag to reposition and zoom until the logo sits the way you want it."
                    disabled={isLoading}
                    onChange={(asset) => {
                      form.setValue("logoUrl", asset?.url ?? "", { shouldDirty: true });
                      form.setValue("logoPublicId", asset?.publicId ?? "", { shouldDirty: true });
                    }}
                  />

                  <FileUploader
                    className="col-span-6 sm:col-span-3"
                    value={bannerUrl || undefined}
                    publicId={bannerPublicId || undefined}
                    folder="companies"
                    label="Company banner"
                    description="Wide 4:1 artwork used as the header of the company profile."
                    cropAspect={BANNER_ASPECT}
                    cropTitle="Position the banner"
                    cropDescription="Drag to reposition and zoom until the banner is framed the way you want it."
                    disabled={isLoading}
                    onChange={(asset) => {
                      form.setValue("bannerUrl", asset?.url ?? "", { shouldDirty: true });
                      form.setValue("bannerPublicId", asset?.publicId ?? "", {
                        shouldDirty: true,
                      });
                    }}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-6 gap-x-3 gap-y-3">
                  <p className="col-span-6 text-xs text-muted-foreground">
                    This becomes the company owner account. They can sign in as soon as you save,
                    and these credentials are emailed to the admin address below.
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
                </div>
              )}
            </DialogBody>

            <DialogFooter className="sm:justify-between">
              <span className="hidden text-xs text-muted-foreground sm:block">
                Step {step + 1} of {STEPS.length}
              </span>
              <div className="flex flex-1 items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}
                  disabled={isLoading}
                >
                  {step === 0 ? (
                    "Cancel"
                  ) : (
                    <>
                      <ArrowLeft className="mr-2 size-4" />
                      Back
                    </>
                  )}
                </Button>
                {step < LAST_STEP ? (
                  <Button
                    key="wizard-next"
                    type="button"
                    className="cursor-pointer"
                    onClick={() => void goNext()}
                  >
                    Next
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                ) : (
                  <Button
                    key="wizard-submit"
                    type="submit"
                    className="cursor-pointer"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Create company
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
