import { RowActions } from "@/components/shared/row-actions";
import type { UserGuide } from "@/types/domain/guide";
import { Pencil, Trash2 } from "lucide-react";

export interface GuideRowActionHandlers {
  onEdit: (guide: UserGuide) => void;
  onDelete: (guide: UserGuide) => void;
}

export function GuideRowActions({
  guide,
  onEdit,
  onDelete,
}: GuideRowActionHandlers & { guide: UserGuide }) {
  return (
    <RowActions
      label={`Actions for ${guide.title}`}
      actions={[
        { key: "edit", label: "Edit", icon: Pencil, onSelect: () => onEdit(guide) },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          onSelect: () => onDelete(guide),
        },
      ]}
    />
  );
}
