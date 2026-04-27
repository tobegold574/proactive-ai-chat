"use client"

import { useTranslations } from "next-intl"

export default function DocsPage() {
  const t = useTranslations("Docs")
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{t("title")}</h1>
          <p className="text-slate-600">{t("empty")}</p>
        </div>
      </main>
    </div>
  )
}

