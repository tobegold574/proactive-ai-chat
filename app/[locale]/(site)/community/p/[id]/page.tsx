"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser"
import { useCommunityStore } from "@/lib/stores/community-store"
import type { Comment, Post, Profile } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { MarkdownView } from "@/components/markdown/MarkdownView"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

type PostRow = Post & { profiles: Pick<Profile, "username"> | null }
type CommentRow = Comment & { profiles: Pick<Profile, "username"> | null }

type TreeNode = CommentRow & { children: TreeNode[] }

function buildTree(comments: CommentRow[]): TreeNode[] {
  const byId = new Map<number, TreeNode>()
  for (const c of comments) byId.set(c.id, { ...c, children: [] })
  const roots: TreeNode[] = []
  for (const node of byId.values()) {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  const sortRec = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    for (const n of nodes) sortRec(n.children)
  }
  sortRec(roots)
  return roots
}

export default function PostDetailPage() {
  const t = useTranslations("Community.thread")
  const tCommon = useTranslations("Community")
  const router = useRouter()
  const supabase = useSupabaseBrowser()
  const userId = useCommunityStore((s) => s.userId)
  const params = useParams<{ id: string }>()
  const postId = Number(params.id)

  const [post, setPost] = useState<PostRow | null>(null)
  const [comments, setComments] = useState<CommentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!supabase || Number.isNaN(postId)) return
    let ignore = false
    ;(async () => {
      setLoading(true)
      setError(null)

      const { data: postData, error: postErr } = await supabase
        .from("posts")
        .select("id, author_id, title, content_md, created_at, updated_at, profiles(username)")
        .eq("id", postId)
        .maybeSingle()
      if (ignore) return
      if (postErr || !postData) {
        setError(postErr?.message ?? t("notFound"))
        setLoading(false)
        return
      }
      setPost(postData as unknown as PostRow)

      const { data: commentData, error: cErr } = await supabase
        .from("comments")
        .select("id, post_id, author_id, parent_id, content_md, created_at, profiles(username)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true })
      if (ignore) return
      if (cErr) setError(cErr.message)
      setComments((commentData as unknown as CommentRow[]) ?? [])
      setLoading(false)
    })()
    return () => {
      ignore = true
    }
  }, [supabase, postId, t])

  const tree = useMemo(() => buildTree(comments), [comments])

  const submit = async () => {
    if (!supabase) return
    if (!userId) {
      router.push("/auth")
      return
    }
    if (!text.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const { error: insertErr } = await supabase.from("comments").insert({
        post_id: postId,
        author_id: userId,
        parent_id: replyTo,
        content_md: text,
      })
      if (insertErr) throw insertErr
      setText("")
      setReplyTo(null)
      const { data: commentData } = await supabase
        .from("comments")
        .select("id, post_id, author_id, parent_id, content_md, created_at, profiles(username)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true })
      setComments((commentData as unknown as CommentRow[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : t("commentFailed"))
    } finally {
      setSubmitting(false)
    }
  }

  function CommentNode({ node, depth }: { node: TreeNode; depth: number }) {
    const indent = Math.min(depth, 6) * 16
    return (
      <div style={{ marginLeft: indent }}>
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="text-xs text-slate-500">
              @{node.profiles?.username ?? tCommon("unknownUser")} ·{" "}
              {new Date(node.created_at).toLocaleString()}
            </div>
            <div className="mt-2">
              <MarkdownView content={node.content_md} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReplyTo(node.id)}
                className="cursor-pointer"
              >
                {t("reply")}
              </Button>
            </div>
            {node.children.length > 0 && (
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                {node.children.map((c) => (
                  <CommentNode key={c.id} node={c} depth={depth + 1} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!supabase || loading) {
    return (
      <div className="w-full max-w-3xl text-sm text-slate-500">{t("loading")}</div>
    )
  }

  if (error || !post) {
    return (
      <div className="w-full max-w-3xl space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? t("notFound")}
        </div>
        <Button
          variant="secondary"
          onClick={() => router.push("/community")}
          className="cursor-pointer"
        >
          {t("back")}
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      <Card className="border-slate-200/80 bg-white/95 shadow-md shadow-slate-900/5">
        <CardContent className="p-6 sm:p-8">
          <div className="text-xs text-slate-500">
            @{post.profiles?.username ?? tCommon("unknownUser")} ·{" "}
            {new Date(post.created_at).toLocaleString()}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {post.title}
          </h1>
          <div className="mt-6">
            <MarkdownView content={post.content_md} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-white/95">
        <CardContent className="space-y-4 p-6">
          <div className="text-lg font-semibold text-slate-900">{t("commentsTitle")}</div>

          {replyTo && (
            <div className="text-xs text-slate-500">
              {t("replyingTo", { id: replyTo })}{" "}
              <button
                className="cursor-pointer text-slate-700 underline"
                type="button"
                onClick={() => setReplyTo(null)}
              >
                {t("cancelReply")}
              </button>
            </div>
          )}

          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={userId ? t("commentPlaceholder") : t("commentPlaceholderGuest")}
            disabled={!userId}
            className="rounded-xl border-slate-200 bg-white"
          />
          <Button onClick={submit} disabled={submitting} className="cursor-pointer">
            {t("postComment")}
          </Button>
          {!userId && (
            <p className="text-xs text-slate-500">
              <button
                type="button"
                className="cursor-pointer text-slate-700 underline"
                onClick={() => router.push("/auth")}
              >
                {t("loginLink")}
              </button>{" "}
              {t("loginSuffix")}
            </p>
          )}
        </CardContent>
      </Card>

      {tree.length > 0 && (
        <div className="space-y-4">
          {tree.map((n) => (
            <CommentNode key={n.id} node={n} depth={0} />
          ))}
        </div>
      )}
    </div>
  )
}
