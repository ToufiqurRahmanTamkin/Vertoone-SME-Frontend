import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";

interface SettingsFormFooterProps {
  canEdit: boolean;
  isDirty: boolean;
  isSaving: boolean;
  onReset: () => void;
  saveLabel?: string;
}

export function SettingsFormFooter({
  canEdit,
  isDirty,
  isSaving,
  onReset,
  saveLabel = "Save changes",
}: SettingsFormFooterProps) {
  if (!canEdit) {
    return (
      <p className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
        <Lock className="size-4 shrink-0" />
        You can read these rules but not change them. Ask an administrator for edit access.
      </p>
    );
  }

  return (
    <div className="sticky bottom-0 z-10 -mx-1 flex flex-col-reverse gap-2 border-t bg-background/95 px-1 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        onClick={onReset}
        disabled={!isDirty || isSaving}
      >
        Discard changes
      </Button>
      <Button type="submit" className="cursor-pointer" disabled={!isDirty || isSaving}>
        {isSaving && <Loader2 className="size-4 animate-spin" />}
        {saveLabel}
      </Button>
    </div>
  );
}
