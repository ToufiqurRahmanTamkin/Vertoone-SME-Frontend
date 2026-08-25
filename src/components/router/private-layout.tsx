import { BaseLayout } from "@/components/layouts/base-layout";
import { Outlet } from "react-router-dom";

export function PrivateLayout() {
  return (
    <BaseLayout>
      <Outlet />
    </BaseLayout>
  );
}
