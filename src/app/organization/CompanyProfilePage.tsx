import { FileUploader } from "@/components/shared/file-uploader";
import {
  FormInput,
  FormPhone,
  FormSelect,
  FormTextarea,
} from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { EMPLOYEE_RANGE_LABELS, toOptions } from "@/constant";
import { useGetMyCompanyQuery } from "@/redux/apis/companyApis";
import {
  CompanyProfileSchema,
  type CompanyProfileFormValues,
} from "@/validations/organization";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Hammer,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  RotateCcw,
  Save,
} from "lucide-react";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

const EMPLOYEE_RANGE_OPTIONS = toOptions(EMPLOYEE_RANGE_LABELS);

const BANNER_ASPECT = 4;
const LOGO_ASPECT = 1;

const emptyValues: CompanyProfileFormValues = {
  name: "",
  legalName: "",
  industry: "",
  employeeRange: "1-50",
  foundedYear: new Date().getFullYear(),
  registrationNo: "",
  taxId: "",
  email: "",
  phone: "",
  supportPhone: "",
  website: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Bangladesh",
  tagline: "",
  about: "",
  logoUrl: "",
  logoPublicId: "",
  bannerUrl: "",
  bannerPublicId: "",
};

export default function CompanyProfilePage() {
  const { data } = useGetMyCompanyQuery();
  const company = data?.company;

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(CompanyProfileSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (!company) return;
    form.reset({
      ...emptyValues,
      name: company.name,
      email: company.email,
      phone: company.phone ?? "",
      address: company.address ?? "",
      employeeRange: company.employeeRange,
    });
  }, [company, form]);

  const logoUrl = useWatch({ control: form.control, name: "logoUrl" });
  const logoPublicId = useWatch({ control: form.control, name: "logoPublicId" });
  const bannerUrl = useWatch({ control: form.control, name: "bannerUrl" });
  const bannerPublicId = useWatch({ control: form.control, name: "bannerPublicId" });
  const name = useWatch({ control: form.control, name: "name" });
  const tagline = useWatch({ control: form.control, name: "tagline" });

  const [isSaving, setIsSaving] = React.useState(false);

  const onSubmit = (values: CompanyProfileFormValues) => {
    setIsSaving(true);
    window.setTimeout(() => {
      setIsSaving(false);
      form.reset(values);
      toast.success("Company profile captured — not saved yet, the API is still to come");
    }, 500);
  };

  return (
    <>
      <PageHeader
        title="Company Profile"
        description="How your company is presented across HRMS, SME and CRM."
        actions={
          <Badge variant="secondary" className="px-2.5 py-1">
            <Hammer className="size-3" />
            UI only
          </Badge>
        }
      />

      <Form {...form}>
        <form className="flex flex-col gap-4 xl:gap-6" onSubmit={form.handleSubmit(onSubmit)}>
          <SectionCard
            icon={ImageIcon}
            title="Branding"
            description="The logo and banner shown on invoices, payslips and the portal header."
            contentClassName="gap-5"
          >
            <div className="overflow-hidden rounded-xl border">
              <div
                className="relative w-full bg-gradient-to-r from-primary/25 via-primary/10 to-transparent"
                style={{ aspectRatio: String(BANNER_ASPECT) }}
              >
                {bannerUrl && (
                  <img
                    src={bannerUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex items-end gap-4 px-4 pb-4 sm:px-6">
                <span className="-mt-8 flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-background shadow-sm sm:size-20">
                  {logoUrl ? (
                    <img src={logoUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <Building2 className="size-7 text-muted-foreground" />
                  )}
                </span>
                <div className="min-w-0 flex-1 pt-3">
                  <p className="truncate text-base font-semibold">
                    {name || "Your company name"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {tagline || "A short tagline shown under the name"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FileUploader
                value={logoUrl}
                publicId={logoPublicId}
                folder="general"
                label="Company logo"
                description="Square image, at least 256×256. PNG or SVG works best."
                cropAspect={LOGO_ASPECT}
                cropMaxWidth={512}
                cropTitle="Position your logo"
                cropDescription="Drag to reposition and zoom until the logo sits the way you want it."
                onChange={(asset) => {
                  form.setValue("logoUrl", asset?.url ?? "", { shouldDirty: true });
                  form.setValue("logoPublicId", asset?.publicId ?? "", { shouldDirty: true });
                }}
              />
              <FileUploader
                value={bannerUrl}
                publicId={bannerPublicId}
                folder="general"
                label="Company banner"
                description="Wide image, around 1600×400."
                cropAspect={BANNER_ASPECT}
                cropMaxWidth={1600}
                cropTitle="Position your banner"
                cropDescription="Drag to reposition and zoom until the banner is framed the way you want it."
                onChange={(asset) => {
                  form.setValue("bannerUrl", asset?.url ?? "", { shouldDirty: true });
                  form.setValue("bannerPublicId", asset?.publicId ?? "", { shouldDirty: true });
                }}
              />
            </div>
          </SectionCard>

          <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:gap-6">
            <SectionCard
              icon={Building2}
              title="Identity"
              description="The legal and trading details of this company."
            >
              <FormInput
                control={form.control}
                name="name"
                label="Company name"
                placeholder="Vertoone Ltd."
              />
              <FormInput
                control={form.control}
                name="legalName"
                label="Registered legal name"
                placeholder="Vertoone Private Limited"
                description="Used on invoices and contracts when it differs from the trading name."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="industry"
                  label="Industry"
                  placeholder="Software & IT services"
                />
                <FormSelect
                  control={form.control}
                  name="employeeRange"
                  label="Company size"
                  options={EMPLOYEE_RANGE_OPTIONS}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormInput
                  control={form.control}
                  name="foundedYear"
                  label="Founded"
                  type="number"
                  min={1800}
                />
                <FormInput
                  control={form.control}
                  name="registrationNo"
                  label="Registration no."
                  placeholder="C-123456"
                />
                <FormInput
                  control={form.control}
                  name="taxId"
                  label="TIN / BIN"
                  placeholder="123456789012"
                />
              </div>
              <FormInput
                control={form.control}
                name="tagline"
                label="Tagline"
                placeholder="Business software that fits how you already work"
              />
            </SectionCard>

            <SectionCard
              icon={Mail}
              title="Contact"
              description="Where customers, employees and suppliers reach this company."
            >
              <FormInput
                control={form.control}
                name="email"
                label="Company email"
                type="email"
                placeholder="hello@company.com"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormPhone control={form.control} name="phone" label="Primary phone" />
                <FormPhone control={form.control} name="supportPhone" label="Support phone" />
              </div>
              <FormInput
                control={form.control}
                name="website"
                label="Website"
                placeholder="https://company.com"
              />
              <FormTextarea
                control={form.control}
                name="about"
                label="About"
                placeholder="A short description of what the company does."
                className="[&_textarea]:min-h-28"
              />
            </SectionCard>
          </div>

          <SectionCard
            icon={MapPin}
            title="Address"
            description="The registered address printed on official documents."
          >
            <FormInput
              control={form.control}
              name="address"
              label="Street address"
              placeholder="House 12, Road 5, Banani"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormInput control={form.control} name="city" label="City" placeholder="Dhaka" />
              <FormInput
                control={form.control}
                name="state"
                label="State / Division"
                placeholder="Dhaka"
              />
              <FormInput
                control={form.control}
                name="postalCode"
                label="Postal code"
                placeholder="1213"
              />
              <FormInput
                control={form.control}
                name="country"
                label="Country"
                placeholder="Bangladesh"
              />
            </div>
          </SectionCard>

          <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background/95 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-sm text-muted-foreground">
              {form.formState.isDirty ? "You have unsaved changes." : "Everything is up to date."}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={!form.formState.isDirty || isSaving}
                onClick={() => form.reset()}
              >
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Reset
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-4 w-4" />
                )}
                Save changes
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
