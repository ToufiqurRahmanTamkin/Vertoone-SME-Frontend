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
import { FormInput } from "@/components/shared/form-fields";
import { useTestSendEmailTemplateMutation } from "@/redux/apis/emailBuilderApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { EmailBlock, EmailTheme } from "@/types/domain/emailBuilder";
import { EmailTestSendSchema, type EmailTestSendFormValues } from "@/validations/emailBuilder";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface TestSendDialogProps {
  templateId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blocks: EmailBlock[];
  subject: string;
  preheader: string;
  theme: EmailTheme;
}

export function TestSendDialog({
  templateId,
  open,
  onOpenChange,
  blocks,
  subject,
  preheader,
  theme,
}: TestSendDialogProps) {
  const [testSend, { isLoading }] = useTestSendEmailTemplateMutation();

  const form = useForm<EmailTestSendFormValues>({
    resolver: zodResolver(EmailTestSendSchema),
    defaultValues: { email: "" },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({ email: "" });
  }, [open, form]);

  const onSubmit = async (values: EmailTestSendFormValues) => {
    try {
      const result = await testSend({
        id: templateId,
        body: { email: values.email, blocks, subject, preheader, theme },
      }).unwrap();

      if (result.status === "SENT") {
        toast.success(`Test sent to ${result.email}`);
      } else if (result.status === "SKIPPED") {
        toast.warning("Recorded but not delivered", {
          description: "No SMTP server is configured on this deployment.",
        });
      } else {
        toast.error(result.errorMessage || "The test could not be delivered");
      }

      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not send the test");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send yourself a test</DialogTitle>
          <DialogDescription>
            Sends exactly what you have on screen right now, unsaved changes included, so you can
            see it in a real inbox.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody>
              <FormInput
                control={form.control}
                name="email"
                label="Send to"
                placeholder="you@example.com"
                description="Personalisation fields are filled with sample values."
              />
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Send className="mr-2 size-4" />
                )}
                Send test
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
