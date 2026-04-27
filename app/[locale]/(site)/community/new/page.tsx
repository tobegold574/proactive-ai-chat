"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser"
import { useCommunityStore } from "@/lib/stores/community-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MarkdownView } from "@/components/markdown/MarkdownView"
import { Card, CardContent } from "@/components/ui/card"

export default function NewPostPage() {
  const t = useTranslations("Community.postComposer")
  const tComm = useTranslations("Community")
  const locale = useLocale()
  const router = useRouter()
  const supabase = useSupabaseBrowser()
  const userId = useCommunityStore((s) => s.userId)
  const status = useCommunityStore((s) => s.status)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== "ready") return
    if (!userId) router.replace(`/auth?next=${encodeURIComponent(`/${locale}/community/new`)}`)
  }, [status, userId, locale, router])

  const submit = async () => {
    if (!supabase || !userId) return
    setError(null)
    if (!title.trim() || !content.trim()) {
      setError(t("required"))
      return
    }
    setLoading(true)
    try {
      const { error: insertErr } = await supabase.from("posts").insert({
        author_id: userId,
        title: title.trim(),
        content_md: content,
      })
      if (insertErr) throw insertErr
      router.push("/community")
    } catch (e) {
      setError(e instanceof Error ? e.message : t("publishFailed"))
    } finally {
      setLoading(false)
    }
  }

  if (status !== "ready" || !supabase) {
    return (
      <div className="w-full max-w-3xl text-sm text-slate-500">{tComm("loading")}</div>
    )
  }

  if (!userId) {
    return (
      <div className="w-full max-w-3xl text-sm text-slate-500">{tComm("loading")}</div>
    )
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setPreview((v) => !v)}
            className="cursor-pointer"
          >
            {preview ? t("edit") : t("preview")}
          </Button>
          <Button onClick={submit} disabled={loading} className="cursor-pointer">
            {t("publish")}
          </Button>
        </div>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("titlePlaceholder")}
        className="h-11 rounded-xl border-slate-200 bg-white/90"
      />

      {preview ? (
        <Card className="border-slate-200/80 bg-white/95">
          <CardContent className="p-5 sm:p-6">
            <MarkdownView content={content} />
          </CardContent>
        </Card>
      ) : (
        <textarea
          className="min-h-[360px] w-full rounded-2xl border border-slate-200 bg-white/95 p-4 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("contentPlaceholder")}
        />
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
