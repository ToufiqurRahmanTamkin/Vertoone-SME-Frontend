import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useConvertLeadMutation } from "@/redux/apis/leadApis";
import { useGetPipelineOptionsQuery } from "@/redux/apis/pipelineApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { Lead } from "@/types/domain/lead";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface ConvertLeadDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canCreateDeal: boolean;
}

export function ConvertLeadDialog({
  lead,
  open,
  onOpenChange,
  canCreateDeal,
}: ConvertLeadDialogProps) {
  const { data: pipelineOptions = [] } = useGetPipelineOptionsQuery(undefined, { skip: !open });
  const [convertLead, { isLoading }] = useConvertLeadMutation();

  const [createDeal, setCreateDeal] = React.useState(true);
  const [pipelineId, setPipelineId] = React.useState("");
  const [dealTitle, setDealTitle] = React.useState("");
  const [dealValue, setDealValue] = React.useState("");
  const [keepLead, setKeepLead] = React.useState(true);

  React.useEffect(() => {
    if (!open || !lead) return;
    setCreateDeal(canCreateDeal);
    setDealTitle(lead.title);
    setDealValue(lead.estimatedValue > 0 ? String(lead.estimatedValue) : "");
    setKeepLead(true);
  }, [open, lead, canCreateDeal]);

  React.useEffect(() => {
    if (!open || pipelineId) return;
    const first = pipelineOptions[0];
    if (first) setPipelineId(first._id);
  }, [open, pipelineId, pipelineOptions]);

  const hasPipeline = pipelineOptions.length > 0;
  const wantsDeal = createDeal && canCreateDeal && hasPipeline;

  const confirm = async () => {
    if (!lead) return;

    try {
      const result = await convertLead({
        id: lead._id,
        body: {
          keepLead,
          createDeal: wantsDeal,
          pipelineId: wantsDeal ? pipelineId : null,
          dealTitle: wantsDeal ? dealTitle : undefined,
          dealValue: wantsDeal && dealValue !== "" ? Number(dealValue) : undefined,
        },
      }).unwrap();

      toast.success(
        result.dealId
          ? "Lead converted to a contact, and a deal was opened"
          : "Lead converted to a contact"
      );
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not convert the lead");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Convert &quot;{lead?.title ?? ""}&quot;</DialogTitle>
          <DialogDescription>
            The person, company, source and tags are copied onto a new contact and the lead is
            marked won. Open a deal at the same time to keep the pipeline moving.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          {canCreateDeal && (
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Checkbox
                id="convert-create-deal"
                checked={createDeal}
                disabled={!hasPipeline}
                onCheckedChange={(checked) => setCreateDeal(checked === true)}
              />
              <div className="min-w-0 space-y-1">
                <Label htmlFor="convert-create-deal" className="cursor-pointer">
                  Open a deal from this lead
                </Label>
                <p className="text-xs text-muted-foreground">
                  {hasPipeline
                    ? "The deal carries the contact, source, tags and expected close date across."
                    : "Create a pipeline first — a deal has to sit on one."}
                </p>
              </div>
            </div>
          )}

          {wantsDeal && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="convert-deal-title">Deal title</Label>
                <Input
                  id="convert-deal-title"
                  value={dealTitle}
                  onChange={(event) => setDealTitle(event.target.value)}
                  maxLength={120}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="convert-pipeline">Pipeline</Label>
                <Select value={pipelineId} onValueChange={setPipelineId}>
                  <SelectTrigger id="convert-pipeline" className="w-full">
                    <SelectValue placeholder="Pick a pipeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {pipelineOptions.map((pipeline) => (
                      <SelectItem key={pipeline._id} value={pipeline._id}>
                        {pipeline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="convert-deal-value">Value</Label>
                <Input
                  id="convert-deal-value"
                  type="number"
                  min={0}
                  value={dealValue}
                  onChange={(event) => setDealValue(event.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Checkbox
              id="convert-keep-lead"
              checked={keepLead}
              onCheckedChange={(checked) => setKeepLead(checked === true)}
            />
            <div className="min-w-0 space-y-1">
              <Label htmlFor="convert-keep-lead" className="cursor-pointer">
                Keep the lead active
              </Label>
              <p className="text-xs text-muted-foreground">
                Turn this off to retire the lead once it has become a contact.
              </p>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isLoading || (wantsDeal && !pipelineId)}
            onClick={() => void confirm()}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Convert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
