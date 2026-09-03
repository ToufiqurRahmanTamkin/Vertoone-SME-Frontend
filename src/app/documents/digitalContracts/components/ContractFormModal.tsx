import { DocumentUploader } from "@/components/shared/document-uploader";
import {
  FormDate,
  FormInput,
  FormMultiSelect,
  FormSelect,
  FormTextarea,
  type MultiSelectOption,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useCreateContractMutation,
  useUpdateContractMutation,
} from "@/redux/apis/contractApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { useGetTagOptionsQuery } from "@/redux/apis/tagApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  CONTRACT_SIGNING_ORDERS,
  CONTRACT_SIGNING_ORDER_LABELS,
  type Contract,
  type ContractSignerPayload,
} from "@/types/domain/contract";
import type { DocumentFile } from "@/types/domain/document";
import { ContractSchema, type ContractFormValues } from "@/validations/contract";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, UserPlus } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ContractFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: Contract | null;
}

const ORDER_OPTIONS = CONTRACT_SIGNING_ORDERS.map((order) => ({
  label: CONTRACT_SIGNING_ORDER_LABELS[order],
  value: order,
}));

const MAX_SIGNERS = 10;

const emptySigner = (): ContractSignerPayload => ({ name: "", email: "", role: "" });

const emptyValues = (currency: string): ContractFormValues => ({
  title: "",
  description: "",
  message: "",
  counterpartyName: "",
  signingOrder: "PARALLEL",
  value: 0,
  currency,
  startDate: "",
  endDate: "",
  expiresAt: "",
  ownerId: "",
  tagIds: [],
});

export function ContractFormModal({ open, onOpenChange, contract }: ContractFormModalProps) {
  const isEdit = Boolean(contract);

  const { data: config } = useGetSystemConfigQuery();
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();
  const { data: tagOptions = [] } = useGetTagOptionsQuery();

  const [createContract, { isLoading: isCreating }] = useCreateContractMutation();
  const [updateContract, { isLoading: isUpdating }] = useUpdateContractMutation();
  const isSaving = isCreating || isUpdating;

  const defaultCurrency = config?.defaultCurrency ?? "BDT";

  const [file, setFile] = React.useState<DocumentFile | null>(null);
  const [signers, setSigners] = React.useState<ContractSignerPayload[]>([emptySigner()]);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(ContractSchema),
    defaultValues: emptyValues(defaultCurrency),
  });

  const seedKey = open ? (contract?._id ?? "new") : "closed";
  const [seededFor, setSeededFor] = React.useState("closed");

  if (seededFor !== seedKey) {
    setSeededFor(seedKey);
    setFile(contract && open ? contract.file : null);
    setSigners(
      contract && open && contract.signers.length > 0
        ? contract.signers.map((signer) => ({
            name: signer.name,
            email: signer.email,
            role: signer.role,
          }))
        : [emptySigner()]
    );

    form.reset(
      contract && open
        ? {
            title: contract.title,
            description: contract.description,
            message: contract.message,
            counterpartyName: contract.counterpartyName,
            signingOrder: contract.signingOrder,
            value: contract.value,
            currency: contract.currency,
            startDate: contract.startDate ?? "",
            endDate: contract.endDate ?? "",
            expiresAt: contract.expiresAt ?? "",
            ownerId: contract.ownerId ?? "",
            tagIds: contract.tagIds,
          }
        : emptyValues(defaultCurrency)
    );
  }

  const ownerChoices = React.useMemo(
    () => [
      { label: "Unassigned", value: "" },
      ...employeeOptions.map((employee) => ({ label: employee.name, value: employee._id })),
    ],
    [employeeOptions]
  );

  const tagChoices = React.useMemo<MultiSelectOption[]>(
    () => tagOptions.map((tag) => ({ value: tag._id, label: tag.name, color: tag.color })),
    [tagOptions]
  );

  const updateSigner = (index: number, patch: Partial<ContractSignerPayload>) =>
    setSigners((previous) =>
      previous.map((signer, position) =>
        position === index ? { ...signer, ...patch } : signer
      )
    );

  const validSigners = signers.filter(
    (signer) => signer.name.trim() && signer.email.trim()
  );

  const onSubmit = async (values: ContractFormValues) => {
    if (!file) {
      toast.error("Upload the contract file before saving");
      return;
    }
    if (validSigners.length === 0) {
      toast.error("Add at least one signer with a name and an email");
      return;
    }

    const body = {
      title: values.title,
      description: values.description,
      message: values.message,
      counterpartyName: values.counterpartyName,
      signingOrder: values.signingOrder,
      signers: validSigners.map((signer) => ({
        name: signer.name.trim(),
        email: signer.email.trim().toLowerCase(),
        role: signer.role?.trim() || undefined,
      })),
      value: values.value,
      currency: values.currency,
      startDate: values.startDate || null,
      endDate: values.endDate || null,
      expiresAt: values.expiresAt || null,
      ownerId: values.ownerId || null,
      tagIds: values.tagIds,
    };

    try {
      if (contract) {
        await updateContract({ id: contract._id, body: { ...body, file } }).unwrap();
        toast.success("Draft updated");
      } else {
        await createContract({ ...body, file }).unwrap();
        toast.success("Contract drafted — send it when you are ready");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the contract");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit draft contract" : "New contract"}</DialogTitle>
          <DialogDescription>
            Upload the document, say who needs to sign it, and it stays a draft until you send it.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
          >
            <DialogBody className="space-y-3">
              <DocumentUploader
                value={file}
                onChange={setFile}
                folder="contracts"
                label="The document to be signed"
                description="A PDF is best — it is what the signer will read."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="title"
                  label="Title"
                  placeholder="Master services agreement"
                />
                <FormInput
                  control={form.control}
                  name="counterpartyName"
                  label="Other party"
                  placeholder="Acme Ltd"
                />
              </div>

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                placeholder="What this contract covers (optional)"
                rows={2}
              />

              <FormTextarea
                control={form.control}
                name="message"
                label="Message to the signers"
                placeholder="This goes in the email they receive (optional)"
                rows={2}
              />

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Signers</p>
                  <p className="text-xs text-muted-foreground">
                    Each one gets their own private link by email.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  disabled={signers.length >= MAX_SIGNERS}
                  onClick={() => setSigners((previous) => [...previous, emptySigner()])}
                >
                  <Plus className="size-3.5" />
                  Add signer
                </Button>
              </div>

              <div className="space-y-2">
                {signers.map((signer, index) => (
                  <div
                    key={index}
                    className="grid items-end gap-2 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[1fr_1fr_9rem_auto]"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor={`signer-name-${index}`} className="text-xs">
                        Name
                      </Label>
                      <Input
                        id={`signer-name-${index}`}
                        value={signer.name}
                        maxLength={120}
                        placeholder="Jane Doe"
                        onChange={(event) => updateSigner(index, { name: event.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`signer-email-${index}`} className="text-xs">
                        Email
                      </Label>
                      <Input
                        id={`signer-email-${index}`}
                        type="email"
                        value={signer.email}
                        maxLength={160}
                        placeholder="jane@acme.com"
                        onChange={(event) => updateSigner(index, { email: event.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`signer-role-${index}`} className="text-xs">
                        Role
                      </Label>
                      <Input
                        id={`signer-role-${index}`}
                        value={signer.role ?? ""}
                        maxLength={60}
                        placeholder="Director"
                        onChange={(event) => updateSigner(index, { role: event.target.value })}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 cursor-pointer text-destructive hover:text-destructive"
                      aria-label={`Remove signer ${index + 1}`}
                      disabled={signers.length === 1}
                      onClick={() =>
                        setSigners((previous) =>
                          previous.filter((_, position) => position !== index)
                        )
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <FormSelect
                control={form.control}
                name="signingOrder"
                label="Signing order"
                options={ORDER_OPTIONS}
                description="Sequential sends the next link only once the one before has signed."
              />

              <Separator />

              <div className="grid gap-3 sm:grid-cols-3">
                <FormInput
                  control={form.control}
                  name="value"
                  label="Contract value"
                  type="number"
                  min={0}
                />
                <FormInput
                  control={form.control}
                  name="currency"
                  label="Currency"
                  placeholder="BDT"
                />
                <FormSelect
                  control={form.control}
                  name="ownerId"
                  label="Owner"
                  options={ownerChoices}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <FormDate control={form.control} name="startDate" label="Starts" />
                <FormDate control={form.control} name="endDate" label="Ends" />
                <FormDate
                  control={form.control}
                  name="expiresAt"
                  label="Sign before"
                  description="The link stops working after this"
                />
              </div>

              <FormMultiSelect
                control={form.control}
                name="tagIds"
                label="Tags"
                options={tagChoices}
                placeholder="Tag this contract"
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isSaving || !file || validSigners.length === 0}
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                {isEdit ? "Save draft" : "Create draft"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
