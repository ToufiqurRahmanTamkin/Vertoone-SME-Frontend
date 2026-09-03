import { FormSelect } from "@/components/shared/form-fields";
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
import { useCopyHolidayYearMutation } from "@/redux/apis/holidayApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { CopyHolidaysSchema, type CopyHolidaysFormValues } from "@/validations/holiday";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CopyYearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  years: number[];
  currentYear: number;
}

export function CopyYearDialog({ open, onOpenChange, years, currentYear }: CopyYearDialogProps) {
  const [copyYear, { isLoading }] = useCopyHolidayYearMutation();

  const targetYears = React.useMemo(() => {
    const span = new Set([...years, currentYear, currentYear + 1, currentYear - 1]);
    return [...span].sort((a, b) => b - a).map((year) => ({ value: String(year), label: String(year) }));
  }, [years, currentYear]);

  const sourceYears = React.useMemo(
    () => years.sort((a, b) => b - a).map((year) => ({ value: String(year), label: String(year) })),
    [years]
  );

  const form = useForm<CopyHolidaysFormValues>({
    resolver: zodResolver(CopyHolidaysSchema),
    defaultValues: { fromYear: String(currentYear), toYear: String(currentYear + 1) },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({ fromYear: String(currentYear), toYear: String(currentYear + 1) });
  }, [open, currentYear, form]);

  const onSubmit = async (values: CopyHolidaysFormValues) => {
    try {
      const created = await copyYear({
        fromYear: Number(values.fromYear),
        toYear: Number(values.toYear),
      }).unwrap();

      toast.success(
        created.length > 0
          ? `${created.length} holidays copied into ${values.toYear}`
          : `Every holiday from ${values.fromYear} is already in ${values.toYear}`
      );
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not copy the calendar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copy a year</DialogTitle>
          <DialogDescription>
            Every holiday moves to the same date in the target year. Names already there are
            skipped, so running this twice is safe.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                control={form.control}
                name="fromYear"
                label="Copy from"
                options={sourceYears}
              />
              <FormSelect
                control={form.control}
                name="toYear"
                label="Copy into"
                options={targetYears}
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isLoading}>
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                Copy holidays
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
