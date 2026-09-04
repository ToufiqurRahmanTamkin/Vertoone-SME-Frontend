import { FilePickerDialog } from "@/components/shared/file-picker-dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEmployeeRequestMutation } from "@/redux/apis/employeeRequestApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  REQUEST_PRIORITIES,
  REQUEST_PRIORITY_LABELS,
  type RequestAttachment,
  type RequestPriority,
} from "@/types/domain/employeeRequest";
import { Loader2, Paperclip, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import type { RequestKindConfig } from "./requestKinds";

interface RequestFormModalProps {
  config: RequestKindConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const nowLocal = (): string => new Date().toISOString();

export function RequestFormModal({ config, open, onOpenChange }: RequestFormModalProps) {
  const [session, setSession] = React.useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setSession((current) => current + 1);
        onOpenChange(next);
      }}
    >
      {open && <RequestFormBody key={session} config={config} onOpenChange={onOpenChange} />}
    </Dialog>
  );
}

interface RequestFormBodyProps {
  config: RequestKindConfig;
  onOpenChange: (open: boolean) => void;
}

function RequestFormBody({ config, onOpenChange }: RequestFormBodyProps) {
  const { fields } = config;
  const [createRequest, { isLoading: isSaving }] = useCreateEmployeeRequestMutation();

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState(fields.category?.defaultValue ?? "");
  const [priority, setPriority] = React.useState<RequestPriority>("MEDIUM");
  const [startAt, setStartAt] = React.useState<string | null>(fields.window ? nowLocal() : null);
  const [endAt, setEndAt] = React.useState<string | null>(fields.window ? nowLocal() : null);
  const [startDate, setStartDate] = React.useState<string | null>(
    fields.dateRange || fields.singleDate ? nowLocal() : null
  );
  const [endDate, setEndDate] = React.useState<string | null>(fields.dateRange ? nowLocal() : null);
  const [amount, setAmount] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");
  const [installments, setInstallments] = React.useState("1");
  const [location, setLocation] = React.useState("");
  const [addressedTo, setAddressedTo] = React.useState("");
  const [currentValue, setCurrentValue] = React.useState("");
  const [requestedValue, setRequestedValue] = React.useState("");
  const [attachments, setAttachments] = React.useState<RequestAttachment[]>([]);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const onSubmit = async () => {
    if (description.trim().length < 5) {
      toast.error(`${config.description.label} needs a little more detail`);
      return;
    }
    if (fields.title?.required && !title.trim()) {
      toast.error(`${fields.title.label} is required`);
      return;
    }
    if (fields.location?.required && !location.trim()) {
      toast.error(`${fields.location.label} is required`);
      return;
    }
    if (fields.profileValues && !requestedValue.trim()) {
      toast.error("Say what the corrected value should be");
      return;
    }
    if (fields.amount && config.kind !== "TRAVEL" && Number(amount) <= 0) {
      toast.error(`${fields.amount.label} has to be more than zero`);
      return;
    }

    try {
      await createRequest({
        kind: config.kind,
        ...(fields.title || fields.profileValues ? { title: title.trim() || undefined } : {}),
        description: description.trim(),
        ...(fields.category ? { category } : {}),
        ...(fields.profileValues ? { fieldName: category } : {}),
        ...(fields.priority ? { priority } : {}),
        ...(fields.window ? { startAt, endAt } : {}),
        ...(fields.dateRange ? { startDate, endDate } : {}),
        ...(fields.singleDate && !fields.dateRange ? { startDate } : {}),
        ...(fields.amount ? { amount: Number(amount) || 0 } : {}),
        ...(fields.quantity ? { quantity: Math.max(1, Number(quantity) || 1) } : {}),
        ...(fields.installments ? { installments: Math.max(1, Number(installments) || 1) } : {}),
        ...(fields.location ? { location: location.trim() } : {}),
        ...(fields.addressedTo ? { addressedTo: addressedTo.trim() } : {}),
        ...(fields.profileValues
          ? { currentValue: currentValue.trim(), requestedValue: requestedValue.trim() }
          : {}),
        ...(fields.attachments ? { attachments } : {}),
      }).unwrap();

      toast.success("Request sent");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not send the request");
    }
  };

  return (
    <>
      <DialogContent className="max-h-[90svh] overflow-y-auto md:max-w-lg">
        <DialogHeader>
          <DialogTitle>{config.modalTitle}</DialogTitle>
          <DialogDescription>{config.modalDescription}</DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4 p-4 sm:p-6">
          {fields.title && (
            <div className="space-y-2">
              <Label>{fields.title.label}</Label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={fields.title.placeholder}
              />
            </div>
          )}

          {fields.category && (
            <div className="space-y-2">
              <Label>{fields.category.label}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fields.category.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {fields.category?.labels[option] ?? option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {fields.window && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{fields.window.startLabel}</Label>
                <DatePicker
                  value={startAt}
                  onValueChange={setStartAt}
                  includeTime
                  disableFuture={fields.window.disableFuture}
                />
              </div>
              <div className="space-y-2">
                <Label>{fields.window.endLabel}</Label>
                <DatePicker
                  value={endAt}
                  onValueChange={setEndAt}
                  includeTime
                  disableFuture={fields.window.disableFuture}
                />
              </div>
            </div>
          )}

          {fields.dateRange && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{fields.dateRange.startLabel}</Label>
                <DatePicker value={startDate} onValueChange={setStartDate} dateOnly />
              </div>
              <div className="space-y-2">
                <Label>{fields.dateRange.endLabel}</Label>
                <DatePicker value={endDate} onValueChange={setEndDate} dateOnly />
              </div>
            </div>
          )}

          {fields.singleDate && !fields.dateRange && (
            <div className="space-y-2">
              <Label>{fields.singleDate.label}</Label>
              <DatePicker
                value={startDate}
                onValueChange={setStartDate}
                dateOnly
                clearable={!fields.singleDate.required}
                disableFuture={fields.singleDate.disableFuture}
              />
            </div>
          )}

          {fields.location && (
            <div className="space-y-2">
              <Label>{fields.location.label}</Label>
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder={fields.location.placeholder}
              />
            </div>
          )}

          {fields.addressedTo && (
            <div className="space-y-2">
              <Label>{fields.addressedTo.label}</Label>
              <Input
                value={addressedTo}
                onChange={(event) => setAddressedTo(event.target.value)}
                placeholder={fields.addressedTo.placeholder}
              />
            </div>
          )}

          {(fields.amount || fields.quantity || fields.installments) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.amount && (
                <div className="space-y-2">
                  <Label>{fields.amount.label}</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="0.00"
                  />
                  {fields.amount.help && (
                    <p className="text-xs text-muted-foreground">{fields.amount.help}</p>
                  )}
                </div>
              )}
              {fields.quantity && (
                <div className="space-y-2">
                  <Label>{fields.quantity.label}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                  />
                </div>
              )}
              {fields.installments && (
                <div className="space-y-2">
                  <Label>{fields.installments.label}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    value={installments}
                    onChange={(event) => setInstallments(event.target.value)}
                  />
                  {fields.installments.help && (
                    <p className="text-xs text-muted-foreground">{fields.installments.help}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {fields.profileValues && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>What it says now</Label>
                <Input
                  value={currentValue}
                  onChange={(event) => setCurrentValue(event.target.value)}
                  placeholder="Leave blank if it is empty"
                />
              </div>
              <div className="space-y-2">
                <Label>What it should say</Label>
                <Input
                  value={requestedValue}
                  onChange={(event) => setRequestedValue(event.target.value)}
                  placeholder="The correct value"
                />
              </div>
            </div>
          )}

          {fields.priority && (
            <div className="space-y-2">
              <Label>How urgent</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as RequestPriority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_PRIORITIES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {REQUEST_PRIORITY_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>{config.description.label}</Label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={config.description.placeholder}
              rows={3}
            />
          </div>

          {fields.attachments && (
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="flex flex-col gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={`${attachment.url}-${index}`}
                    className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <span className="truncate">{attachment.fileName || attachment.url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 cursor-pointer"
                      onClick={() =>
                        setAttachments((current) =>
                          current.filter((_, position) => position !== index)
                        )
                      }
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setPickerOpen(true)}
                  disabled={attachments.length >= 5}
                >
                  <Paperclip className="mr-2 size-4" />
                  Attach a file
                </Button>
              </div>
            </div>
          )}
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
          <Button type="button" className="cursor-pointer" onClick={onSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>

      {fields.attachments && (
        <FilePickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          multiple
          title="Attach to your request"
          description="Pick something already in your file manager, or upload it now."
          onSelect={(files) =>
            setAttachments((current) =>
              [
                ...current,
                ...files.map((file) => ({ url: file.url, fileName: file.name || file.fileName })),
              ].slice(0, 5)
            )
          }
        />
      )}
    </>
  );
}
