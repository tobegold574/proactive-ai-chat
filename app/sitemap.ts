import type { MetadataRoute } from "next"
import { routing } from "@/i18n/routing"
import { getSiteOrigin } from "@/lib/site-url"

/** Public routes under `[locale]/(site)` and `(chat)` — no dynamic `[id]` URLs here. */
const STATIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]; priority: number }[] =
  [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/download", changeFrequency: "weekly", priority: 0.9 },
    { path: "/market", changeFrequency: "daily", priority: 0.9 },
    { path: "/docs", changeFrequency: "monthly", priority: 0.7 },
    { path: "/community", changeFrequency: "daily", priority: 0.85 },
    { path: "/chat", changeFrequency: "monthly", priority: 0.75 },
    { path: "/auth", changeFrequency: "monthly", priority: 0.3 },
    { path: "/community/new", changeFrequency: "monthly", priority: 0.5 },
    { path: "/market/new", changeFrequency: "monthly", priority: 0.5 },
  ]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteOrigin()
  const now = new Date()

  const entries: MetadataRoute.Sitemap = []
  for (const locale of routing.locales) {
    for (const { path, changeFrequency, priority } of STATIC_PATHS) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: now,
        changeFrequency,
        priority,
      })
    }
  }

  return entries
}
