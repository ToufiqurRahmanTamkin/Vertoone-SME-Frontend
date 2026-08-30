import { RealtimeContext, type RealtimeContextValue } from "@/contexts/realtime-context";
import {
  connectSocket,
  disconnectSocket,
  getSocketStatus,
  isRealtimeConfigured,
  subscribeToSocketStatus,
} from "@/lib/socket";
import { logOut, selectCurrentToken, selectCurrentUser } from "@/redux/authSlice";
import { baseApi, type TagType } from "@/redux/baseApi";
import type {
  NotificationCreatedPayload,
  RealtimeStatus,
  ResourceChangedPayload,
  SessionRevokedPayload,
  SocketResource,
} from "@/types/domain/realtime";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TAGS_BY_RESOURCE: Record<SocketResource, TagType[]> = {
  DASHBOARD: ["Dashboard"],
  COMPANIES: ["Companies", "CompanySummary", "MyCompany"],
  SOLD_SUBSCRIPTIONS: ["SoldSubscriptions"],
  SUBSCRIPTION_PLANS: ["SubscriptionPlans"],
  NOTIFICATIONS: ["Notifications", "NotificationsUnread"],
  EMAILS: ["Emails"],
  FINANCE: ["Incomes", "Expenses", "FinanceCategories", "Reports"],
  PERMISSIONS: ["Permissions", "Me", "MyCompany"],
  TEAM_MEMBERS: ["TeamMembers", "TeamSummary"],
  CONCERNS: ["Concerns", "ConcernSummary"],
  USERS: ["AllUsers"],
  TAGS: ["Tags", "TagSummary", "TagOptions"],
  EMPLOYEES: ["Employees", "EmployeeSummary", "EmployeeOptions", "EmployeeSalaries"],
  TEAMS: ["Teams", "TeamsSummary"],
  DEPARTMENTS: ["Departments", "DepartmentSummary", "DepartmentOptions", "Employees"],
  DESIGNATIONS: ["Designations", "DesignationSummary", "DesignationOptions", "Employees"],
  LEAD_SOURCES: ["LeadSources", "LeadSourceSummary"],
  SUPPLIERS: ["Suppliers", "SupplierSummary", "SupplierOptions"],
  MEETING_ROOMS: [
    "MeetingRooms",
    "MeetingRoomSummary",
    "MeetingRoomOptions",
    "MeetingRoomFloors",
  ],
  ROLES: ["Roles", "RoleSummary", "RoleOptions", "Permissions"],
};

const TOAST_BY_LEVEL: Record<string, (title: string, description: string) => void> = {
  SUCCESS: (title, description) => toast.success(title, { description }),
  WARNING: (title, description) => toast.warning(title, { description }),
  ERROR: (title, description) => toast.error(title, { description }),
  INFO: (title, description) => toast.info(title, { description }),
};

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);

  const socketStatus = React.useSyncExternalStore(subscribeToSocketStatus, getSocketStatus);
  const [lastEventAt, setLastEventAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isRealtimeConfigured()) return;

    if (!token || !user) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);
    if (!socket) return;

    const markEvent = () => setLastEventAt(new Date().toISOString());

    const onNotification = (payload: NotificationCreatedPayload) => {
      markEvent();
      dispatch(baseApi.util.invalidateTags(["Notifications", "NotificationsUnread"]));

      const showToast = TOAST_BY_LEVEL[payload.level] ?? TOAST_BY_LEVEL.INFO;
      showToast(payload.title, payload.message);
    };

    const onResourceChanged = (payload: ResourceChangedPayload) => {
      markEvent();
      const tags = payload.resources.flatMap((resource) => TAGS_BY_RESOURCE[resource] ?? []);
      if (tags.length > 0) {
        dispatch(baseApi.util.invalidateTags(tags));
      }
    };

    const onConnect = () => {
      dispatch(baseApi.util.invalidateTags(TAGS_BY_RESOURCE.PERMISSIONS));
    };

    const onSessionRevoked = (payload: SessionRevokedPayload) => {
      toast.error("You have been signed out", { description: payload.reason });
      disconnectSocket();
      dispatch(logOut());
      navigate("/login", { replace: true });
    };

    socket.on("connect", onConnect);
    socket.on("notification:created", onNotification);
    socket.on("resource:changed", onResourceChanged);
    socket.on("session:revoked", onSessionRevoked);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("notification:created", onNotification);
      socket.off("resource:changed", onResourceChanged);
      socket.off("session:revoked", onSessionRevoked);
    };
  }, [token, user, dispatch, navigate]);

  React.useEffect(() => () => disconnectSocket(), []);

  const status: RealtimeStatus = !isRealtimeConfigured()
    ? "DISABLED"
    : !token || !user
      ? "DISCONNECTED"
      : socketStatus;

  const value = React.useMemo<RealtimeContextValue>(
    () => ({ status, isLive: status === "CONNECTED", lastEventAt }),
    [status, lastEventAt]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
