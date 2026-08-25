import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ProtectedRoute, PublicRoute } from "@/components/router/route-guards";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Route-level code splitting: each screen is its own chunk, so the login page
// does not ship the dashboard's chart library.
const LoginPage = lazy(() => import("@/pages/login/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const SystemConfigPage = lazy(() => import("@/pages/system-config/SystemConfigPage"));
const SubscriptionPlansPage = lazy(
  () => import("@/pages/subscription-plans/SubscriptionPlansPage")
);
const SoldSubscriptionsPage = lazy(
  () => import("@/pages/sold-subscriptions/SoldSubscriptionsPage")
);
const UserGuidePage = lazy(() => import("@/pages/user-guide/UserGuidePage"));
const NotFoundPage = lazy(() => import("@/pages/not-found/NotFoundPage"));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] flex-1 items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/system-config" element={<SystemConfigPage />} />
            <Route path="/subscription-plans" element={<SubscriptionPlansPage />} />
            <Route path="/sold-subscriptions" element={<SoldSubscriptionsPage />} />
            <Route path="/user-guide" element={<UserGuidePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
