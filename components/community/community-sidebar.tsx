"use client"

import { useMemo, useState } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Bell, UserRound } from "lucide-react"
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser"
import { useCommunityStore } from "@/lib/stores/community-store"
import type { Notification } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function CommunitySidebar() {
  const t = useTranslations("Community.sidebar")
  const tComm = useTranslations("Community")
  const tTypes = useTranslations("Community.sidebar.notificationTypes")
  const locale = useLocale()
  const router = useRouter()
  const supabase = useSupabaseBrowser()
  const userId = useCommunityStore((s) => s.userId)
  const email = useCommunityStore((s) => s.email)
  const profile = useCommunityStore((s) => s.profile)
  const needsUsername = useCommunityStore((s) => s.needsUsername)
  const status = useCommunityStore((s) => s.status)
  const notifications = useCommunityStore((s) => s.notifications)
  const patchNotificationRead = useCommunityStore((s) => s.patchNotificationRead)
  const patchAllNotificationsRead = useCommunityStore((s) => s.patchAllNotificationsRead)

  const [busy, setBusy] = useState(false)

  const unread = useMemo(
    () => notifications.filter((n) => n.read_at == null).length,
    [notifications]
  )

  const openPost = async (n: Notification) => {
    if (!supabase || !userId) return
    const readAt = new Date().toISOString()
    if (n.read_at == null) {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: readAt })
        .eq("id", n.id)
        .eq("user_id", userId)
      if (!error) patchNotificationRead(n.id, readAt)
    }
    router.push(`/${locale}/community/p/${n.link_post_id}`)
  }

  const markAllRead = async () => {
    if (!supabase || !userId || unread === 0) return
    setBusy(true)
    const readAt = new Date().toISOString()
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: readAt })
        .eq("user_id", userId)
        .is("read_at", null)
      if (!error) patchAllNotificationsRead(readAt)
    } finally {
      setBusy(false)
    }
  }

  const shell = "overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm ring-1 ring-slate-900/[0.03]"

  return (
    <div className="space-y-5">
      <Card className={shell}>
        <CardHeader className="space-y-0 border-b border-slate-100/90 bg-gradient-to-r from-teal-50/50 via-white to-cyan-50/30 px-5 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/80">
              <UserRound className="size-4 text-teal-600" aria-hidden />
            </span>
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-5 py-4">
          {!supabase ? (
            <p className="text-sm text-slate-500">{tComm("loading")}</p>
          ) : !userId && status !== "ready" ? (
            <p className="text-sm text-slate-500">{tComm("loading")}</p>
          ) : !userId ? (
            <>
              <p className="text-sm leading-relaxed text-slate-600">{t("signInHint")}</p>
              <Button
                className="w-full cursor-pointer bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-900/10 hover:from-teal-500 hover:to-cyan-500"
                onClick={() => router.push(`/${locale}/auth`)}
              >
                {t("signIn")}
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  {t("signedInAs")}
                </span>
                <div className="mt-1 font-semibold text-slate-900">@{profile?.username ?? "…"}</div>
                {email && (
                  <div className="mt-1 truncate text-xs text-slate-500" title={email}>
                    {email}
                  </div>
                )}
              </div>
              {needsUsername && (
                <p className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-amber-950">
                  {t("needsUsername")}
                </p>
              )}
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  className="w-full cursor-pointer border-slate-200 bg-white shadow-sm"
                  onClick={() => router.push(`/${locale}/auth`)}
                >
                  {t("editProfile")}
                </Button>
                <Button
                  className="w-full cursor-pointer bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-900/10 hover:from-teal-500 hover:to-cyan-500"
                  onClick={() => router.push(`/${locale}/community/new`)}
                >
                  {t("newPost")}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className={shell}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100/90 bg-gradient-to-r from-slate-50/80 via-white to-teal-50/20 px-5 py-4">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base font-semibold text-slate-900">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/80">
              <Bell className="size-4 text-teal-600" aria-hidden />
            </span>
            {t("notifications")}
            {unread > 0 && (
              <Badge
                variant="secondary"
                className="border-teal-200/60 bg-teal-50 font-medium text-teal-800"
              >
                {t("unreadBadge", { count: unread })}
              </Badge>
            )}
          </CardTitle>
          {userId && unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 cursor-pointer px-2 text-xs text-teal-700 hover:bg-teal-50 hover:text-teal-800"
              disabled={busy}
              onClick={() => void markAllRead()}
            >
              {t("markAllRead")}
            </Button>
          )}
        </CardHeader>
        <CardContent className="max-h-[min(420px,50vh)] space-y-2 overflow-y-auto px-3 py-3 sm:px-4">
          {!userId ? (
            <p className="px-1 py-4 text-center text-sm text-slate-500">{t("noNotifications")}</p>
          ) : notifications.length === 0 ? (
            <p className="px-1 py-4 text-center text-sm text-slate-500">{t("noNotifications")}</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => void openPost(n)}
                className={cn(
                  "w-full cursor-pointer rounded-xl border px-3 py-2.5 text-left transition-colors",
                  n.read_at
                    ? "border-slate-100 bg-slate-50/50 hover:bg-slate-100/80"
                    : "border-teal-100/80 bg-teal-50/40 hover:bg-teal-50/70"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      n.read_at ? "text-slate-600" : "text-slate-900"
                    )}
                  >
                    {n.type === "comment_on_post"
                      ? tTypes("comment_on_post")
                      : n.type === "reply_to_comment"
                        ? tTypes("reply_to_comment")
                        : n.title}
                  </span>
                  <span className="shrink-0 text-[10px] font-medium text-teal-600/80">
                    {t("openPost")}
                  </span>
                </div>
                {n.body && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{n.body}</p>
                )}
                <p className="mt-1.5 text-[10px] text-slate-400">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
