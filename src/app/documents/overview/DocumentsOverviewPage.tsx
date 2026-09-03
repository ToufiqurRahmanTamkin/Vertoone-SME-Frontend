import { BreakdownBars, type BreakdownRow } from "@/app/dashboard/components/BreakdownBars";
import { KpiCard } from "@/app/dashboard/components/KpiCard";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatGrid } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { formatAmount, formatNumber } from "@/lib/amount";
import { formatDate, safeDistanceToNow } from "@/lib/date";
import { useGetDocumentsOverviewQuery } from "@/redux/apis/documentsOverviewApis";
import { useGetSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import {
  CONTRACT_STATUS_COLORS,
  CONTRACT_STATUS_LABELS,
} from "@/types/domain/contract";
import {
  DOCUMENT_CATEGORY_COLORS,
  DOCUMENT_CATEGORY_LABELS,
  formatFileSize,
} from "@/types/domain/document";
import {
  AlarmClock,
  CalendarClock,
  FileSignature,
  FileStack,
  FileText,
  FolderOpen,
  HardDrive,
  PenLine,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DocumentsTrendChart } from "./components/DocumentsTrendChart";

const LIST_SKELETON = Array.from({ length: 5 });

export default function DocumentsOverviewPage() {
  const { data, isLoading } = useGetDocumentsOverviewQuery();
  const { data: config } = useGetSystemConfigQuery();

  const documentsAccess = useModulePermission("/company/documents/all-documents");
  const contractsAccess = useModulePermission("/company/documents/digital-contracts");

  const documents = data?.kpis.documents;
  const contracts = data?.kpis.contracts;
  const currency = config?.defaultCurrency ?? "BDT";

  const kpiCards = [
    {
      label: "Documents",
      value: formatNumber(documents?.active),
      description: `${formatNumber(documents?.addedThisMonth)} added this month · ${formatNumber(
        documents?.archived
      )} archived`,
      icon: FileStack,
      color: "info" as const,
      changePercent: documents?.addedChangePercent,
    },
    {
      label: "Storage used",
      value: formatFileSize(documents?.totalSize ?? 0),
      description: "Across every file you keep here",
      icon: HardDrive,
      color: "default" as const,
    },
    {
      label: "Out for signature",
      value: formatNumber(contracts?.awaiting),
      description: `${formatNumber(contracts?.draft)} drafts waiting to go out`,
      icon: PenLine,
      color: (contracts?.awaiting ?? 0) > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Signed",
      value: formatNumber(contracts?.signed),
      description: `${contracts?.completionRate ?? 0}% of contracts reach signature`,
      icon: FileSignature,
      color: "success" as const,
    },
  ];

  const riskCards = [
    {
      label: "Documents expiring",
      value: formatNumber(documents?.expiringCount),
      description: `${formatNumber(documents?.expiredCount)} already past their date`,
      icon: AlarmClock,
      color:
        (documents?.expiringCount ?? 0) + (documents?.expiredCount ?? 0) > 0
          ? ("warning" as const)
          : ("success" as const),
    },
    {
      label: "Contract deadlines",
      value: formatNumber(contracts?.expiring),
      description: `${formatNumber(contracts?.expired)} expired · ${formatNumber(
        contracts?.declined
      )} declined`,
      icon: CalendarClock,
      color: (contracts?.expiring ?? 0) > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Signed value",
      value: formatAmount(contracts?.signedValue ?? 0, currency),
      description: `${formatAmount(contracts?.totalValue ?? 0, currency)} across every contract`,
      icon: FileSignature,
      color: "success" as const,
    },
    {
      label: "Average turnaround",
      value: `${contracts?.averageDaysToSign ?? 0}d`,
      description: "From sending to the last signature",
      icon: TrendingUp,
      color: "info" as const,
    },
  ];

  const categoryRows: BreakdownRow[] = (data?.categories ?? [])
    .filter((point) => point.count > 0)
    .map((point) => ({
      key: point.category,
      label: DOCUMENT_CATEGORY_LABELS[point.category],
      count: point.count,
      color: DOCUMENT_CATEGORY_COLORS[point.category],
      valueLabel: `${point.count} · ${formatFileSize(point.size)}`,
    }));

  const contractStatusRows: BreakdownRow[] = (data?.contractStatuses ?? [])
    .filter((point) => point.count > 0)
    .map((point) => ({
      key: point.status,
      label: CONTRACT_STATUS_LABELS[point.status],
      count: point.count,
      color: CONTRACT_STATUS_COLORS[point.status],
    }));

  return (
    <>
      <PageHeader
        title="Documents overview"
        description="What has been uploaded, what is running out of time, and where every signature stands."
      />

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        {riskCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <SectionCard
        icon={TrendingUp}
        title="What is coming in and getting signed"
        description="Twelve months of uploads against contracts reaching their last signature."
      >
        <DocumentsTrendChart points={data?.trend ?? []} isLoading={isLoading} />
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={PenLine}
          title="Waiting on a signature"
          description="Contracts already sent, oldest first, and who still has to sign."
          action={
            contractsAccess.canView && (
              <Link
                to="/company/documents/digital-contracts"
                className="text-sm font-medium text-primary hover:underline"
              >
                All contracts
              </Link>
            )
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : (data?.awaitingContracts ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing is waiting on a signature.
            </p>
          ) : (
            <ul className="space-y-3">
              {(data?.awaitingContracts ?? []).map((contract) => (
                <li key={contract._id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{contract.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        <span className="font-mono uppercase">{contract.contractNumber}</span>
                        {contract.counterpartyName ? ` · ${contract.counterpartyName}` : ""}
                      </p>
                    </div>
                    <StatusBadge
                      color={CONTRACT_STATUS_COLORS[contract.status]}
                      label={CONTRACT_STATUS_LABELS[contract.status]}
                    />
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={contract.progress} className="h-1.5 flex-1" />
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {contract.signedCount}/{contract.signerCount}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {contract.pendingSignerNames.length > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        Waiting on {contract.pendingSignerNames.join(", ")}
                      </Badge>
                    )}
                    {contract.sentAt && (
                      <span className="text-[11px] text-muted-foreground">
                        Sent {safeDistanceToNow(contract.sentAt)}
                      </span>
                    )}
                    {contract.isExpiringSoon && contract.expiresAt && (
                      <StatusBadge
                        color="amber"
                        label={`Due ${formatDate(contract.expiresAt)}`}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={AlarmClock}
          title="Running out of time"
          description="Documents whose expiry date has passed or is close."
          action={
            documentsAccess.canView && (
              <Link
                to="/company/documents/all-documents?expiringOnly=true"
                className="text-sm font-medium text-primary hover:underline"
              >
                See them all
              </Link>
            )
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (data?.expiringDocuments ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing is close to expiring.
            </p>
          ) : (
            <ul className="divide-y">
              {(data?.expiringDocuments ?? []).map((document) => (
                <li key={document._id} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{document.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {DOCUMENT_CATEGORY_LABELS[document.category]} · {document.folder}
                    </p>
                  </div>
                  <StatusBadge
                    color={document.isExpired ? "red" : "amber"}
                    label={`${document.isExpired ? "Expired" : "Expires"} ${formatDate(
                      document.expiresAt
                    )}`}
                  />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="grid gap-4">
          <SectionCard
            icon={FileText}
            title="Documents by category"
            description="What kind of paperwork you are keeping, and how much room it takes."
          >
            <BreakdownBars
              rows={categoryRows}
              isLoading={isLoading}
              emptyMessage="Nothing uploaded yet."
              rowCount={5}
            />
          </SectionCard>

          <SectionCard
            icon={FileSignature}
            title="Contracts by status"
            description="Every contract on the books, grouped by where it stands."
          >
            <BreakdownBars
              rows={contractStatusRows}
              isLoading={isLoading}
              emptyMessage="No contracts yet."
              rowCount={4}
            />
          </SectionCard>
        </div>

        <div className="grid gap-4">
          <SectionCard
            icon={FolderOpen}
            title="Busiest folders"
            description="Where most of the filing ends up."
          >
            {isLoading ? (
              <div className="space-y-3">
                {LIST_SKELETON.map((_, index) => (
                  <Skeleton key={index} className="h-9 w-full" />
                ))}
              </div>
            ) : (data?.folders ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No folders yet.</p>
            ) : (
              <ul className="divide-y">
                {(data?.folders ?? []).map((folder) => (
                  <li
                    key={folder.folder}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <span className="inline-flex min-w-0 items-center gap-1.5 text-sm">
                      <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{folder.folder}</span>
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {folder.count} · {formatFileSize(folder.size)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            icon={FileStack}
            title="Recently touched"
            description="The documents somebody has changed or added most recently."
            action={
              documentsAccess.canView && (
                <Link
                  to="/company/documents/all-documents"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  All documents
                </Link>
              )
            }
          >
            {isLoading ? (
              <div className="space-y-3">
                {LIST_SKELETON.map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : (data?.recentDocuments ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nothing uploaded yet.
              </p>
            ) : (
              <ul className="divide-y">
                {(data?.recentDocuments ?? []).map((document) => (
                  <li
                    key={document._id}
                    className="flex items-start justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{document.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        <span className="font-mono uppercase">{document.extension}</span>
                        {" · "}
                        {formatFileSize(document.fileSize)} · {document.ownerName}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {safeDistanceToNow(document.updatedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
}
