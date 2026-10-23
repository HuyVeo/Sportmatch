export type ClubMembershipState = "PENDING" | "APPROVED" | "REJECTED";

export type PendingClubRequest = {
  userId: string;
  name: string;
  avatar: string;
  avatarUrl: string | null;
  area: string;
};

export type ClubViewerAccess = {
  isPersisted: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  displayName: string;
  /** Chủ CLB — để người chưa vào CLB nhắn riêng hỏi đáp. */
  ownerId: string | null;
  isOwner: boolean;
  membershipStatus: ClubMembershipState | null;
  pendingRequests: PendingClubRequest[];
};
