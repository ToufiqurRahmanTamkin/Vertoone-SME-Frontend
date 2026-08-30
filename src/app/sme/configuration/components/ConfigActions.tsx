import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Save } from "lucide-react";

export interface ConfigActionsProps {
  isDirty: boolean;
  isSaving?: boolean;
  onReset: () => void;
  savedLabel?: string;
}

export function ConfigActions({
  isDirty,
  isSaving = false,
  onReset,
  savedLabel = "Everything is saved.",
}: ConfigActionsProps) {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm">
        {isDirty ? "You have unsaved changes." : savedLabel}
      </p>
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          disabled={isSaving || !isDirty}
          onClick={onReset}
        >
          <RotateCcw className="mr-1.5 h-4 w-4" />
          Reset
        </Button>
        <Button type="submit" className="cursor-pointer" disabled={isSaving || !isDirty}>
          {isSaving ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-4 w-4" />
          )}
          Save changes
        </Button>
      </div>
    </div>
  );
}

export default ConfigActions;
