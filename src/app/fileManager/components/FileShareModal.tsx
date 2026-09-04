import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetFileShareTargetsQuery,
  useShareManagedFileMutation,
} from "@/redux/apis/fileManagerApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { ManagedFile } from "@/types/domain/fileManager";
import { Loader2, Search } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface FileShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: ManagedFile | null;
}

interface TargetRow {
  _id: string;
  name: string;
  detail: string;
}

const matches = (row: TargetRow, term: string): boolean =>
  !term || row.name.toLowerCase().includes(term) || row.detail.toLowerCase().includes(term);

export function FileShareModal({ open, onOpenChange, file }: FileShareModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && file && <ShareBody key={file._id} onOpenChange={onOpenChange} file={file} />}
    </Dialog>
  );
}

function ShareBody({
  onOpenChange,
  file,
}: {
  onOpenChange: (open: boolean) => void;
  file: ManagedFile;
}) {
  const { data: targets, isLoading } = useGetFileShareTargetsQuery();
  const [shareFile, { isLoading: isSaving }] = useShareManagedFileMutation();

  const [userIds, setUserIds] = React.useState<string[]>(file.sharedWithUserIds);
  const [employeeIds, setEmployeeIds] = React.useState<string[]>(file.sharedWithEmployeeIds);
  const [search, setSearch] = React.useState("");

  const term = search.trim().toLowerCase();

  const users = React.useMemo<TargetRow[]>(
    () =>
      (targets?.users ?? []).map((user) => ({
        _id: user._id,
        name: user.name,
        detail: user.email,
      })),
    [targets]
  );

  const employees = React.useMemo<TargetRow[]>(
    () =>
      (targets?.employees ?? []).map((employee) => ({
        _id: employee._id,
        name: employee.name,
        detail: [employee.employeeCode, employee.designation].filter(Boolean).join(" · "),
      })),
    [targets]
  );

  const toggle = (
    id: string,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]);
  };

  const onSubmit = async () => {
    try {
      await shareFile({ id: file._id, body: { userIds, employeeIds } }).unwrap();
      toast.success(
        userIds.length + employeeIds.length === 0 ? "Sharing turned off" : "Sharing updated"
      );
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update sharing");
    }
  };

  const renderList = (
    rows: TargetRow[],
    selectedIds: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    emptyLabel: string
  ) => {
    const visible = rows.filter((row) => matches(row, term));

    if (isLoading) {
      return (
        <div className="flex h-52 items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (visible.length === 0) {
      return (
        <p className="flex h-52 items-center justify-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      );
    }

    return (
      <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
        {visible.map((row) => (
          <label
            key={row._id}
            className="flex cursor-pointer items-center gap-3 rounded-md border p-2.5 transition hover:bg-muted/40"
          >
            <Checkbox
              checked={selectedIds.includes(row._id)}
              onCheckedChange={() => toggle(row._id, selectedIds, setter)}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{row.name}</span>
              {row.detail && (
                <span className="block truncate text-xs text-muted-foreground">{row.detail}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    );
  };

  const total = userIds.length + employeeIds.length;

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Share &ldquo;{file.name}&rdquo;</DialogTitle>
        <DialogDescription>
          Anyone you pick can see and use this file. Only you can rename, share or delete it.
        </DialogDescription>
      </DialogHeader>

      <DialogBody className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search people..."
            className="pl-8"
          />
        </div>

        <Tabs defaultValue="users">
          <TabsList className="w-full">
            <TabsTrigger value="users" className="flex-1 cursor-pointer">
              Users
              {userIds.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[10px]">
                  {userIds.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex-1 cursor-pointer">
              Employees
              {employeeIds.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-[10px]">
                  {employeeIds.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-3">
            {renderList(users, userIds, setUserIds, "No users to share with")}
          </TabsContent>
          <TabsContent value="employees" className="mt-3">
            {renderList(employees, employeeIds, setEmployeeIds, "No employees to share with")}
          </TabsContent>
        </Tabs>
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
          disabled={isSaving}
          onClick={() => void onSubmit()}
        >
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          {total === 0 ? "Stop sharing" : `Share with ${total}`}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
