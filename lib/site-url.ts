/**
 * Canonical site origin for sitemap, robots, and Open Graph.
 * 生产环境务必设置 NEXT_PUBLIC_SITE_URL（与 GSC 里提交的域名一致，含 https，无末尾 /），
 * 否则 sitemap 内 URL 可能与实际站点不一致，影响收录与抓取诊断。
 */
export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, "")

  // Vercel：优先使用生产域名（预览部署的 VERCEL_URL 与自定义域不一致时，避免写进 sitemap）
  const production =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.NEXT_PUBLIC_VERCEL_URL?.trim()
  if (production) {
    const p = production.replace(/\/$/, "")
    if (p.startsWith("http://") || p.startsWith("https://")) return p
    return `https://${p}`
  }

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`

  return "http://localhost:3000"
}
