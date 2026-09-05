import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatNumber } from "@/lib/amount";
import { useGetProductOptionsQuery } from "@/redux/apis/productApis";
import {
  useDeleteBarcodeMutation,
  useDeleteLabelTemplateMutation,
  useGetBarcodeSummaryQuery,
  useGetBarcodesQuery,
  useGetLabelTemplatesQuery,
} from "@/redux/apis/productBarcodeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  BARCODE_SYMBOLOGIES,
  BARCODE_SYMBOLOGY_LABELS,
  LABEL_PRESETS,
  LABEL_PRESET_LABELS,
  type BarcodeSymbology,
  type LabelPreset,
  type LabelTemplate,
  type ProductBarcode,
} from "@/types/domain/productBarcode";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import {
  BarcodeRowActions,
  LabelRowActions,
  barcodeColumns,
  fieldSummary,
  labelColumns,
} from "./barcodes.columns";
import { BarcodeFormModal } from "./components/BarcodeFormModal";
import { LabelTemplateFormModal } from "./components/LabelTemplateFormModal";

export default function BarcodesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/products/barcodes");
  const [tab, setTab] = React.useState("barcodes");

  const { data: products = [] } = useGetProductOptionsQuery();

  const isBarcodes = tab === "barcodes";

  const {
    data: barcodes,
    isLoading: isLoadingBarcodes,
    isFetching: isFetchingBarcodes,
  } = useGetBarcodesQuery(
    {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      productId: filters.productId as string | undefined,
      symbology: filters.symbology as BarcodeSymbology | undefined,
      isPrimary: filters.isPrimary === undefined ? undefined : filters.isPrimary === "true",
    },
    { skip: !isBarcodes }
  );

  const {
    data: templates,
    isLoading: isLoadingTemplates,
    isFetching: isFetchingTemplates,
  } = useGetLabelTemplatesQuery(
    {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      preset: filters.preset as LabelPreset | undefined,
    },
    { skip: isBarcodes }
  );

  const { data: summary } = useGetBarcodeSummaryQuery();

  const [barcodeFormOpen, setBarcodeFormOpen] = React.useState(false);
  const [labelFormOpen, setLabelFormOpen] = React.useState(false);
  const [editingBarcode, setEditingBarcode] = React.useState<ProductBarcode | null>(null);
  const [editingLabel, setEditingLabel] = React.useState<LabelTemplate | null>(null);
  const [pendingBarcode, setPendingBarcode] = React.useState<ProductBarcode | null>(null);
  const [pendingLabel, setPendingLabel] = React.useState<LabelTemplate | null>(null);

  const [deleteBarcode, { isLoading: isDeletingBarcode }] = useDeleteBarcodeMutation();
  const [deleteLabel, { isLoading: isDeletingLabel }] = useDeleteLabelTemplateMutation();

  const barcodeFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "productId",
        label: "Product",
        type: "select",
        options: products.map((product) => ({ label: product.name, value: product._id })),
      },
      {
        name: "symbology",
        label: "Format",
        type: "select",
        options: BARCODE_SYMBOLOGIES.map((symbology) => ({
          label: BARCODE_SYMBOLOGY_LABELS[symbology],
          value: symbology,
        })),
      },
      {
        name: "isPrimary",
        label: "Role",
        type: "select",
        options: [
          { label: "Primary", value: "true" },
          { label: "Extra", value: "false" },
        ],
      },
    ],
    [products]
  );

  const labelFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "preset",
        label: "Size",
        type: "select",
        options: LABEL_PRESETS.map((preset) => ({
          label: LABEL_PRESET_LABELS[preset],
          value: preset,
        })),
      },
    ],
    []
  );

  const barcodeRowActions = React.useMemo(
    () => ({
      onEdit: (barcode: ProductBarcode) => {
        setEditingBarcode(barcode);
        setBarcodeFormOpen(true);
      },
      onDelete: setPendingBarcode,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const labelRowActions = React.useMemo(
    () => ({
      onEdit: (template: LabelTemplate) => {
        setEditingLabel(template);
        setLabelFormOpen(true);
      },
      onDelete: setPendingLabel,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const barcodeTableColumns = React.useMemo(
    () => barcodeColumns(barcodeRowActions),
    [barcodeRowActions]
  );
  const labelTableColumns = React.useMemo(
    () => labelColumns(labelRowActions),
    [labelRowActions]
  );

  const confirmBarcodeDelete = async () => {
    if (!pendingBarcode) return;
    try {
      await deleteBarcode(pendingBarcode._id).unwrap();
      toast.success("Barcode deleted");
      setPendingBarcode(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the barcode");
    }
  };

  const confirmLabelDelete = async () => {
    if (!pendingLabel) return;
    try {
      await deleteLabel(pendingLabel._id).unwrap();
      toast.success("Label deleted");
      setPendingLabel(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the label");
    }
  };

  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;
  const activeMeta = isBarcodes ? barcodes?.meta : templates?.meta;

  return (
    <>
      <PageHeader
        title="Barcodes & labels"
        description="Barcode formats for every product, and the shelf and product labels you print them onto."
        actions={<BackLink to="/sme/products/overview" label="Products overview" />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Barcodes</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Products covered</StatLabel>
          <StatValue>{formatNumber(summary?.coveredProductCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.uncoveredProductCount ?? 0)} still without one
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Primary codes</StatLabel>
          <StatValue>{formatNumber(summary?.primaryCount ?? 0)}</StatValue>
          <StatDescription>Written back onto the product record</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Label layouts</StatLabel>
          <StatValue>{formatNumber(summary?.templateCount ?? 0)}</StatValue>
          <StatDescription>Sizes you print onto</StatDescription>
        </Stat>
      </StatGrid>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value);
          clearFilters();
        }}
      >
        <TabsList>
          <TabsTrigger value="barcodes">Barcodes</TabsTrigger>
          <TabsTrigger value="labels">Labels</TabsTrigger>
        </TabsList>

        <TabsContent value="barcodes" className="mt-4 flex flex-col gap-4">
          <DataTableToolbar
            searchValue={filters.search}
            onSearchChange={(value) => setFilter("search", value)}
            searchPlaceholder="Search barcodes..."
            filters={barcodeFilters}
            currentFilters={filters}
            onFilterChange={setFilter}
            onClear={clearFilters}
            isLoading={isFetchingBarcodes}
            actions={
              access.canCreate && (
                <ActionButton
                  icon={Plus}
                  label="New barcode"
                  disabled={isLimitReached}
                  title={
                    isLimitReached
                      ? `Your plan allows ${limit} barcodes. Delete one or upgrade to add more.`
                      : undefined
                  }
                  onClick={() => {
                    setEditingBarcode(null);
                    setBarcodeFormOpen(true);
                  }}
                />
              )
            }
          />

          {isLimitReached && (
            <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
              You have used all {limit} barcodes your plan allows. Delete one or upgrade your
              subscription to add more.
            </p>
          )}

          <DataTable
            columns={barcodeTableColumns}
            data={barcodes?.data ?? []}
            isLoading={isLoadingBarcodes}
            pagination={
              activeMeta
                ? {
                    page: activeMeta.page,
                    limit: activeMeta.limit,
                    total: activeMeta.total,
                    pages: activeMeta.totalPages,
                  }
                : undefined
            }
            onPageChange={(page) => setFilter("page", page)}
            onLimitChange={(limit) => setFilter("limit", limit)}
            getRowId={(row) => row._id}
            mobileCard={(barcode) => (
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono font-semibold tracking-wide">
                      {barcode.code}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {BARCODE_SYMBOLOGY_LABELS[barcode.symbology]}
                    </p>
                  </div>
                  <StatusBadge
                    color={barcode.isActive ? "green" : "zinc"}
                    label={barcode.isActive ? "Active" : "Inactive"}
                  />
                </div>

                <dl className="mt-3 grid gap-1 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Product</dt>
                    <dd className="truncate font-medium">{barcode.product?.name ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Variant</dt>
                    <dd className="truncate font-medium">{barcode.variant?.name ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Units per scan</dt>
                    <dd className="font-medium tabular-nums">{barcode.packSize}</dd>
                  </div>
                </dl>

                <div className="mt-3 border-t pt-3">
                  <BarcodeRowActions barcode={barcode} {...barcodeRowActions} />
                </div>
              </div>
            )}
          />
        </TabsContent>

        <TabsContent value="labels" className="mt-4 flex flex-col gap-4">
          <DataTableToolbar
            searchValue={filters.search}
            onSearchChange={(value) => setFilter("search", value)}
            searchPlaceholder="Search labels..."
            filters={labelFilters}
            currentFilters={filters}
            onFilterChange={setFilter}
            onClear={clearFilters}
            isLoading={isFetchingTemplates}
            actions={
              access.canCreate && (
                <ActionButton
                  icon={Plus}
                  label="New label"
                  onClick={() => {
                    setEditingLabel(null);
                    setLabelFormOpen(true);
                  }}
                />
              )
            }
          />

          <DataTable
            columns={labelTableColumns}
            data={templates?.data ?? []}
            isLoading={isLoadingTemplates}
            pagination={
              activeMeta
                ? {
                    page: activeMeta.page,
                    limit: activeMeta.limit,
                    total: activeMeta.total,
                    pages: activeMeta.totalPages,
                  }
                : undefined
            }
            onPageChange={(page) => setFilter("page", page)}
            onLimitChange={(limit) => setFilter("limit", limit)}
            getRowId={(row) => row._id}
            mobileCard={(template) => (
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{template.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {LABEL_PRESET_LABELS[template.preset]}
                    </p>
                  </div>
                  <StatusBadge
                    color={template.isActive ? "green" : "zinc"}
                    label={template.isActive ? "Active" : "Inactive"}
                  />
                </div>

                <dl className="mt-3 grid gap-1 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Size</dt>
                    <dd className="font-medium tabular-nums">
                      {template.widthMm} × {template.heightMm} mm
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Per sheet</dt>
                    <dd className="font-medium tabular-nums">{template.labelsPerSheet}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="shrink-0 text-muted-foreground">Prints</dt>
                    <dd className="truncate text-right font-medium">{fieldSummary(template)}</dd>
                  </div>
                </dl>

                <div className="mt-3 border-t pt-3">
                  <LabelRowActions template={template} {...labelRowActions} />
                </div>
              </div>
            )}
          />
        </TabsContent>
      </Tabs>

      <BarcodeFormModal
        open={barcodeFormOpen}
        onOpenChange={setBarcodeFormOpen}
        barcode={editingBarcode}
      />

      <LabelTemplateFormModal
        open={labelFormOpen}
        onOpenChange={setLabelFormOpen}
        template={editingLabel}
      />

      <ConfirmDialog
        open={Boolean(pendingBarcode)}
        onOpenChange={(open) => !open && setPendingBarcode(null)}
        title={`Delete "${pendingBarcode?.code ?? ""}"?`}
        description="The code stops being recognised. If it was the primary code, the product is left without one."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeletingBarcode}
        onConfirm={confirmBarcodeDelete}
      />

      <ConfirmDialog
        open={Boolean(pendingLabel)}
        onOpenChange={(open) => !open && setPendingLabel(null)}
        title={`Delete "${pendingLabel?.name ?? ""}"?`}
        description="The layout is removed. Barcodes themselves are left untouched."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeletingLabel}
        onConfirm={confirmLabelDelete}
      />
    </>
  );
}
