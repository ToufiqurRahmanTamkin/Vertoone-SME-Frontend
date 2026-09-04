import { useModulePermission } from "@/hooks/use-permission";
import { useGetSharedBoardsQuery } from "@/redux/apis/resourceShareApis";
import type { ResourceShare } from "@/types/domain/resourceShare";

export interface BoardAccess {
  /** True when the board is reachable at all. */
  canView: boolean;
  canCreateCards: boolean;
  canEditCards: boolean;
  canDeleteCards: boolean;
  canMoveCards: boolean;
  canComment: boolean;
  /** Rename the board, change its lists and labels. */
  canManageBoard: boolean;
  canDeleteBoard: boolean;
  canShare: boolean;
  /** True when the only reason this board is reachable is an accepted share. */
  viaShare: boolean;
  /** True when a share holder is limited to the cards assigned to them. */
  seesOwnCardsOnly: boolean;
  share: ResourceShare | null;
  isLoading: boolean;
}

const TASKS_MODULE = "/company/tasks-and-goals/tasks";

/**
 * What the signed-in person may do on one board: their module permission when they
 * have it, otherwise whatever the board's owner granted them on the share.
 */
export const useBoardAccess = (boardId: string | null | undefined): BoardAccess => {
  const module = useModulePermission(TASKS_MODULE);

  const { data: shared, isLoading: isLoadingShares } = useGetSharedBoardsQuery(
    { limit: 100 },
    { skip: module.canView || !boardId }
  );

  if (module.canView) {
    return {
      canView: true,
      canCreateCards: module.canCreate,
      canEditCards: module.canEdit,
      canDeleteCards: module.canDelete,
      canMoveCards: module.canEdit,
      canComment: module.canCreate,
      canManageBoard: module.canEdit,
      canDeleteBoard: module.canDelete,
      canShare: module.canEdit,
      viaShare: false,
      seesOwnCardsOnly: false,
      share: null,
      isLoading: module.isLoading,
    };
  }

  const share =
    (shared?.data ?? []).find((row) => row.board._id === boardId)?.share ?? null;

  const permissions = share?.permissions;

  return {
    canView: Boolean(share),
    canCreateCards: permissions?.canCreateCards === true,
    canEditCards: permissions?.canEditCards === true,
    canDeleteCards: permissions?.canDeleteCards === true,
    canMoveCards: permissions?.canMoveCards === true,
    canComment: permissions?.canComment === true,
    canManageBoard: permissions?.canManageLists === true,
    canDeleteBoard: false,
    canShare: false,
    viaShare: true,
    seesOwnCardsOnly: Boolean(share) && permissions?.canViewAllCards !== true,
    share,
    isLoading: module.isLoading || isLoadingShares,
  };
};
