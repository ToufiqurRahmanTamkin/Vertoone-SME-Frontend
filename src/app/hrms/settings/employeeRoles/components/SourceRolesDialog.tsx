import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { useUpdateEmployeeAccessRolesMutation } from "@/redux/apis/employeeAccessApis";
import { useGetRoleOptionsQuery } from "@/redux/apis/roleApis";
import type { ApiErrorResponse } from "@/redux/baseApi";
import {
  EMPLOYEE_ACCESS_SOURCE_LABELS,
  type EmployeeAccessSource,
} from "@/types/domain/employeeAccess";
import { Check, Loader2 } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface SourceRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: EmployeeAccessSource | null;
}

export function SourceRolesDialog({ open, onOpenChange, source }: SourceRolesDialogProps) {
  const { data: roleOptions = [] } = useGetRoleOptionsQuery(undefined, { skip: !open });
  const [updateRoles, { isLoading: isSaving }] = useUpdateEmployeeAccessRolesMutation();

  const [roleIds, setRoleIds] = React.useState<string[]>([]);
  const seedKey = source ? `${source.type}:${source._id}` : null;
  const [seededFor, setSeededFor] = React.useState<string | null>(null);

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setRoleIds(source ? source.roles.map((role) => role._id) : []);
  }

  const toggleRole = (roleId: string) =>
    setRoleIds((current) =>
      current.includes(roleId)
        ? current.filter((value) => value !== roleId)
        : [...current, roleId]
    );

  const onSave = async () => {
    if (!source) return;
    try {
      await updateRoles({ type: source.type, id: source._id, roleIds }).unwrap();
      toast.success(`Roles updated for ${source.name}`);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update the roles");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Roles for {source?.name ?? ""}</DialogTitle>
          <DialogDescription>
            {source
              ? `Every employee in this ${EMPLOYEE_ACCESS_SOURCE_LABELS[
                  source.type
                ].toLowerCase()} inherits the menus these roles grant, on top of anything granted to them personally.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-3">
          {roleOptions.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
              No roles yet. Create one under{" "}
              <Link
                to="/settings/users-and-roles/roles-and-permissions"
                className="underline underline-offset-2"
              >
                Roles &amp; Permissions
              </Link>
              .
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {roleOptions.map((role) => {
                  const selected = roleIds.includes(role._id);
                  return (
                    <Badge
                      key={role._id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selected}
                      variant={selected ? "default" : "outline"}
                      className={cn("cursor-pointer select-none gap-1 py-1")}
                      onClick={() => toggleRole(role._id)}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        toggleRole(role._id);
                      }}
                    >
                      {selected && <Check className="h-3 w-3" />}
                      {role.name}
                    </Badge>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{roleIds.length}</span> of{" "}
                {roleOptions.length} roles selected. Access is applied the moment you save.
              </p>
            </>
          )}

          {source && source.directModuleCount > 0 && (
            <p className="rounded-lg border border-dashed bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              This {EMPLOYEE_ACCESS_SOURCE_LABELS[source.type].toLowerCase()} also grants{" "}
              {source.directModuleCount} menu
              {source.directModuleCount === 1 ? "" : "s"} directly. Edit the record itself to change
              those.
            </p>
          )}
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={isSaving || !source}
            onClick={onSave}
          >
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            Save roles
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
