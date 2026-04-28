"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { ExternalLink, Github, Globe } from "lucide-react"
import { useRouter } from "@/i18n/navigation"
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser"
import { useCommunityStore } from "@/lib/stores/community-store"
import type { PluginDiscussion, PluginListing, PluginReview, Profile } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MarkdownView } from "@/components/markdown/MarkdownView"

type ListingRow = PluginListing & { profiles: Pick<Profile, "username"> | null }
type ReviewRow = PluginReview & { profiles: Pick<Profile, "username"> | null }
type DiscussionRow = PluginDiscussion & { profiles: Pick<Profile, "username"> | null }

type DNode = DiscussionRow & { children: DNode[] }

function buildTree(rows: DiscussionRow[]): DNode[] {
  const byId = new Map<number, DNode>()
  for (const r of rows) byId.set(r.id, { ...r, children: [] })
  const roots: DNode[] = []
  for (const node of byId.values()) {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  const sort = (nodes: DNode[]) => {
    nodes.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    for (const n of nodes) sort(n.children)
  }
  sort(roots)
  return roots
}

export default function PluginDetailPage() {
  const t = useTranslations("Market.detail")
  const tComm = useTranslations("Community")
  const router = useRouter()
  const supabase = useSupabaseBrowser()
  const userId = useCommunityStore((s) => s.userId)
  const params = useParams<{ id: string }>()
  const pluginId = Number(params.id)

  const [listing, setListing] = useState<ListingRow | null>(null)
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [discussions, setDiscussions] = useState<DiscussionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [rating, setRating] = useState(5)
  const [reviewBody, setReviewBody] = useState("")
  const [reviewBusy, setReviewBusy] = useState(false)

  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [discText, setDiscText] = useState("")
  const [discBusy, setDiscBusy] = useState(false)

  const loadAll = async () => {
    if (!supabase || Number.isNaN(pluginId)) return
    setLoading(true)
    setError(null)
    const { data: L, error: e1 } = await supabase
      .from("plugin_listings")
      .select(
        "id, slug, author_id, name, summary, description_md, repo_url, homepage_url, contact_md, is_published, created_at, updated_at, profiles(username)"
      )
      .eq("id", pluginId)
      .maybeSingle()
    if (e1 || !L) {
      setError(e1?.message ?? t("loadError"))
      setListing(null)
      setLoading(false)
      return
    }
    setListing(L as unknown as ListingRow)

    const { data: R } = await supabase
      .from("plugin_reviews")
      .select("id, plugin_id, author_id, rating, body_md, created_at, updated_at, profiles(username)")
      .eq("plugin_id", pluginId)
      .order("created_at", { ascending: false })
    setReviews((R as unknown as ReviewRow[]) ?? [])

    const { data: D } = await supabase
      .from("plugin_discussions")
      .select("id, plugin_id, author_id, parent_id, content_md, created_at, profiles(username)")
      .eq("plugin_id", pluginId)
      .order("created_at", { ascending: true })
    setDiscussions((D as unknown as DiscussionRow[]) ?? [])

    const mine = (R as ReviewRow[] | null)?.find((r) => r.author_id === userId)
    if (mine) {
      setRating(mine.rating)
      setReviewBody(mine.body_md)
    }
    setLoading(false)
  }

  useEffect(() => {
    void loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when id/supabase; userId merged in load for my review
  }, [supabase, pluginId])

  useEffect(() => {
    if (!userId || !reviews.length) return
    const mine = reviews.find((r) => r.author_id === userId)
    if (mine) {
      setRating(mine.rating)
      setReviewBody(mine.body_md)
    }
  }, [userId, reviews])

  const avg = useMemo(() => {
    if (!reviews.length) return null
    const s = reviews.reduce((a, r) => a + r.rating, 0)
    return Math.round((s / reviews.length) * 10) / 10
  }, [reviews])

  const tree = useMemo(() => buildTree(discussions), [discussions])

  const saveReview = async () => {
    if (!supabase || !userId || !listing) return
    setReviewBusy(true)
    try {
      const { error: e } = await supabase.from("plugin_reviews").upsert(
        {
          plugin_id: pluginId,
          author_id: userId,
          rating,
          body_md: reviewBody.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "plugin_id,author_id" }
      )
      if (e) throw e
      await loadAll()
    } finally {
      setReviewBusy(false)
    }
  }

  const postDiscussion = async () => {
    if (!supabase || !userId || !discText.trim()) return
    setDiscBusy(true)
    try {
      const { error: e } = await supabase.from("plugin_discussions").insert({
        plugin_id: pluginId,
        author_id: userId,
        parent_id: replyTo,
        content_md: discText.trim(),
      })
      if (e) throw e
      setDiscText("")
      setReplyTo(null)
      const { data: D } = await supabase
        .from("plugin_discussions")
        .select("id, plugin_id, author_id, parent_id, content_md, created_at, profiles(username)")
        .eq("plugin_id", pluginId)
        .order("created_at", { ascending: true })
      setDiscussions((D as unknown as DiscussionRow[]) ?? [])
    } finally {
      setDiscBusy(false)
    }
  }

  function DiscussionNode({ node, depth }: { node: DNode; depth: number }) {
    const indent = Math.min(depth, 5) * 14
    return (
      <div style={{ marginLeft: indent }}>
        <Card className="border-slate-200/80 bg-white/95">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500">
              @{node.profiles?.username ?? tComm("unknownUser")} ·{" "}
              {new Date(node.created_at).toLocaleString()}
            </div>
            <div className="mt-2 text-sm text-slate-800">
              <MarkdownView content={node.content_md} />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-8 cursor-pointer px-2 text-xs"
              onClick={() => setReplyTo(node.id)}
            >
              {t("reply")}
            </Button>
            {node.children.map((c) => (
              <DiscussionNode key={c.id} node={c} depth={depth + 1} />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!supabase || loading) {
    return (
      <main className="min-h-screen bg-slate-50 pb-20 pt-28 px-4 sm:px-6">
        <p className="mx-auto max-w-3xl text-sm text-slate-500">{tComm("loading")}</p>
      </main>
    )
  }

  if (error || !listing) {
    return (
      <main className="min-h-screen bg-slate-50 pb-20 pt-28 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-sm text-red-600">{error ?? t("loadError")}</p>
          <Button variant="secondary" className="cursor-pointer" onClick={() => router.push("/market")}>
            {t("back")}
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20 pt-28 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <Button variant="ghost" className="-ml-2 cursor-pointer text-slate-600" onClick={() => router.push("/market")}>
          {t("back")}
        </Button>

        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{listing.name}</h1>
          <p className="text-lg text-slate-600">{listing.summary}</p>
          <p className="text-xs text-slate-400">
            @{listing.profiles?.username ?? "—"} · {listing.slug}
          </p>
          {avg != null && (
            <p className="text-sm font-medium text-amber-700">
              {t("avg", { score: String(avg) })} · {t("count", { count: reviews.length })}
            </p>
          )}
        </header>

        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t("developer")}</h2>
            <p className="text-slate-800">@{listing.profiles?.username ?? "—"}</p>
            <h3 className="text-sm font-semibold text-slate-700">{t("contact")}</h3>
            {listing.contact_md ? (
              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-sm">
                <MarkdownView content={listing.contact_md} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">{t("noContact")}</p>
            )}
            {(listing.repo_url || listing.homepage_url) && (
              <>
                <h3 className="text-sm font-semibold text-slate-700">{t("links")}</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.repo_url && (
                    <a
                      href={listing.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Github className="size-4" />
                      {t("repo")}
                      <ExternalLink className="size-3 opacity-60" />
                    </a>
                  )}
                  {listing.homepage_url && (
                    <a
                      href={listing.homepage_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Globe className="size-4" />
                      {t("homepage")}
                      <ExternalLink className="size-3 opacity-60" />
                    </a>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {listing.description_md?.trim() ? (
          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">{t("about")}</h2>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
              <MarkdownView content={listing.description_md} />
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">{t("reviewsTitle")}</h2>
          {userId ? (
            <Card>
              <CardContent className="space-y-3 p-5">
                <label className="text-sm font-medium text-slate-700">{t("yourRating")}</label>
                <select
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <textarea
                  className="min-h-[100px] w-full rounded-lg border border-slate-200 p-3 text-sm"
                  placeholder={t("reviewPlaceholder")}
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                />
                <Button className="cursor-pointer" disabled={reviewBusy} onClick={() => void saveReview()}>
                  {t("saveReview")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <p className="text-sm text-slate-500">{t("loginReview")}</p>
          )}
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500">{t("noReviews")}</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-medium text-slate-900">
                          @{r.profiles?.username ?? "—"}
                        </span>
                        <span className="text-amber-700">{r.rating}/5</span>
                      </div>
                      {r.body_md ? (
                        <div className="mt-2 text-sm text-slate-700">
                          <MarkdownView content={r.body_md} className="markdown--excerpt" />
                        </div>
                      ) : null}
                      <p className="mt-2 text-xs text-slate-400">{new Date(r.created_at).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{t("discussionTitle")}</h2>
            <p className="mt-1 text-sm text-slate-600">{t("discussionLead")}</p>
          </div>
          {userId ? (
            <Card>
              <CardContent className="space-y-3 p-5">
                {replyTo && (
                  <p className="text-xs text-slate-500">
                    {t("replyingTo", { id: replyTo })}{" "}
                    <button type="button" className="underline" onClick={() => setReplyTo(null)}>
                      {t("cancelReply")}
                    </button>
                  </p>
                )}
                <Input
                  value={discText}
                  onChange={(e) => setDiscText(e.target.value)}
                  placeholder={t("placeholder")}
                  className="h-11"
                />
                <Button className="cursor-pointer" disabled={discBusy} onClick={() => void postDiscussion()}>
                  {t("post")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <p className="text-sm text-slate-500">{t("loginDiscussion")}</p>
          )}
          <div className="space-y-3">
            {tree.map((n) => (
              <DiscussionNode key={n.id} node={n} depth={0} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
