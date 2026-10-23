import type { Club } from "@/lib/clubs/mock-data";

const createdClubsKey = "sportmatch-created-clubs";
const clubRequestsKey = "sportmatch-club-requests";
const emptyClubs: Club[] = [];
const emptyRequests: string[] = [];
const createdListeners = new Set<() => void>();
const requestListeners = new Set<() => void>();
let createdClubsSnapshot: Club[] | undefined;
let pendingRequestsSnapshot: string[] | undefined;

export function getCreatedClubs(): Club[] {
  if (createdClubsSnapshot) return createdClubsSnapshot;
  if (typeof window === "undefined") return emptyClubs;
  try {
    const value: unknown = JSON.parse(localStorage.getItem(createdClubsKey) ?? "[]");
    createdClubsSnapshot = Array.isArray(value) ? value as Club[] : emptyClubs;
  } catch {
    createdClubsSnapshot = emptyClubs;
  }
  return createdClubsSnapshot;
}

export function subscribeCreatedClubs(listener: () => void) {
  createdListeners.add(listener);
  const handleStorage = () => {
    createdClubsSnapshot = undefined;
    listener();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    createdListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getPendingClubRequests(): string[] {
  if (pendingRequestsSnapshot) return pendingRequestsSnapshot;
  if (typeof window === "undefined") return emptyRequests;
  try {
    const value: unknown = JSON.parse(localStorage.getItem(clubRequestsKey) ?? "[]");
    pendingRequestsSnapshot = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : emptyRequests;
  } catch {
    pendingRequestsSnapshot = emptyRequests;
  }
  return pendingRequestsSnapshot;
}

export function subscribeClubRequests(listener: () => void) {
  requestListeners.add(listener);
  const handleStorage = () => {
    pendingRequestsSnapshot = undefined;
    listener();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    requestListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function saveClubRequest(clubId: string) {
  const requests = [...new Set([...getPendingClubRequests(), clubId])];
  localStorage.setItem(clubRequestsKey, JSON.stringify(requests));
  pendingRequestsSnapshot = requests;
  requestListeners.forEach((listener) => listener());
}

export const getServerCreatedClubs = () => emptyClubs;
export const getServerPendingClubRequests = () => emptyRequests;
