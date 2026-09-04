import { FileUploader } from "@/components/shared/file-uploader";
import {
  FormColor,
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModulePermission } from "@/hooks/use-permission";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  useGetCommunitySettingsQuery,
  useUpdateCommunitySettingsMutation,
} from "@/redux/apis/communityApis";
import {
  COMMUNITY_LEADERBOARD_PERIODS,
  COMMUNITY_LEADERBOARD_PERIOD_LABELS,
  COMMUNITY_POST_PERMISSIONS,
  COMMUNITY_POST_PERMISSION_LABELS,
  type CommunitySettings,
} from "@/types/domain/community";
import {
  CommunitySettingsSchema,
  type CommunitySettingsFormOutput,
  type CommunitySettingsFormValues,
} from "@/validations/community";
import { zodResolver } from "@hookform/resolvers/zod";
import { Award, Coins, Loader2, Palette, ShieldCheck, Trophy } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { BadgeEditor } from "./components/BadgeEditor";

const PERMISSION_OPTIONS = COMMUNITY_POST_PERMISSIONS.map((value) => ({
  value,
  label: COMMUNITY_POST_PERMISSION_LABELS[value],
}));

const PERIOD_OPTIONS = COMMUNITY_LEADERBOARD_PERIODS.map((value) => ({
  value,
  label: COMMUNITY_LEADERBOARD_PERIOD_LABELS[value],
}));

const toFormValues = (settings: CommunitySettings): CommunitySettingsFormValues => ({
  name: settings.branding.name,
  tagline: settings.branding.tagline,
  logoUrl: settings.branding.logoUrl,
  bannerUrl: settings.branding.bannerUrl,
  accentColor: settings.branding.accentColor,

  whoCanPost: settings.posting.whoCanPost,
  whoCanCreateGroups: settings.posting.whoCanCreateGroups,
  requirePostApproval: settings.posting.requirePostApproval,
  allowComments: settings.posting.allowComments,
  allowReactions: settings.posting.allowReactions,
  allowAttachments: settings.posting.allowAttachments,
  autoEnrolEmployees: settings.posting.autoEnrolEmployees,

  perPost: String(settings.points.perPost),
  perComment: String(settings.points.perComment),
  perReaction: String(settings.points.perReaction),
  perGroupJoin: String(settings.points.perGroupJoin),

  leaderboardEnabled: settings.leaderboard.isEnabled,
  leaderboardPeriod: settings.leaderboard.period,
  leaderboardSize: String(settings.leaderboard.size),
  leaderboardShowPoints: settings.leaderboard.showPoints,

  badges: settings.badges.map((badge) => ({
    _id: badge._id,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    color: badge.color,
    pointsRequired: String(badge.pointsRequired),
    isActive: badge.isActive,
  })),
});

function SettingsForm({ settings, canEdit }: { settings: CommunitySettings; canEdit: boolean }) {
  const [updateSettings, { isLoading }] = useUpdateCommunitySettingsMutation();

  const form = useForm<CommunitySettingsFormValues, unknown, CommunitySettingsFormOutput>({
    resolver: zodResolver(CommunitySettingsSchema),
    defaultValues: toFormValues(settings),
  });

  const logoUrl = form.watch("logoUrl");
  const bannerUrl = form.watch("bannerUrl");

  const onSubmit = async (values: CommunitySettingsFormOutput) => {
    try {
      await updateSettings({
        branding: {
          name: values.name,
          tagline: values.tagline,
          logoUrl: values.logoUrl,
          bannerUrl: values.bannerUrl,
          accentColor: values.accentColor,
        },
        posting: {
          whoCanPost: values.whoCanPost,
          whoCanCreateGroups: values.whoCanCreateGroups,
          requirePostApproval: values.requirePostApproval,
          allowComments: values.allowComments,
          allowReactions: values.allowReactions,
          allowAttachments: values.allowAttachments,
          autoEnrolEmployees: values.autoEnrolEmployees,
        },
        points: {
          perPost: values.perPost,
          perComment: values.perComment,
          perReaction: values.perReaction,
          perGroupJoin: values.perGroupJoin,
        },
        leaderboard: {
          isEnabled: values.leaderboardEnabled,
          period: values.leaderboardPeriod,
          size: values.leaderboardSize,
          showPoints: values.leaderboardShowPoints,
        },
        badges: values.badges.map((badge) => ({
          ...(badge._id ? { _id: badge._id } : {}),
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          color: badge.color,
          pointsRequired: badge.pointsRequired,
          isActive: badge.isActive,
        })),
      }).unwrap();

      toast.success("Community settings saved");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the settings");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Tabs defaultValue="branding" className="space-y-4">
          <TabsList>
            <TabsTrigger value="branding" className="cursor-pointer">
              Look
            </TabsTrigger>
            <TabsTrigger value="posting" className="cursor-pointer">
              Rules
            </TabsTrigger>
            <TabsTrigger value="points" className="cursor-pointer">
              Points
            </TabsTrigger>
            <TabsTrigger value="badges" className="cursor-pointer">
              Badges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="space-y-4">
            <SectionCard
              icon={Palette}
              title="How the community presents itself"
              description="The name, line and colours people see at the top of every community page."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  control={form.control}
                  name="name"
                  label="Community name"
                  placeholder="The Watercooler"
                  disabled={!canEdit}
                />
                <FormColor
                  control={form.control}
                  name="accentColor"
                  label="Accent colour"
                  disabled={!canEdit}
                />
              </div>

              <FormTextarea
                control={form.control}
                name="tagline"
                label="Tagline"
                placeholder="Where the whole company talks shop"
                disabled={!canEdit}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FileUploader
                  value={logoUrl || undefined}
                  onChange={(asset) =>
                    form.setValue("logoUrl", asset?.url ?? "", { shouldDirty: true })
                  }
                  label="Logo"
                  description="Square works best."
                  cropAspect={1}
                  disabled={!canEdit}
                />
                <FileUploader
                  value={bannerUrl || undefined}
                  onChange={(asset) =>
                    form.setValue("bannerUrl", asset?.url ?? "", { shouldDirty: true })
                  }
                  label="Banner"
                  description="Sits behind the community header."
                  cropAspect={16 / 5}
                  disabled={!canEdit}
                />
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="posting" className="space-y-4">
            <SectionCard
              icon={ShieldCheck}
              title="Who may post and what they may do"
              description="Tighten these if the feed needs a moderator's eye before anything goes live."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="whoCanPost"
                  label="Who can post"
                  options={PERMISSION_OPTIONS}
                  disabled={!canEdit}
                />
                <FormSelect
                  control={form.control}
                  name="whoCanCreateGroups"
                  label="Who can open a group"
                  options={PERMISSION_OPTIONS}
                  disabled={!canEdit}
                />
              </div>

              <FormSwitch
                control={form.control}
                name="requirePostApproval"
                label="Hold posts for approval"
                description="New posts wait as pending until a moderator publishes them."
                disabled={!canEdit}
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <FormSwitch
                  control={form.control}
                  name="allowComments"
                  label="Comments"
                  disabled={!canEdit}
                />
                <FormSwitch
                  control={form.control}
                  name="allowReactions"
                  label="Reactions"
                  disabled={!canEdit}
                />
                <FormSwitch
                  control={form.control}
                  name="allowAttachments"
                  label="Photos and video"
                  disabled={!canEdit}
                />
              </div>

              <FormSwitch
                control={form.control}
                name="autoEnrolEmployees"
                label="Add people the first time they open the community"
                description="Off means an admin adds each person from the Members page."
                disabled={!canEdit}
              />
            </SectionCard>
          </TabsContent>

          <TabsContent value="points" className="space-y-4">
            <SectionCard
              icon={Coins}
              title="What each action is worth"
              description="Points add up to badges and decide where somebody lands on the leaderboard."
            >
              <div className="grid gap-4 sm:grid-cols-4">
                <FormInput
                  control={form.control}
                  name="perPost"
                  label="Per post"
                  type="number"
                  disabled={!canEdit}
                />
                <FormInput
                  control={form.control}
                  name="perComment"
                  label="Per comment"
                  type="number"
                  disabled={!canEdit}
                />
                <FormInput
                  control={form.control}
                  name="perReaction"
                  label="Per reaction received"
                  type="number"
                  disabled={!canEdit}
                />
                <FormInput
                  control={form.control}
                  name="perGroupJoin"
                  label="Per group joined"
                  type="number"
                  disabled={!canEdit}
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={Trophy}
              title="Leaderboard"
              description="Who shows up on the Overview page, and over what stretch of time."
            >
              <FormSwitch
                control={form.control}
                name="leaderboardEnabled"
                label="Show the leaderboard"
                disabled={!canEdit}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="leaderboardPeriod"
                  label="Scored over"
                  options={PERIOD_OPTIONS}
                  disabled={!canEdit}
                />
                <FormInput
                  control={form.control}
                  name="leaderboardSize"
                  label="How many people"
                  type="number"
                  disabled={!canEdit}
                />
              </div>

              <FormSwitch
                control={form.control}
                name="leaderboardShowPoints"
                label="Show the point totals"
                description="Off shows the ranking without the numbers behind it."
                disabled={!canEdit}
              />
            </SectionCard>
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <SectionCard
              icon={Award}
              title="Badges"
              description="Each badge is handed out automatically once somebody passes its points, and can also be pinned on a member by hand."
            >
              <Controller
                control={form.control}
                name="badges"
                render={({ field }) => (
                  <BadgeEditor
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!canEdit}
                  />
                )}
              />
            </SectionCard>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" className="cursor-pointer" disabled={!canEdit || isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            Save settings
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function CommunitySettingsPage() {
  const access = useModulePermission("/company/community/settings");
  const { data: settings, isLoading } = useGetCommunitySettingsQuery();

  return (
    <>
      <PageHeader
        title="Community settings"
        description="Branding, who may post, how points are earned and which badges exist."
      />

      {isLoading || !settings ? (
        <LoadingSpinner />
      ) : (
        <SettingsForm key={settings.updatedAt} settings={settings} canEdit={access.canEdit} />
      )}
    </>
  );
}
