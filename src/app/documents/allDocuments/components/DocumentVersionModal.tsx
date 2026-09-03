import { DocumentUploader } from "@/components/shared/document-uploader";
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
import { Label } from "@/components/ui/label";
import { useAddDocumentVersionMutation } from "@/redux/apis/documentApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { CompanyDocument, DocumentFile } from "@/types/domain/document";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface DocumentVersionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: CompanyDocument | null;
}

export function DocumentVersionModal({
  open,
  onOpenChange,
  document,
}: DocumentVersionModalProps) {
  const [file, setFile] = React.useState<DocumentFile | null>(null);
  const [note, setNote] = React.useState("");
  const [addVersion, { isLoading }] = useAddDocumentVersionMutation();

  const [seededFor, setSeededFor] = React.useState(false);
  if (seededFor !== open) {
    setSeededFor(open);
    setFile(null);
    setNote("");
  }

  const onSave = async () => {
    if (!document || !file) return;

    try {
      await addVersion({ id: document._id, body: { file, note: note.trim() } }).unwrap();
      toast.success(`Version ${document.version + 1} saved`);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the new version");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload a new version</DialogTitle>
          <DialogDescription>
            {document
              ? `"${document.title}" is on version ${document.version}. The current file is kept in the history.`
              : "The current file is kept in the history."}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-3">
          <DocumentUploader
            value={file}
            onChange={setFile}
            folder="documents"
            label={`Version ${(document?.version ?? 0) + 1}`}
          />

          <div className="space-y-1.5">
            <Label htmlFor="version-note">What changed? (optional)</Label>
            <Input
              id="version-note"
              value={note}
              maxLength={300}
              placeholder="Updated the payment terms in clause 4"
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={!file || isLoading}
            onClick={onSave}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            Save version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
