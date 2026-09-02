import { FormCheckbox, FormTextarea } from "@/components/shared/form-fields";
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
import { useRequestCancellationMutation } from "@/redux/apis/subscriptionRequestApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  CancellationRequestSchema,
  type CancellationRequestFormValues,
} from "@/validations/subscriptionRequest";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CancelSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  erasesData: boolean;
}

export function CancelSubscriptionModal({
  open,
  onOpenChange,
  planName,
  erasesData,
}: CancelSubscriptionModalProps) {
  const [requestCancellation, { isLoading }] = useRequestCancellationMutation();

  const form = useForm<CancellationRequestFormValues>({
    resolver: zodResolver(CancellationRequestSchema),
    defaultValues: { reason: "", confirmation: false },
  });

  React.useEffect(() => {
    if (open) form.reset({ reason: "", confirmation: false });
  }, [open, form]);

  const onSubmit = async (values: CancellationRequestFormValues) => {
    try {
      await requestCancellation({ reason: values.reason }).unwrap();
      toast.success("Cancellation request sent for review");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not send the cancellation request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cancel {planName}</DialogTitle>
          <DialogDescription>
            Your request goes to our team for review. Your subscription keeps running until it is
            approved.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <div
                className={
                  erasesData
                    ? "flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm"
                    : "flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm"
                }
              >
                <AlertTriangle
                  className={
                    erasesData
                      ? "mt-0.5 h-4 w-4 shrink-0 text-destructive"
                      : "mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                  }
                />
                <p className="text-muted-foreground">
                  {erasesData ? (
                    <>
                      Your trial has already ended, so once this is approved{" "}
                      <span className="font-medium text-foreground">
                        every record your company holds is permanently erased
                      </span>{" "}
                      — users, finance, documents and every module. This cannot be undone, and any
                      refund due is worked out from the days you have not used, less a 30% system
                      charge.
                    </>
                  ) : (
                    <>
                      You are still inside your trial, so no bill has been raised yet. Cancelling
                      now closes the subscription and your data is left untouched.
                    </>
                  )}
                </p>
              </div>

              <FormTextarea
                control={form.control}
                name="reason"
                label="Why are you cancelling?"
                placeholder="Tell us what did not work for you."
                showCharCount={false}
                rows={4}
              />

              <FormCheckbox
                control={form.control}
                name="confirmation"
                label={
                  erasesData
                    ? "I understand all of my company data will be permanently deleted and cannot be recovered."
                    : "I understand my subscription will be closed once this is approved."
                }
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Keep my plan
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request cancellation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
