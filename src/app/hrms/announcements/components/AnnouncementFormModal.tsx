import { AudienceFields } from "@/components/shared/audience-fields";
import { FileUploader } from "@/components/shared/file-uploader";
import {
  FormDate,
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/shared/form-fields";
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
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from "@/redux/apis/announcementApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  ANNOUNCEMENT_PRIORITIES,
  ANNOUNCEMENT_PRIORITY_LABELS,
  ANNOUNCEMENT_STATUSES,
  ANNOUNCEMENT_STATUS_LABELS,
  ANNOUNCEMENT_TYPES,
  ANNOUNCEMENT_TYPE_LABELS,
  type Announcement,
} from "@/types/domain/announcement";
import type { AudienceType } from "@/types/domain/policy";
import { AnnouncementSchema, type AnnouncementFormValues } from "@/validations/policy";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface AnnouncementFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement | null;
}

const TYPE_OPTIONS = ANNOUNCEMENT_TYPES.map((value) => ({
  value,
  label: ANNOUNCEMENT_TYPE_LABELS[value],
}));

const PRIORITY_OPTIONS = ANNOUNCEMENT_PRIORITIES.map((value) => ({
  value,
  label: ANNOUNCEMENT_PRIORITY_LABELS[value],
}));

const STATUS_OPTIONS = ANNOUNCEMENT_STATUSES.map((value) => ({
  value,
  label: ANNOUNCEMENT_STATUS_LABELS[value],
}));

const emptyValues = (): AnnouncementFormValues => ({
  title: "",
  summary: "",
  body: "",
  type: "GENERAL",
  priority: "NORMAL",
  status: "DRAFT",
  coverImageUrl: "",
  isPinned: false,
  publishAt: "",
  expiresAt: "",
  authorEmployeeId: "",
  audience: "ALL",
  departmentIds: [],
  designationIds: [],
  employeeIds: [],
  userIds: [],
});

const toFormValues = (announcement: Announcement): AnnouncementFormValues => ({
  title: announcement.title,
  summary: announcement.summary,
  body: announcement.body,
  type: announcement.type,
  priority: announcement.priority,
  status: announcement.status,
  coverImageUrl: announcement.coverImageUrl,
  isPinned: announcement.isPinned,
  publishAt: announcement.publishAt ? announcement.publishAt.slice(0, 10) : "",
  expiresAt: announcement.expiresAt ? announcement.expiresAt.slice(0, 10) : "",
  authorEmployeeId: announcement.authorEmployeeId ?? "",
  audience: announcement.audience,
  departmentIds: announcement.departmentIds,
  designationIds: announcement.designationIds,
  employeeIds: announcement.employeeIds,
  userIds: announcement.userIds,
});

export function AnnouncementFormModal({
  open,
  onOpenChange,
  announcement,
}: AnnouncementFormModalProps) {
  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation();
  const isSaving = isCreating || isUpdating;

  const { data: employees } = useGetEmployeeOptionsQuery(undefined, { skip: !open });

  const employeeOptions = React.useMemo(
    () => (employees ?? []).map((row) => ({ value: row._id, label: row.name })),
    [employees]
  );

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues: emptyValues(),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(announcement ? toFormValues(announcement) : emptyValues());
  }, [open, announcement, form]);

  const audience = form.watch("audience") as AudienceType;
  const coverImageUrl = form.watch("coverImageUrl");

  const onSubmit = async (values: AnnouncementFormValues) => {
    const body = {
      title: values.title,
      summary: values.summary,
      body: values.body,
      type: values.type,
      priority: values.priority,
      status: values.status,
      coverImageUrl: values.coverImageUrl,
      isPinned: values.isPinned,
      audience: values.audience,
      departmentIds: values.departmentIds,
      designationIds: values.designationIds,
      employeeIds: values.employeeIds,
      userIds: values.userIds,
      publishAt: values.publishAt || null,
      expiresAt: values.expiresAt || null,
      authorEmployeeId: values.authorEmployeeId || null,
    };

    try {
      if (announcement) {
        await updateAnnouncement({ id: announcement._id, body }).unwrap();
        toast.success("Announcement updated");
      } else {
        await createAnnouncement(body).unwrap();
        toast.success("Announcement added");
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the announcement");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {announcement ? "Edit announcement" : "New announcement"}
              </DialogTitle>
              <DialogDescription>
                Say it once, and it reaches exactly the people you pick.
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <Tabs defaultValue="message">
                <TabsList className="w-full">
                  <TabsTrigger value="message" className="flex-1 cursor-pointer">
                    Message
                  </TabsTrigger>
                  <TabsTrigger value="timing" className="flex-1 cursor-pointer">
                    Timing
                  </TabsTrigger>
                  <TabsTrigger value="audience" className="flex-1 cursor-pointer">
                    Who sees it
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="message" className="mt-4 space-y-4">
                  <FormInput control={form.control} name="title" label="Title" />
                  <FormTextarea
                    control={form.control}
                    name="summary"
                    label="Summary"
                    placeholder="One line that shows in the list"
                  />
                  <FormTextarea
                    control={form.control}
                    name="body"
                    label="Message"
                    placeholder="What you want everybody to know"
                    rows={10}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                      control={form.control}
                      name="type"
                      label="Kind"
                      options={TYPE_OPTIONS}
                    />
                    <FormSelect
                      control={form.control}
                      name="priority"
                      label="Priority"
                      options={PRIORITY_OPTIONS}
                    />
                  </div>

                  <FileUploader
                    value={coverImageUrl || undefined}
                    onChange={(asset) =>
                      form.setValue("coverImageUrl", asset?.url ?? "", { shouldDirty: true })
                    }
                    label="Cover image"
                    description="Optional. Shows at the top of the announcement."
                    cropAspect={16 / 9}
                  />
                </TabsContent>

                <TabsContent value="timing" className="mt-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                      control={form.control}
                      name="status"
                      label="Status"
                      options={STATUS_OPTIONS}
                    />
                    <FormSelect
                      control={form.control}
                      name="authorEmployeeId"
                      label="From"
                      options={employeeOptions}
                      placeholder="The company"
                      clearable
                      searchable
                    />
                    <FormDate
                      control={form.control}
                      name="publishAt"
                      label="Goes out on"
                      description="Leave empty to send as soon as it is published."
                    />
                    <FormDate
                      control={form.control}
                      name="expiresAt"
                      label="Stops showing on"
                      description="Leave empty to keep it up indefinitely."
                    />
                  </div>

                  <FormSwitch
                    control={form.control}
                    name="isPinned"
                    label="Pin it to the top"
                    description="Pinned announcements sit above everything else in the feed."
                  />
                </TabsContent>

                <TabsContent value="audience" className="mt-4">
                  <AudienceFields
                    control={form.control}
                    audience={audience}
                    description="Everyone in the company, unless you narrow it down."
                  />
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
              <Button type="submit" className="cursor-pointer" disabled={isSaving}>
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                {announcement ? "Save changes" : "Add announcement"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
