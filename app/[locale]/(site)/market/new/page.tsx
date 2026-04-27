"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser"
import { useCommunityStore } from "@/lib/stores/community-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

function isPluginSlug(s: string) {
  const t = s.trim().toLowerCase()
  if (t.length < 2 || t.length > 64) return false
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t)
}

export default function NewPluginListingPage() {
  const t = useTranslations("Market.newForm")
  const tMarket = useTranslations("Market")
  const locale = useLocale()
  const router = useRouter()
  const supabase = useSupabaseBrowser()
  const userId = useCommunityStore((s) => s.userId)
  const status = useCommunityStore((s) => s.status)

  const [slug, setSlug] = useState("")
  const [name, setName] = useState("")
  const [summary, setSummary] = useState("")
  const [descriptionMd, setDescriptionMd] = useState("")
  const [repoUrl, setRepoUrl] = useState("")
  const [homepageUrl, setHomepageUrl] = useState("")
  const [contactMd, setContactMd] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (status === "ready" && !userId) {
      router.replace(`/auth?next=${encodeURIComponent(`/${locale}/market/new`)}`)
    }
  }, [status, userId, locale, router])

  const submit = async () => {
    if (!supabase || !userId) return
    setError(null)
    const sl = slug.trim().toLowerCase()
    if (!sl || !name.trim() || !summary.trim()) {
      setError(t("required"))
      return
    }
    if (!isPluginSlug(sl)) {
      setError(t("slugInvalid"))
      return
    }
    setBusy(true)
    try {
      const { data, error: insErr } = await supabase
        .from("plugin_listings")
        .insert({
          slug: sl,
          author_id: userId,
          name: name.trim(),
          summary: summary.trim(),
          description_md: descriptionMd.trim(),
          repo_url: repoUrl.trim() || null,
          homepage_url: homepageUrl.trim() || null,
          contact_md: contactMd.trim() || null,
          is_published: true,
        })
        .select("id")
        .maybeSingle()
      if (insErr) {
        if (insErr.code === "23505" || insErr.message.includes("unique")) {
          setError(t("duplicateSlug"))
        } else {
          setError(insErr.message)
        }
        return
      }
      const id = (data as { id?: number } | null)?.id
      if (id) router.push(`/market/p/${id}`)
      else router.push("/market")
    } finally {
      setBusy(false)
    }
  }

  if (status !== "ready" || !supabase) {
    return (
      <main className="min-h-screen bg-slate-50 pb-20 pt-28 px-4 sm:px-6">
        <p className="mx-auto max-w-2xl text-sm text-slate-500">{tMarket("loading")}</p>
      </main>
    )
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-slate-50 pb-20 pt-28 px-4 sm:px-6">
        <p className="mx-auto max-w-2xl text-sm text-slate-500">{t("login")}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20 pt-28 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="mt-2 text-sm text-slate-600">{t("lead")}</p>
        </div>
        <Card>
          <CardContent className="space-y-4 p-6">
            <div>
              <label className="text-xs font-medium text-slate-600">{t("slug")}</label>
              <p className="mt-1 text-xs text-slate-500">{t("slugHint")}</p>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-2"
                placeholder="my-awesome-plugin"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">{t("name")}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">{t("summary")}</label>
              <Input value={summary} onChange={(e) => setSummary(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">{t("description")}</label>
              <textarea
                className="mt-1 min-h-[160px] w-full rounded-lg border border-slate-200 p-3 text-sm"
                value={descriptionMd}
                onChange={(e) => setDescriptionMd(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">{t("repo")}</label>
              <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">{t("homepage")}</label>
              <Input value={homepageUrl} onChange={(e) => setHomepageUrl(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">{t("contact")}</label>
              <textarea
                className="mt-1 min-h-[80px] w-full rounded-lg border border-slate-200 p-3 text-sm"
                value={contactMd}
                onChange={(e) => setContactMd(e.target.value)}
                placeholder="email@… or GitHub Issues URL"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="cursor-pointer" disabled={busy} onClick={() => void submit()}>
              {t("submit")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
