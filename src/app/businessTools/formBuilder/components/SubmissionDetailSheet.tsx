import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useGetSubmissionQuery } from "@/redux/apis/formBuilderApis";
import { Ban, Mail, Trash2 } from "lucide-react";
import { answerToText } from "../formBuilder.utils";

interface SubmissionDetailSheetProps {
  formId: string;
  submissionId: string | null;
  canEdit: boolean;
  canDelete: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleSpam: (id: string, isSpam: boolean) => void;
  onDelete: (id: string) => void;
}

export function SubmissionDetailSheet({
  formId,
  submissionId,
  canEdit,
  canDelete,
  onOpenChange,
  onToggleSpam,
  onDelete,
}: SubmissionDetailSheetProps) {
  const { data: submission, isLoading } = useGetSubmissionQuery(
    { formId, id: submissionId ?? "" },
    { skip: !submissionId }
  );

  return (
    <Sheet open={Boolean(submissionId)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>Response</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {isLoading || !submission ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {new Date(submission.submittedAt).toLocaleString()}
                </Badge>
                <Badge variant="outline">
                  {submission.source === "EMBEDDED" ? "From a website" : "From the link"}
                </Badge>
                {submission.isSpam && <Badge variant="destructive">Spam</Badge>}
              </div>

              <dl className="divide-y rounded-xl border">
                {submission.answers.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    This response has no answers.
                  </div>
                ) : (
                  submission.answers.map((answer) => (
                    <div key={answer.key} className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-3">
                      <dt className="text-xs font-medium text-muted-foreground sm:col-span-1">
                        {answer.label}
                      </dt>
                      <dd className="whitespace-pre-wrap break-words text-sm sm:col-span-2">
                        {answerToText(answer)}
                      </dd>
                    </div>
                  ))
                )}
              </dl>

              {(submission.referer || submission.userAgent) && (
                <div className="space-y-1.5 rounded-xl border bg-muted/20 p-4">
                  <p className="text-xs font-semibold text-muted-foreground">Where it came from</p>
                  {submission.referer && (
                    <p className="break-all font-mono text-[11px] text-muted-foreground">
                      {submission.referer}
                    </p>
                  )}
                  {submission.userAgent && (
                    <p className="break-all font-mono text-[11px] text-muted-foreground">
                      {submission.userAgent}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 border-t pt-4">
                {submission.contactEmail && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${submission.contactEmail}`}>
                      <Mail className="mr-2 size-4" />
                      Reply
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canEdit}
                  onClick={() => onToggleSpam(submission._id, !submission.isSpam)}
                >
                  <Ban className="mr-2 size-4" />
                  {submission.isSpam ? "Not spam" : "Mark as spam"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={!canDelete}
                  onClick={() => onDelete(submission._id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
