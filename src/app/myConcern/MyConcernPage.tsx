import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { usePermissions } from "@/hooks/use-permission";
import { formatDate } from "@/lib/date";
import { useGetMyConcernQuery } from "@/redux/apis/concernApis";
import { Building2, Globe, Mail, MapPin, Phone } from "lucide-react";
import * as React from "react";

const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate text-sm">{value || "Not set"}</p>
    </div>
  </div>
);

export default function MyConcernPage() {
  const { data: concern, isLoading, isError } = useGetMyConcernQuery();
  const { modules } = usePermissions();

  const menuCount = React.useMemo(
    () => Object.values(modules ?? {}).filter((permission) => permission.canView).length,
    [modules]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !concern) {
    return (
      <>
        <PageHeader
          title="My Concern"
          description="The concern you have been made head of."
        />
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Your account is not linked to a concern yet. Ask your company administrator to assign one.
        </p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={concern.name}
        description="The concern you run, and the access your company administrator has given you."
        actions={
          concern.isActive ? (
            <StatusBadge color="green" label="Active" />
          ) : (
            <StatusBadge color="zinc" label="Inactive" />
          )
        }
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Concern code</StatLabel>
          <StatValue className="font-mono text-xl">{concern.code}</StatValue>
          <StatDescription>{concern.industry || "Industry not set"}</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Menus you can reach</StatLabel>
          <StatValue>{menuCount}</StatValue>
          <StatDescription>Granted by your company administrator</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Created</StatLabel>
          <StatValue className="text-xl">{formatDate(concern.createdAt)}</StatValue>
          <StatDescription>When this concern was added</StatDescription>
        </Stat>
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact details</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <DetailRow icon={Mail} label="Email" value={concern.email} />
            <DetailRow icon={Phone} label="Phone" value={concern.phone} />
            <DetailRow icon={Globe} label="Website" value={concern.website} />
            <DetailRow icon={MapPin} label="Address" value={concern.address} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Head of this concern</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {concern.head ? (
              <>
                <DetailRow icon={Building2} label="Name" value={concern.head.name} />
                <DetailRow icon={Mail} label="Sign-in email" value={concern.head.email} />
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="secondary" className="text-[10px]">
                    Last sign-in{" "}
                    {concern.head.lastLoginAt ? formatDate(concern.head.lastLoginAt) : "never"}
                  </Badge>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No head account is linked.</p>
            )}
            {concern.notes && (
              <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                {concern.notes}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
