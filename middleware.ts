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

/**
 * 必须显式排除 sitemap.xml / robots.txt 等，否则部分环境下仍可能被中间件改写，
 * Google Search Console 会报 “Couldn't fetch”。
 * @see https://github.com/amannn/next-intl/discussions/264
 */
export const config = {
  matcher: [
    "/",
    // Next.js 要求 matcher 为编译期可静态解析的字符串（不可模板拼接）
    "/(en|zh)/:path*",
    "/((?!api|_next|_next/static|_next/image|_vercel|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|.*\\..*).*)",
  ],
}
