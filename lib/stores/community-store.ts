import { create } from "zustand"
import type { Notification, Profile } from "@/lib/supabase/types"

export type CommunityAuthStatus = "idle" | "loading" | "ready"

type CommunityState = {
  userId: string | null
  email: string | null
  profile: Profile | null
  needsUsername: boolean
  status: CommunityAuthStatus
  notifications: Notification[]
}

type CommunityActions = {
  reset: () => void
  setFromAuth: (payload: { userId: string | null; email: string | null }) => void
  setProfile: (profile: Profile | null) => void
  setNeedsUsername: (v: boolean) => void
  setStatus: (s: CommunityAuthStatus) => void
  setNotifications: (rows: Notification[]) => void
  prependNotification: (row: Notification) => void
  patchNotificationRead: (id: number, readAt: string) => void
  patchAllNotificationsRead: (readAt: string) => void
}

const initial: CommunityState = {
  userId: null,
  email: null,
  profile: null,
  needsUsername: false,
  status: "idle",
  notifications: [],
}

export const useCommunityStore = create<CommunityState & CommunityActions>((set) => ({
  ...initial,
  reset: () => set(initial),
  setFromAuth: (payload) =>
    set({
      userId: payload.userId,
      email: payload.email,
    }),
  setProfile: (profile) => set({ profile }),
  setNeedsUsername: (needsUsername) => set({ needsUsername }),
  setStatus: (status) => set({ status }),
  setNotifications: (notifications) => set({ notifications }),
  prependNotification: (row) =>
    set((state) => ({ notifications: [row, ...state.notifications].slice(0, 50) })),
  patchNotificationRead: (id, readAt) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read_at: readAt } : n
      ),
    })),
  patchAllNotificationsRead: (readAt) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.read_at ? n : { ...n, read_at: readAt }
      ),
    })),
}))
