"use client"

import { useEffect, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { Languages, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

/** 常见「语言 / 翻译」入口图标：Lucide 的 Languages（类似 A 与变体字母组合，很多站点语言菜单都用这一类） */
export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher")
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocMouseDown)
    return () => document.removeEventListener("mousedown", onDocMouseDown)
  }, [])

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("label")}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white/90 px-2 py-1.5 text-slate-700 shadow-sm transition-colors hover:bg-white hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <Languages className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("label")}
          className="absolute right-0 z-[100] mt-1 min-w-[10.5rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {routing.locales.map((loc) => (
            <li key={loc} role="option" aria-selected={loc === locale}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50",
                  loc === locale && "bg-blue-50/80"
                )}
                onClick={() => {
                  router.replace(pathname, { locale: loc })
                  setOpen(false)
                }}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold leading-none",
                    loc === "zh"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200 text-slate-800"
                  )}
                  aria-hidden
                >
                  {loc === "zh" ? "中" : "A"}
                </span>
                <span className="flex-1">{loc === "zh" ? t("zh") : t("en")}</span>
                {loc === locale ? (
                  <Check className="h-4 w-4 shrink-0 text-blue-600" aria-hidden />
                ) : (
                  <span className="h-4 w-4 shrink-0" aria-hidden />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
