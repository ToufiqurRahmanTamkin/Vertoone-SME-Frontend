import { FileUploader } from "@/components/shared/file-uploader";
import { FormColor } from "@/components/shared/form-fields";
import { useFormContext, useWatch } from "react-hook-form";

interface PresentationFormShape {
  coverUrl: string;
  coverPublicId: string;
  accentColor: string;
}

export function CalendarPresentationSection({ disabled }: { disabled?: boolean }) {
  const form = useFormContext<PresentationFormShape>();
  const coverUrl = useWatch({ control: form.control, name: "coverUrl" });
  const coverPublicId = useWatch({ control: form.control, name: "coverPublicId" });

  return (
    <div className="flex flex-col gap-4">
      <FileUploader
        value={coverUrl || undefined}
        publicId={coverPublicId || undefined}
        folder="general"
        label="Cover image"
        description="Shown across the top of the public page. A wide image works best."
        disabled={disabled}
        cropAspect={16 / 9}
        previewClassName="h-40 w-full object-cover"
        onChange={(asset) => {
          form.setValue("coverUrl", asset?.url ?? "", { shouldDirty: true });
          form.setValue("coverPublicId", asset?.publicId ?? "", { shouldDirty: true });
        }}
      />

      <FormColor
        control={form.control}
        name="accentColor"
        label="Accent colour"
        description="Used for buttons and highlights on the public page."
      />
    </div>
  );
}
