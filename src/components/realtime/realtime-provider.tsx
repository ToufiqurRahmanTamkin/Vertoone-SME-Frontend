import { RealtimeContext, type RealtimeContextValue } from "@/contexts/realtime-context";
import { connectSocket, disconnectSocket, isRealtimeConfigured } from "@/lib/socket";
import { baseApi, type TagType } from "@/redux/baseApi";
import { logOut, selectCurrentToken, selectCurrentUser } from "@/redux/authSlice";
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

  const [status, setStatus] = React.useState<RealtimeStatus>(
    isRealtimeConfigured() ? "CONNECTING" : "DISABLED"
  );
  const [lastEventAt, setLastEventAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isRealtimeConfigured()) {
      setStatus("DISABLED");
      return;
    }

    if (!token || !user) {
      disconnectSocket();
      setStatus("DISCONNECTED");
      return;
    }

    const socket = connectSocket(token);
    if (!socket) {
      setStatus("DISABLED");
      return;
    }

    setStatus(socket.connected ? "CONNECTED" : "CONNECTING");

    const markEvent = () => setLastEventAt(new Date().toISOString());

    const onConnect = () => setStatus("CONNECTED");
    const onDisconnect = () => setStatus("DISCONNECTED");
    const onConnectError = () => setStatus("DISCONNECTED");

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

    const onSessionRevoked = (payload: SessionRevokedPayload) => {
      toast.error("You have been signed out", { description: payload.reason });
      disconnectSocket();
      dispatch(logOut());
      navigate("/login", { replace: true });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("notification:created", onNotification);
    socket.on("resource:changed", onResourceChanged);
    socket.on("session:revoked", onSessionRevoked);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("notification:created", onNotification);
      socket.off("resource:changed", onResourceChanged);
      socket.off("session:revoked", onSessionRevoked);
    };
  }, [token, user, dispatch, navigate]);

  React.useEffect(() => () => disconnectSocket(), []);

  const value = React.useMemo<RealtimeContextValue>(
    () => ({ status, isLive: status === "CONNECTED", lastEventAt }),
    [status, lastEventAt]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
