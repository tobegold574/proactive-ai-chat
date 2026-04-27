"use client"

import { useEffect, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { Languages, Check } from "lucide-react"
import { cn } from "@/lib/utils"

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
        className="flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white/70 p-2 text-slate-700 shadow-sm transition-transform hover:scale-[1.06] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <Languages className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("label")}
          className="absolute left-0 z-[100] mt-2 min-w-[10.5rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {routing.locales.map((loc) => (
            <li key={loc} role="option" aria-selected={loc === locale}>
              <button
                type="button"
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50",
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

