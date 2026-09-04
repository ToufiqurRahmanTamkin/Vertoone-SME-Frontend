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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { openDrivePicker, requestDriveAccessToken } from "@/lib/googleDrive";
import { cn } from "@/lib/utils";
import {
  useGetGoogleDriveConfigQuery,
  useGetManagedFilesQuery,
  useImportGoogleDriveFilesMutation,
  useMarkManagedFileUsedMutation,
  useUploadManagedFileMutation,
} from "@/redux/apis/fileManagerApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  formatBytes,
  isPreviewableImage,
  type ManagedFile,
  type ManagedFileScope,
} from "@/types/domain/fileManager";
import {
  Check,
  FileArchive,
  FileAudio,
  FileSpreadsheet,
  FileText,
  FileVideo,
  HardDrive,
  Image as ImageIcon,
  Loader2,
  Search,
  Star,
  UploadCloud,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

const ICON_BY_KIND: Record<string, typeof FileText> = {
  IMAGE: ImageIcon,
  DOCUMENT: FileText,
  SPREADSHEET: FileSpreadsheet,
  PRESENTATION: FileText,
  ARCHIVE: FileArchive,
  VIDEO: FileVideo,
  AUDIO: FileAudio,
  OTHER: FileText,
};

const SCOPE_TABS: { value: ManagedFileScope; label: string }[] = [
  { value: "MINE", label: "My files" },
  { value: "SHARED_WITH_ME", label: "Shared with me" },
  { value: "STARRED", label: "Starred" },
];

export interface FilePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (files: ManagedFile[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  title?: string;
  description?: string;
}

export function FilePickerDialog({ open, onOpenChange, ...rest }: FilePickerDialogProps) {
  const [session, setSession] = React.useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setSession((current) => current + 1);
        onOpenChange(next);
      }}
    >
      {open && <FilePickerBody key={session} open={open} onOpenChange={onOpenChange} {...rest} />}
    </Dialog>
  );
}

function FilePickerBody({
  open,
  onOpenChange,
  onSelect,
  accept,
  multiple = false,
  maxSizeMb,
  title = "Choose a file",
  description = "Pick something already in your file manager, upload a new file, or bring one in from Google Drive.",
}: FilePickerDialogProps) {
  const [scope, setScope] = React.useState<ManagedFileScope>("MINE");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<ManagedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isFetching } = useGetManagedFilesQuery(
    { scope, search: debouncedSearch || undefined, accept, limit: 60 },
    { skip: !open }
  );
  const { data: driveConfig } = useGetGoogleDriveConfigQuery(undefined, { skip: !open });

  const [uploadFile, { isLoading: isUploading }] = useUploadManagedFileMutation();
  const [importFromDrive, { isLoading: isImporting }] = useImportGoogleDriveFilesMutation();
  const [markUsed] = useMarkManagedFileUsedMutation();

  const files = data?.data ?? [];
  const busy = isUploading || isImporting || isConnecting;

  const toggle = (file: ManagedFile) => {
    setSelected((current) => {
      const without = current.filter((entry) => entry._id !== file._id);
      if (without.length !== current.length) return without;
      return multiple ? [...current, file] : [file];
    });
  };

  const confirm = () => {
    if (selected.length === 0) return;
    selected.forEach((file) => void markUsed(file._id));
    onSelect(selected);
    onOpenChange(false);
  };

  const handleUpload = async (candidates: File[]) => {
    const accepted = maxSizeMb
      ? candidates.filter((file) => {
          if (file.size <= maxSizeMb * 1024 * 1024) return true;
          toast.error(`"${file.name}" is larger than ${maxSizeMb} MB`);
          return false;
        })
      : candidates;

    const uploaded: ManagedFile[] = [];

    for (const file of multiple ? accepted : accepted.slice(0, 1)) {
      try {
        uploaded.push(await uploadFile({ file }).unwrap());
      } catch (error: unknown) {
        const err = error as ApiErrorResponse;
        toast.error(err?.data?.message || `Could not upload "${file.name}"`);
      }
    }

    if (uploaded.length === 0) return;

    toast.success(`${uploaded.length} file${uploaded.length === 1 ? "" : "s"} uploaded`);
    setSelected((current) => (multiple ? [...current, ...uploaded] : uploaded));
    setScope("MINE");
  };

  const handleDrive = async () => {
    if (!driveConfig?.isConfigured) return;

    setIsConnecting(true);
    try {
      const accessToken = await requestDriveAccessToken(driveConfig);
      const picked = await openDrivePicker(driveConfig, accessToken, {
        multiple,
        mimeTypes: accept,
      });

      if (picked.length === 0) return;

      const imported = await importFromDrive({ accessToken, files: picked }).unwrap();
      toast.success(`${imported.length} file${imported.length === 1 ? "" : "s"} added`);
      setSelected((current) => (multiple ? [...current, ...imported] : imported));
      setScope("MINE");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse & { message?: string };
      toast.error(err?.data?.message || err?.message || "Could not reach Google Drive");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <DialogBody className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Tabs
            value={scope}
            onValueChange={(value) => setScope(value as ManagedFileScope)}
            className="w-full sm:w-auto"
          >
            <TabsList>
              {SCOPE_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="cursor-pointer">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {SCOPE_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} />
            ))}
          </Tabs>

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search files..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UploadCloud className="size-4" />
            )}
            Upload
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={busy || !driveConfig?.isConfigured}
            title={
              driveConfig?.isConfigured
                ? undefined
                : "Google Drive is not set up on this server yet"
            }
            onClick={() => void handleDrive()}
          >
            {isConnecting || isImporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <HardDrive className="size-4" />
            )}
            Google Drive
          </Button>

          {selected.length > 0 && (
            <Badge variant="secondary" className="self-center">
              {selected.length} selected
            </Badge>
          )}
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            if (!busy) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (busy) return;
            const dropped = Array.from(event.dataTransfer.files ?? []);
            if (dropped.length > 0) void handleUpload(dropped);
          }}
          className={cn(
            "min-h-64 rounded-lg border border-dashed p-3 transition-colors",
            isDragging && "border-primary bg-primary/5"
          )}
        >
          {isFetching && files.length === 0 ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center gap-2 text-center">
              <UploadCloud className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">Nothing here yet</p>
              <p className="text-xs text-muted-foreground">
                Drop a file here, or use Upload above.
              </p>
            </div>
          ) : (
            <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4">
              {files.map((file) => {
                const Icon = ICON_BY_KIND[file.kind] ?? FileText;
                const isSelected = selected.some((entry) => entry._id === file._id);

                return (
                  <button
                    key={file._id}
                    type="button"
                    onClick={() => toggle(file)}
                    className={cn(
                      "group relative flex cursor-pointer flex-col gap-1.5 rounded-lg border p-2 text-left transition hover:border-primary/50 hover:bg-muted/40",
                      isSelected && "border-primary bg-primary/5"
                    )}
                  >
                    {isSelected && (
                      <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </span>
                    )}
                    {file.isStarred && !isSelected && (
                      <Star className="absolute right-1.5 top-1.5 size-3.5 fill-amber-400 text-amber-400" />
                    )}

                    <span className="flex h-20 items-center justify-center overflow-hidden rounded-md border bg-muted/30">
                      {isPreviewableImage(file) ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Icon className="size-7 text-muted-foreground" />
                      )}
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium">{file.name}</span>
                      <span className="block truncate text-[10px] text-muted-foreground">
                        <span className="font-mono uppercase">{file.extension}</span>
                        {" · "}
                        {formatBytes(file.fileSize)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
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
          disabled={selected.length === 0 || busy}
          onClick={confirm}
        >
          {multiple
            ? `Use ${selected.length || ""} file${selected.length === 1 ? "" : "s"}`.trim()
            : "Use this file"}
        </Button>
      </DialogFooter>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          const chosen = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (chosen.length > 0) void handleUpload(chosen);
        }}
      />
    </DialogContent>
  );
}
