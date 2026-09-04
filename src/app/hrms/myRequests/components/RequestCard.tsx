import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAmountValue } from "@/lib/amount";
import { formatDate, formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useAddEmployeeRequestMessageMutation } from "@/redux/apis/employeeRequestApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  EMPLOYEE_REQUEST_STATUS_COLORS,
  REQUEST_PRIORITY_COLORS,
  formatRequestHours,
  type EmployeeRequest,
} from "@/types/domain/employeeRequest";
import { Loader2, Paperclip, Send } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import type { RequestKindConfig } from "./requestKinds";

interface RequestCardProps {
  request: EmployeeRequest;
  config: RequestKindConfig;
  onWithdraw: (request: EmployeeRequest) => void;
}

interface Detail {
  label: string;
  value: string;
}

const detailsFor = (request: EmployeeRequest, config: RequestKindConfig): Detail[] => {
  const { fields } = config;
  const details: Detail[] = [];

  if (fields.window && request.startAt && request.endAt) {
    details.push({
      label: `${fields.window.startLabel} / ${fields.window.endLabel}`,
      value: `${formatDateTime(request.startAt)} → ${formatDateTime(request.endAt)}`,
    });
    details.push({ label: "Hours", value: formatRequestHours(request.hours) });
  }

  if (fields.dateRange && request.startDate) {
    details.push({
      label: "Dates",
      value: `${formatDate(request.startDate)} → ${formatDate(request.endDate)}`,
    });
  }

  if (fields.singleDate && !fields.dateRange && request.startDate) {
    details.push({ label: fields.singleDate.label, value: formatDate(request.startDate) });
  }

  if (fields.category && request.categoryLabel) {
    details.push({ label: fields.category.label, value: request.categoryLabel });
  }

  if (fields.location && request.location) {
    details.push({ label: fields.location.label, value: request.location });
  }

  if (fields.addressedTo && request.addressedTo) {
    details.push({ label: fields.addressedTo.label, value: request.addressedTo });
  }

  if (fields.amount && request.amount > 0) {
    details.push({ label: fields.amount.label, value: formatAmountValue(request.amount) });
  }

  if (fields.quantity && request.quantity > 0) {
    details.push({ label: fields.quantity.label, value: String(request.quantity) });
  }

  if (fields.installments && request.installments > 0) {
    details.push({
      label: "Repayment",
      value: `${request.installments} × ${formatAmountValue(request.monthlyInstalment)}`,
    });
  }

  if (fields.profileValues) {
    details.push({
      label: "Change",
      value: `${request.currentValue || "—"} → ${request.requestedValue}`,
    });
  }

  return details;
};

export function RequestCard({ request, config, onWithdraw }: RequestCardProps) {
  const [reply, setReply] = React.useState("");
  const [addMessage, { isLoading: isSending }] = useAddEmployeeRequestMessageMutation();

  const details = detailsFor(request, config);

  const sendReply = async () => {
    if (!reply.trim()) return;
    try {
      await addMessage({ id: request._id, body: { body: reply.trim() } }).unwrap();
      setReply("");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not add your reply");
    }
  };

  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <p className="font-medium">{request.title || request.kindLabel}</p>
          <p className="text-xs text-muted-foreground">Raised {formatDate(request.createdAt)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {config.fields.priority && (
            <StatusBadge
              color={REQUEST_PRIORITY_COLORS[request.priority]}
              label={request.priorityLabel}
            />
          )}
          <StatusBadge
            color={EMPLOYEE_REQUEST_STATUS_COLORS[request.status]}
            label={request.statusLabel}
          />
        </div>
      </div>

      {details.length > 0 && (
        <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
          {details.map((detail) => (
            <p key={detail.label} className="text-sm">
              <span className="text-muted-foreground">{detail.label}: </span>
              <span className="tabular-nums">{detail.value}</span>
            </p>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground">{request.description}</p>

      {request.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {request.attachments.map((attachment, index) => (
            <a
              key={`${attachment.url}-${index}`}
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs hover:bg-muted"
            >
              <Paperclip className="size-3" />
              {attachment.fileName || "Attachment"}
            </a>
          ))}
        </div>
      )}

      {request.reviewedAt && (
        <p className="text-xs text-muted-foreground">
          Decided {formatDateTime(request.reviewedAt)}
          {request.reviewedByName && ` by ${request.reviewedByName}`}
          {request.reviewNote && ` — ${request.reviewNote}`}
        </p>
      )}

      {config.thread && request.messages.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3">
          {request.messages.map((message, index) => (
            <div key={index} className="text-sm">
              <p
                className={cn(
                  "text-xs font-medium",
                  message.isStaff ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                )}
              >
                {message.authorName || (message.isStaff ? "HR" : "You")} ·{" "}
                {formatDateTime(message.createdAt)}
              </p>
              <p>{message.body}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {config.thread && request.isOpen && (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Input
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Add to the conversation"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void sendReply();
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="shrink-0 cursor-pointer"
              onClick={sendReply}
              disabled={isSending || !reply.trim()}
              aria-label="Send reply"
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        )}

        {request.isOpen && (
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => onWithdraw(request)}
          >
            Withdraw
          </Button>
        )}
      </div>
    </div>
  );
}
