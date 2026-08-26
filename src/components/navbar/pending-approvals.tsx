import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetCompanySummaryQuery } from "@/redux/apis/companyApis";
import { selectCurrentUser } from "@/redux/authSlice";
import { Clock3 } from "lucide-react";
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
          to="/companies?status=PENDING"
          className="group flex h-9 items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 text-[11px] font-semibold text-amber-600 transition-all hover:border-amber-500/60 hover:bg-amber-500/20 active:scale-95 dark:text-amber-400"
        >
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500 opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
          </span>
          <Clock3 className="size-3.5 shrink-0 xl:hidden" />
          <span className="hidden xl:inline">
            {pending} awaiting {pending === 1 ? "approval" : "approvals"}
          </span>
          <span className="xl:hidden">{pending}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        {pending} company {pending === 1 ? "registration is" : "registrations are"} waiting for
        your review.
      </TooltipContent>
    </Tooltip>
  );
}
