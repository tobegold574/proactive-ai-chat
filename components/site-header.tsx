"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BrandIcon } from "@/components/brand-icon"
import { cn } from "@/lib/utils"

const navLinkClass =
  "text-sm text-slate-600 hover:text-slate-900 transition-colors"

type NavKey = "community" | "plugins"

export function SiteHeader({ active }: { active?: NavKey }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const [lang, setLang] = useState<"zh" | "en">("zh")

  useEffect(() => {
    const saved = localStorage.getItem("lang")
    if (saved === "en" || saved === "zh") setLang(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem("lang", lang)
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en"
  }, [lang])

  const text = useMemo(() => {
    if (lang === "en") {
      return {
        community: "Community",
        plugins: "Marketplace",
        download: "Download",
        tryOnline: "Try online",
        menuOpen: "Open menu",
        menuClose: "Close menu",
        toggleLang: "Switch language",
      }
    }
    return {
      community: "社区",
      plugins: "插件市场",
      download: "下载",
      tryOnline: "在线体验",
      menuOpen: "打开菜单",
      menuClose: "关闭菜单",
      toggleLang: "切换语言",
    }
  }, [lang])

  const desktopNav = (
    <>
      <Link
        href="/community"
        className={cn(navLinkClass, active === "community" && "text-blue-600 font-medium")}
        onClick={() => setOpen(false)}
      >
        {text.community}
      </Link>
      <Link
        href="/plugins"
        className={cn(navLinkClass, active === "plugins" && "text-blue-600 font-medium")}
        onClick={() => setOpen(false)}
      >
        {text.plugins}
      </Link>
      <Link href="/download" className={navLinkClass} onClick={() => setOpen(false)}>
        {text.download}
      </Link>
    </>
  )

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-xl"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0" onClick={() => setOpen(false)}>
          <BrandIcon size={36} className="shrink-0" />
          <span className="text-base sm:text-lg font-bold text-slate-800 truncate">
            Proactive AI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8">{desktopNav}</div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0"
            aria-label={text.toggleLang}
            title={text.toggleLang}
            onClick={() => setLang((v) => (v === "zh" ? "en" : "zh"))}
          >
            <Globe className="w-5 h-5" />
          </Button>
          <Button size="sm" className="cursor-pointer shrink-0 text-xs sm:text-sm px-3 sm:px-4" onClick={() => router.push("/chat")}>
            <span className="sm:hidden">体验</span>
            <span className="hidden sm:inline">{text.tryOnline}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10 shrink-0"
            aria-label={open ? text.menuClose : text.menuOpen}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              <Link href="/community" className={`${navLinkClass} py-1`} onClick={() => setOpen(false)}>
                {text.community}
              </Link>
              <Link href="/plugins" className={`${navLinkClass} py-1`} onClick={() => setOpen(false)}>
                {text.plugins}
              </Link>
              <Link href="/download" className={`${navLinkClass} py-1`} onClick={() => setOpen(false)}>
                {text.download}
              </Link>
              <Button className="w-full mt-2" onClick={() => { setOpen(false); router.push("/chat") }}>
                {text.tryOnline}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
