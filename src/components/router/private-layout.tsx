import { BaseLayout } from "@/components/layouts/base-layout";
import { RealtimeProvider } from "@/components/realtime/realtime-provider";
import { Outlet } from "react-router-dom";

export function PrivateLayout() {
  return (
    <RealtimeProvider>
      <BaseLayout>
        <Outlet />
      </BaseLayout>
    </RealtimeProvider>
  );
}
