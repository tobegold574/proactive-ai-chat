"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Github } from "lucide-react"

export function SiteFooter() {
  const locale = useLocale()
  const router = useRouter()
  const tDock = useTranslations("Dock")

  return (
    <footer className="border-t border-slate-200 bg-white py-8 px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="font-medium text-slate-700">Proactive AI Chat</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/download`)}
            className="cursor-pointer text-slate-500 transition-colors hover:text-slate-700"
          >
            {tDock("download")}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/docs`)}
            className="cursor-pointer text-slate-500 transition-colors hover:text-slate-700"
          >
            {tDock("docs")}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/chat`)}
            className="cursor-pointer font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            {tDock("start")}
          </button>

          <motion.a
            href="https://github.com/tobegold574/proactive-ai-chat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer items-center gap-1 text-slate-500 transition-colors hover:text-slate-700"
            whileHover={{ scale: 1.05 }}
          >
            <Github className="h-4 w-4" />
            GitHub
          </motion.a>

          <span>© 2026 Proactive AI</span>
        </div>
      </div>
    </footer>
  )
}
