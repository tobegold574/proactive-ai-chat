/**
 * Canonical site origin for sitemap, robots, and Open Graph.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://your-domain.com).
 */
export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, "")

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`

  return "http://localhost:3000"
}
