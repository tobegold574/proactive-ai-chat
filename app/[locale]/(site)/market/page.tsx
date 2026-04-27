"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { Search, Sparkles } from "lucide-react"
import { useRouter } from "@/i18n/navigation"
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser"
import { useCommunityStore } from "@/lib/stores/community-store"
import type { PluginListing, Profile } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

const PAGE_SIZE = 12

type Row = PluginListing & { profiles: Pick<Profile, "username"> | null }

function searchIlikePattern(raw: string) {
  const t = raw.replace(/[%_,]/g, " ").replace(/[(),]/g, " ").trim()
  if (!t) return null
  return `%${t}%`
}

export default function MarketPage() {
  const t = useTranslations("Market")
  const locale = useLocale()
  const router = useRouter()
  const supabase = useSupabaseBrowser()
  const userId = useCommunityStore((s) => s.userId)
  const sessionStatus = useCommunityStore((s) => s.status)

  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQ(q.trim()), 300)
    return () => window.clearTimeout(id)
  }, [q])

  useEffect(() => {
    setPage(1)
  }, [debouncedQ])

  useEffect(() => {
    if (!supabase) return
    let ignore = false
    ;(async () => {
      setLoading(true)
      setError(null)
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const pat = searchIlikePattern(debouncedQ)

      let query = supabase
        .from("plugin_listings")
        .select(
          "id, slug, author_id, name, summary, description_md, repo_url, homepage_url, contact_md, is_published, created_at, updated_at, profiles(username)",
          { count: "exact" }
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false })

      if (pat) {
        query = query.or(`name.ilike.${pat},summary.ilike.${pat},slug.ilike.${pat}`)
      }

      const { data, error: err, count } = await query.range(from, to)
      if (ignore) return
      if (err) setError(err.message)
      else {
        setRows((data as unknown as Row[]) ?? [])
        setTotal(count ?? 0)
      }
      setLoading(false)
    })()
    return () => {
      ignore = true
    }
  }, [supabase, page, debouncedQ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const goCreate = () => {
    const nextTarget = `/${locale}/market/new`
    if (sessionStatus !== "ready") return
    if (!userId) {
      router.push(`/auth?next=${encodeURIComponent(nextTarget)}`)
      return
    }
    router.push("/market/new")
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20 pt-28 [background-image:radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(59_130_246/0.08),transparent_55%)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <header className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            {t("title")}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              className="cursor-pointer bg-blue-600 hover:bg-blue-700"
              onClick={goCreate}
              disabled={sessionStatus !== "ready"}
            >
              <Sparkles className="size-4" />
              {t("addListing")}
            </Button>
            <Button
              variant="secondary"
              className="cursor-pointer border-slate-200 bg-white shadow-sm"
              onClick={() => router.push("/download")}
            >
              {t("ctaDesktop")}
            </Button>
          </div>
          <div className="relative w-full max-w-xl">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-12 rounded-xl border-slate-200/90 bg-white/95 pl-10 shadow-sm"
              aria-label={t("searchPlaceholder")}
            />
          </div>
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-slate-600 md:text-base">
            {t("subtitle")}
          </p>
        </header>

        <div className="mt-12 space-y-4">
          {!supabase || loading ? (
            <p className="text-center text-sm text-slate-500">{t("loading")}</p>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : rows.length === 0 ? (
            <p className="text-center text-sm text-slate-600">
              {total === 0 && !debouncedQ ? t("emptyAll") : t("empty")}
            </p>
          ) : (
            <ul className="space-y-4">
              {rows.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => router.push(`/market/p/${r.id}`)}
                    className="group w-full cursor-pointer rounded-2xl text-left transition-transform hover:-translate-y-0.5"
                  >
                    <Card className="border-slate-200/80 bg-white/95 shadow-sm ring-1 ring-slate-900/[0.03] transition-shadow group-hover:shadow-md">
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700">
                              {r.name}
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">{r.summary}</p>
                            <p className="mt-2 text-xs text-slate-400">
                              @{r.profiles?.username ?? "—"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && totalPages > 1 ? (
            <nav
              className="flex items-center justify-center gap-3 pt-2"
              aria-label={t("paginationAria")}
            >
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t("prevPage")}
              </Button>
              <span className="text-sm tabular-nums text-slate-600">
                {t("pageStatus", { page, totalPages })}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {t("nextPage")}
              </Button>
            </nav>
          ) : null}
        </div>
      </div>
    </main>
  )
}
