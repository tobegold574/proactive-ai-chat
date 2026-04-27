"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useLocale } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

function normalizeUsername(u: string) {
  return u.trim().toLowerCase()
}

function isValidUsername(u: string) {
  const s = u.trim()
  if (s.length < 3 || s.length > 20) return false
  if (/[\/\\?#\r\n\t]/.test(s)) return false
  return true
}

/** Only same-locale in-app paths; ignores open redirects. */
function safeAuthRedirectPath(next: string | null, locale: string): string | null {
  if (!next) return null
  let decoded = next
  try {
    decoded = decodeURIComponent(next)
  } catch {
    return null
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return null
  if (/[\r\n\0]/.test(decoded)) return null
  if (!decoded.startsWith(`/${locale}/`)) return null
  return decoded
}

function AuthPageFallback() {
  const t = useTranslations("Auth")
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80 pb-16 pt-28 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <div className="text-sm text-slate-500">{t("loading")}</div>
      </div>
    </main>
  )
}

function AuthPageInner() {
  const t = useTranslations("Auth")
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useSupabaseBrowser()
  const afterAuthPath = safeAuthRedirectPath(searchParams.get("next"), locale)
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [needsUsername, setNeedsUsername] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const usernameNorm = useMemo(() => normalizeUsername(username), [username])

  useEffect(() => {
    if (!supabase) return
    let ignore = false
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (ignore) return
      const uid = data.session?.user.id ?? null
      setSessionUserId(uid)
      if (uid) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", uid)
          .maybeSingle()
        const uname = (profile as unknown as { username?: string } | null)?.username ?? ""
        const looksAuto = /^user_[a-f0-9]{8}$/i.test(uname)
        setNeedsUsername(!uname || looksAuto)
      }
    })()
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, sess: Session | null) => {
        const uid = sess?.user.id ?? null
        setSessionUserId(uid)
      }
    )
    return () => {
      ignore = true
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  const doLogin = async () => {
    if (!supabase) return
    setError(null)
    setOk(null)
    setLoading(true)
    try {
      const { error: signErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signErr) throw signErr
      setOk(t("loggedIn"))
      router.push(afterAuthPath ?? `/${locale}/community`)
    } catch (e) {
      setError(e instanceof Error ? e.message : t("loginFailed"))
    } finally {
      setLoading(false)
    }
  }

  const doSignup = async () => {
    if (!supabase) return
    setError(null)
    setOk(null)
    setLoading(true)
    try {
      const { error: signErr } = await supabase.auth.signUp({ email, password })
      if (signErr) throw signErr
      setOk(t("signedUp"))
      setMode("login")
    } catch (e) {
      setError(e instanceof Error ? e.message : t("signupFailed"))
    } finally {
      setLoading(false)
    }
  }

  const saveUsername = async () => {
    if (!supabase || !sessionUserId) return
    setError(null)
    setOk(null)
    if (!isValidUsername(username)) {
      setError(t("usernameInvalid"))
      return
    }
    setLoading(true)
    try {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username_norm", usernameNorm)
        .maybeSingle()
      const existingId = (existing as unknown as { id?: string } | null)?.id
      if (existingId && existingId !== sessionUserId) {
        setError(t("usernameTaken"))
        return
      }

      const { error: upErr } = await supabase
        .from("profiles")
        .update({ username: username.trim(), username_norm: usernameNorm })
        .eq("id", sessionUserId)
      if (upErr) throw upErr
      setOk(t("usernameSaved"))
      setNeedsUsername(false)
      router.push(afterAuthPath ?? `/${locale}/community`)
    } catch (e) {
      setError(e instanceof Error ? e.message : t("updateFailed"))
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSessionUserId(null)
    setNeedsUsername(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80 pb-16 pt-28 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
          <p className="mt-2 text-sm text-slate-600">{t("subtitle")}</p>
        </div>

        {!supabase ? (
          <div className="text-sm text-slate-500">{t("loading")}</div>
        ) : sessionUserId ? (
          <Card className="border-slate-200/80 bg-white/95">
            <CardContent className="space-y-4 p-6">
              {needsUsername ? (
                <>
                  <div className="text-sm text-slate-700">{t("setUsernameHint")}</div>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t("usernamePlaceholder")}
                    className="rounded-xl"
                  />
                  <Button onClick={saveUsername} disabled={loading} className="w-full cursor-pointer">
                    {t("saveUsername")}
                  </Button>
                </>
              ) : (
                <div className="text-sm text-slate-700">{t("signedInBlurb")}</div>
              )}
              <Button variant="secondary" onClick={signOut} className="w-full cursor-pointer">
                {t("signOut")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200/80 bg-white/95">
            <CardContent className="space-y-4 p-6">
              <div className="flex gap-2">
                <Button
                  variant={mode === "login" ? "default" : "secondary"}
                  onClick={() => setMode("login")}
                  className="cursor-pointer"
                >
                  {t("login")}
                </Button>
                <Button
                  variant={mode === "signup" ? "default" : "secondary"}
                  onClick={() => setMode("signup")}
                  className="cursor-pointer"
                >
                  {t("signup")}
                </Button>
              </div>

              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="rounded-xl"
              />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                type="password"
                className="rounded-xl"
              />

              <Button
                onClick={mode === "login" ? doLogin : doSignup}
                disabled={loading}
                className="w-full cursor-pointer"
              >
                {mode === "login" ? t("login") : t("signup")}
              </Button>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {ok && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {ok}
          </div>
        )}
      </div>
    </main>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPageInner />
    </Suspense>
  )
}
