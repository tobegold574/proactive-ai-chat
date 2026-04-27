"use client"

import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { usePathname } from "@/i18n/navigation"
import { motion } from "framer-motion"
import { BrandIcon } from "@/components/brand-icon"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { cn } from "@/lib/utils"

function dockNavSegment(pathname: string): "community" | "market" | "chat" | null {
  if (pathname.includes("/community")) return "community"
  if (pathname.includes("/market")) return "market"
  if (pathname.includes("/chat")) return "chat"
  return null
}

export function TopDock() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname() ?? ""
  const active = dockNavSegment(pathname)
  const t = useTranslations("Dock")
  const tCommon = useTranslations("common")

  const navClass = (segment: "community" | "market" | "chat") =>
    cn(
      "cursor-pointer select-none rounded-full px-3 py-2 text-sm transition-all duration-200",
      active === segment
        ? "bg-slate-900 font-semibold text-white shadow-md shadow-slate-900/20"
        : "font-medium text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 active:scale-[0.98]"
    )

  return (
    <motion.div
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="fixed top-4 left-0 right-0 z-50 px-4"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="relative flex items-center justify-between gap-3 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2.5 shadow-lg shadow-slate-900/[0.06] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => router.push(`/${locale}`)}
            className="flex items-center gap-2 pr-2 shrink-0 cursor-pointer rounded-full px-2 py-1 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            aria-label={tCommon("brandAlt")}
            title={tCommon("brandAlt")}
          >
            <BrandIcon size={28} priority className="shrink-0" alt={tCommon("brandAlt")} />
            <span className="text-sm font-semibold text-slate-800">
              {tCommon("brand")}
            </span>
          </button>

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 sm:flex"
            aria-label={t("ariaMainNav")}
          >
            <button
              type="button"
              onClick={() => router.push(`/${locale}/community`)}
              className={navClass("community")}
              aria-current={active === "community" ? "page" : undefined}
            >
              {t("community")}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${locale}/market`)}
              className={navClass("market")}
              aria-current={active === "market" ? "page" : undefined}
            >
              {t("plugin")}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${locale}/chat`)}
              className={navClass("chat")}
              aria-current={active === "chat" ? "page" : undefined}
            >
              {t("experience")}
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

