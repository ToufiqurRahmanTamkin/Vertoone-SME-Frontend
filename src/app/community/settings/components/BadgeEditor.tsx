import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  COMMUNITY_BADGE_ICONS,
  type CommunityBadgeIcon,
} from "@/types/domain/community";
import type { CommunityBadgeFormValues } from "@/validations/community";
import {
  Award,
  Crown,
  Flame,
  Heart,
  Medal,
  Plus,
  Rocket,
  Sparkles,
  Star,
  Target,
  ThumbsUp,
  Trash2,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

const BADGE_ICON_COMPONENTS: Record<CommunityBadgeIcon, LucideIcon> = {
  Award,
  Medal,
  Trophy,
  Star,
  Crown,
  Flame,
  Sparkles,
  Heart,
  ThumbsUp,
  Zap,
  Target,
  Rocket,
};

const ICON_OPTIONS = COMMUNITY_BADGE_ICONS.map((icon) => ({ label: icon, value: icon }));

interface BadgeEditorProps {
  value: CommunityBadgeFormValues[];
  onChange: (value: CommunityBadgeFormValues[]) => void;
  disabled?: boolean;
}

const emptyBadge = (): CommunityBadgeFormValues => ({
  name: "",
  description: "",
  icon: "Award",
  color: "#f59e0b",
  pointsRequired: 100,
  isActive: true,
});

export function BadgeEditor({ value, onChange, disabled = false }: BadgeEditorProps) {
  const update = (index: number, patch: Partial<CommunityBadgeFormValues>) => {
    onChange(value.map((badge, position) => (position === index ? { ...badge, ...patch } : badge)));
  };

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          No badges yet. Add one and people earn it once they pass the points you set.
        </p>
      )}

      {value.map((badge, index) => {
        const Icon = BADGE_ICON_COMPONENTS[badge.icon] ?? Award;

        return (
          <div key={index} className="rounded-lg border bg-muted/20 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background"
                style={{ color: badge.color }}
              >
                <Icon className="size-4.5" />
              </span>

              <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`badge-name-${index}`}>Name</Label>
                  <Input
                    id={`badge-name-${index}`}
                    value={badge.name}
                    maxLength={60}
                    disabled={disabled}
                    placeholder="First Post"
                    onChange={(event) => update(index, { name: event.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`badge-points-${index}`}>Points needed</Label>
                  <Input
                    id={`badge-points-${index}`}
                    type="number"
                    min={0}
                    value={badge.pointsRequired}
                    disabled={disabled}
                    onChange={(event) => update(index, { pointsRequired: event.target.value })}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`badge-description-${index}`}>What it is for</Label>
                  <Input
                    id={`badge-description-${index}`}
                    value={badge.description}
                    maxLength={200}
                    disabled={disabled}
                    placeholder="Shared their first post with the company"
                    onChange={(event) => update(index, { description: event.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`badge-icon-${index}`}>Icon</Label>
                  <Select
                    value={badge.icon}
                    disabled={disabled}
                    onValueChange={(icon) => update(index, { icon: icon as CommunityBadgeIcon })}
                  >
                    <SelectTrigger id={`badge-icon-${index}`} className="w-full cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="cursor-pointer"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`badge-color-${index}`}>Colour</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`badge-color-${index}`}
                      type="color"
                      value={badge.color}
                      disabled={disabled}
                      className="h-9 w-14 cursor-pointer p-1"
                      onChange={(event) => update(index, { color: event.target.value })}
                    />
                    <Input
                      value={badge.color}
                      disabled={disabled}
                      className="font-mono"
                      onChange={(event) =>
                        update(index, { color: event.target.value.toLowerCase() })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:col-span-2">
                  <Switch
                    id={`badge-active-${index}`}
                    checked={badge.isActive}
                    disabled={disabled}
                    onCheckedChange={(isActive) => update(index, { isActive })}
                  />
                  <Label htmlFor={`badge-active-${index}`} className="cursor-pointer">
                    People can earn this badge
                  </Label>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 cursor-pointer"
                aria-label={`Remove ${badge.name || "badge"}`}
                disabled={disabled}
                onClick={() => onChange(value.filter((_, position) => position !== index))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        className="w-full cursor-pointer"
        disabled={disabled || value.length >= 20}
        onClick={() => onChange([...value, emptyBadge()])}
      >
        <Plus className="size-4" />
        Add a badge
      </Button>
    </div>
  );
}
