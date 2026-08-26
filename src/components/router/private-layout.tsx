import { BaseLayout } from "@/components/layouts/base-layout";
import { ModuleRouteGuard } from "@/components/permission/module-route-guard";
import { RealtimeProvider } from "@/components/realtime/realtime-provider";
import { Outlet } from "react-router-dom";

export function PrivateLayout() {
  return (
    <RealtimeProvider>
      <BaseLayout>
        <ModuleRouteGuard>
          <Outlet />
        </ModuleRouteGuard>
      </BaseLayout>
    </RealtimeProvider>
  );
}
