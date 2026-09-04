import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getWorkspaceOptions } from "@/config/navigation";
import { usePermissions } from "@/hooks/use-permission";
import { useHomeRoute } from "@/hooks/use-home-route";
import { Navigate } from "react-router-dom";

export function WorkspaceRedirect({ workspaceId }: { workspaceId: string }) {
  const { menuModules, role, isLoading } = usePermissions();
  const home = useHomeRoute();

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-1 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const target = getWorkspaceOptions(role, menuModules).find((option) => option.id === workspaceId);

  if (target) {
    return <Navigate to={target.landingPath} replace />;
  }

  const fallback = home === `/${workspaceId}` ? "/403" : home;

  return <Navigate to={fallback} replace />;
}
