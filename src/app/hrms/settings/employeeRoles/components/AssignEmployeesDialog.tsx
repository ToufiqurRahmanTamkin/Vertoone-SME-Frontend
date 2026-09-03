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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import {
  useAssignEmployeeRoleMutation,
  useGetEmployeeRoleHoldersQuery,
} from "@/redux/apis/employeeRoleApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { EmployeeRole } from "@/types/domain/employeeRole";
import { Loader2, Search } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface AssignEmployeesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: EmployeeRole | null;
}

export function AssignEmployeesDialog({ open, onOpenChange, role }: AssignEmployeesDialogProps) {
  const { data: employeeOptions = [], isLoading: isLoadingEmployees } = useGetEmployeeOptionsQuery(
    undefined,
    { skip: !open }
  );
  const { data: holders, isLoading: isLoadingHolders } = useGetEmployeeRoleHoldersQuery(
    role?._id ?? "",
    { skip: !open || !role }
  );

  const [assignRole, { isLoading: isSaving }] = useAssignEmployeeRoleMutation();

  const [selected, setSelected] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");

  const seedKey = open && role && holders ? `${role._id}:${holders.join(",")}` : null;
  const [seededFor, setSeededFor] = React.useState<string | null>(null);

  if (seedKey !== seededFor) {
    setSeededFor(seedKey);
    setSelected(seedKey === null ? [] : (holders ?? []));
    setSearch("");
  }

  const isLoading = isLoadingEmployees || isLoadingHolders;

  const visible = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return employeeOptions;
    return employeeOptions.filter(
      (option) =>
        option.name.toLowerCase().includes(needle) ||
        (option.employeeCode ?? "").toLowerCase().includes(needle)
    );
  }, [employeeOptions, search]);

  const toggle = (employeeId: string) =>
    setSelected((current) =>
      current.includes(employeeId)
        ? current.filter((value) => value !== employeeId)
        : [...current, employeeId]
    );

  const onSave = async () => {
    if (!role) return;
    try {
      await assignRole({ id: role._id, employeeIds: selected }).unwrap();
      toast.success(
        selected.length > 0
          ? `${role.name} assigned to ${selected.length} employee${
              selected.length === 1 ? "" : "s"
            }`
          : `${role.name} is no longer assigned to anybody`
      );
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update the assignments");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign {role?.name ?? ""}</DialogTitle>
          <DialogDescription>
            Everybody you tick here reaches the menus this role grants the moment you save. Anything
            they hold through another role stays.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees..."
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : visible.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
              {employeeOptions.length === 0
                ? "No employees yet. Add them under HRMS → Employees."
                : "No employee matches that search."}
            </p>
          ) : (
            <div className="max-h-72 divide-y overflow-y-auto rounded-lg border">
              {visible.map((option) => (
                <label
                  key={option._id}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/40"
                >
                  <Checkbox
                    checked={selected.includes(option._id)}
                    onCheckedChange={() => toggle(option._id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{option.name}</span>
                    {option.employeeCode && (
                      <span className="block truncate font-mono text-[11px] uppercase text-muted-foreground">
                        {option.employeeCode}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{selected.length}</span> of{" "}
            {employeeOptions.length} employees selected.
          </p>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={isSaving || isLoading || !role}
            onClick={onSave}
          >
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            Save assignments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
