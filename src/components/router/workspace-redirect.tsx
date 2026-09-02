import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getWorkspaceOptions } from "@/config/navigation";
import { usePermissions } from "@/hooks/use-permission";
import { useHomeRoute } from "@/hooks/use-home-route";
import { Navigate } from "react-router-dom";

export function WorkspaceRedirect({ workspaceId }: { workspaceId: string }) {
  const { modules, role, isLoading } = usePermissions();
  const home = useHomeRoute();

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-1 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const target = getWorkspaceOptions(role, modules).find((option) => option.id === workspaceId);

  return <Navigate to={target?.landingPath ?? home} replace />;
}
