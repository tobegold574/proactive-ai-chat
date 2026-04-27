import createMiddleware from "next-intl/middleware"
import { type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware({
  locales: [...routing.locales],
  defaultLocale: routing.defaultLocale,
})

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })
    await supabase.auth.getUser()
  }

  return response
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
}
