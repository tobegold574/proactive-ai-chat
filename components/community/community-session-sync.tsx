"use client"

import { useEffect } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser"
import { useCommunityStore } from "@/lib/stores/community-store"
import type { Notification, Profile } from "@/lib/supabase/types"

function looksAutoUsername(u: string) {
  return /^user_[a-f0-9]{8}$/i.test(u)
}

async function loadNotifications(supabase: SupabaseClient, userId: string): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(40)
    if (error) return []
    return (data as Notification[]) ?? []
  } catch {
    return []
  }
}

async function loadProfile(supabase: SupabaseClient, userId: string): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
  return (data as Profile | null) ?? null
}

async function applySession(
  supabase: SupabaseClient,
  userId: string | null,
  email: string | null
) {
  const store = useCommunityStore.getState()
  const previousUserId = store.userId
  const alreadyReady = store.status === "ready"

  store.setFromAuth({ userId, email })
  if (!userId) {
    store.setProfile(null)
    store.setNeedsUsername(false)
    store.setNotifications([])
    store.setStatus("ready")
    return
  }

  // Supabase fires onAuthStateChange on tab focus (token refresh). Same user → refresh quietly.
  const silentRefresh = alreadyReady && previousUserId === userId
  if (!silentRefresh) {
    store.setStatus("loading")
  }

  const profile = await loadProfile(supabase, userId)
  store.setProfile(profile)
  const uname = profile?.username ?? ""
  store.setNeedsUsername(!uname || looksAutoUsername(uname))
  const rows = await loadNotifications(supabase, userId)
  store.setNotifications(rows)
  store.setStatus("ready")
}

export function CommunitySessionSync() {
  const supabase = useSupabaseBrowser()
  const userId = useCommunityStore((s) => s.userId)

  useEffect(() => {
    if (!supabase) return
    let cancelled = false

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      const uid = session?.user.id ?? null
      const email = session?.user.email ?? null
      await applySession(supabase, uid, email)
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        if (cancelled) return
        const uid = session?.user.id ?? null
        const email = session?.user.email ?? null
        await applySession(supabase, uid, email)
      })()
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (!supabase || !userId) return

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as Notification
          if (row?.id) useCommunityStore.getState().prependNotification(row)
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  return null
}
