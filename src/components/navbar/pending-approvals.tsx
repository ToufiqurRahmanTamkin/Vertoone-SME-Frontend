import { NAV_CHIP } from "@/components/navbar/navbar-styles";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useGetCompanySummaryQuery } from "@/redux/apis/companyApis";
import { selectCurrentUser } from "@/redux/authSlice";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export function PendingApprovals() {
  const user = useSelector(selectCurrentUser);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const { data } = useGetCompanySummaryQuery(undefined, { skip: !isSuperAdmin });
  const pending = data?.pending ?? 0;

  if (!isSuperAdmin || pending === 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to="/platform/companies?status=PENDING"
          className={cn(
            NAV_CHIP,
            "border-amber-500/40 bg-amber-500/10 text-amber-600 transition-colors hover:bg-amber-500/20 dark:text-amber-400"
          )}
        >
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500 opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
          </span>
          <span className="tabular-nums">{pending}</span>
          <span className="hidden xl:inline">
            awaiting {pending === 1 ? "approval" : "approvals"}
          </span>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        {pending} company {pending === 1 ? "registration is" : "registrations are"} waiting for
        your review.
      </TooltipContent>
    </Tooltip>
  );
}
