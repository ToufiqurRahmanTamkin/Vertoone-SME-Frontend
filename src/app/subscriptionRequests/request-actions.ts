import type { SubscriptionRequest } from "@/types/domain/subscriptionRequest";

export const canReviewRequest = (record: SubscriptionRequest): boolean =>
  record.status === "PENDING";

export const wipesDataOnApproval = (record: SubscriptionRequest): boolean =>
  record.type === "CANCELLATION" && record.dataWipeRequired;
