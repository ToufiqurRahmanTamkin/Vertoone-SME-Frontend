import { ColorChip } from "@/components/shared/color-chip";
import { cn } from "@/lib/utils";
import type { TagRef } from "@/types/domain/tag";

interface TagListProps {
  tags: TagRef[];
  max?: number;
  className?: string;
  emptyLabel?: string;
}

export function TagList({ tags, max = 3, className, emptyLabel = "—" }: TagListProps) {
  if (tags.length === 0) {
    return <span className="text-xs text-muted-foreground">{emptyLabel}</span>;
  }

  const visible = tags.slice(0, max);
  const hidden = tags.length - visible.length;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {visible.map((tag) => (
        <ColorChip key={tag._id} color={tag.color} label={tag.name} />
      ))}
      {hidden > 0 && (
        <span className="text-xs text-muted-foreground" title={tags.map((t) => t.name).join(", ")}>
          +{hidden}
        </span>
      )}
    </div>
  );
}
