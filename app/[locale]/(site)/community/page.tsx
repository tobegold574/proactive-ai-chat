"use client"

import { useEffect, useMemo, useState } from "react"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { Search } from "lucide-react"
import { useRouter } from "@/i18n/navigation"
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser"
import { useCommunityStore } from "@/lib/stores/community-store"
import type { Post, Profile } from "@/lib/supabase/types"
import { MarkdownView } from "@/components/markdown/MarkdownView"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

type PostWithAuthor = Post & { profiles: Pick<Profile, "username"> | null }

export default function CommunityPage() {
  const t = useTranslations("Community")
  const locale = useLocale()
  const router = useRouter()
  const supabase = useSupabaseBrowser()
  const userId = useCommunityStore((s) => s.userId)
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return posts
    return posts.filter(
      (p) => p.title.toLowerCase().includes(s) || p.content_md.toLowerCase().includes(s)
    )
  }, [posts, q])

  useEffect(() => {
    if (!supabase) return
    let ignore = false
    ;(async () => {
      setLoading(true)
      setError(null)
      const { data, error: fetchErr } = await supabase
        .from("posts")
        .select("id, author_id, title, content_md, created_at, updated_at, profiles(username)")
        .order("created_at", { ascending: false })
        .limit(50)
      if (ignore) return
      if (fetchErr) {
        setError(fetchErr.message)
      } else {
        setPosts((data as unknown as PostWithAuthor[]) ?? [])
      }
      setLoading(false)
    })()
    return () => {
      ignore = true
    }
  }, [supabase])

  return (
    <div className="w-full max-w-3xl space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-white to-teal-50/40 px-5 py-7 shadow-sm ring-1 ring-slate-900/[0.04] sm:px-8 sm:py-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-teal-400/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {t("title")}
              </h1>
              <p className="mt-2 max-w-xl text-pretty text-slate-600">{t("subtitle")}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            {userId ? (
              <Button
                onClick={() => router.push("/community/new")}
                className="cursor-pointer bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-900/15 hover:from-teal-500 hover:to-cyan-500"
              >
                {t("newPostCta")}
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => router.push("/auth")}
                className="cursor-pointer border-slate-200 bg-white/90 shadow-sm"
              >
                {t("loginToPost")}
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-12 rounded-xl border-slate-200/90 bg-white/95 pl-10 shadow-sm transition-shadow focus-visible:ring-teal-500/25"
          aria-label={t("searchPlaceholder")}
        />
      </div>

      {!supabase ? (
        <div className="text-sm text-slate-500">{t("loading")}</div>
      ) : loading ? (
        <div className="text-sm text-slate-500">{t("loading")}</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-slate-300/80 bg-white/60">
          <CardContent className="py-14 text-center text-slate-600">{t("noPosts")}</CardContent>
        </Card>
      ) : (
        <ul className="space-y-5">
          {filtered.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="group relative w-full cursor-pointer rounded-2xl text-left outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2"
                onClick={() => router.push(`/community/p/${p.id}`)}
              >
                <Card className="overflow-hidden border-slate-200/70 bg-white/95 shadow-sm ring-1 ring-slate-900/[0.03] transition-all duration-200 group-hover:border-teal-200/50 group-hover:shadow-md group-hover:shadow-teal-900/[0.06] group-hover:ring-teal-900/[0.05]">
                  <CardContent className="relative p-0">
                    <div
                      className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-teal-400 to-cyan-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      aria-hidden
                    />
                    <div className="p-5 sm:p-6">
                      <h2 className="text-lg font-semibold leading-snug tracking-tight text-slate-900 group-hover:text-teal-950 sm:text-xl">
                        {p.title}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                        <span className="font-medium text-slate-600">
                          @{p.profiles?.username ?? t("unknownUser")}
                        </span>
                        <span className="text-slate-300" aria-hidden>
                          ·
                        </span>
                        <time dateTime={p.created_at}>{new Date(p.created_at).toLocaleString()}</time>
                      </div>
                      <div className="relative mt-4 max-h-[14rem] overflow-hidden rounded-xl border border-slate-100/90 bg-gradient-to-b from-slate-50/90 to-white/60 px-3 py-2.5 sm:px-4">
                        <div className="pointer-events-none select-none">
                          <MarkdownView content={p.content_md} className="markdown--excerpt" />
                        </div>
                        <div
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white from-40% via-white/70 to-transparent"
                          aria-hidden
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
