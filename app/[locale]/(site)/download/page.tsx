"use client"

import { useTranslations } from "next-intl"
import { Download, ExternalLink, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

/** Asset name must match the file attached to each GitHub Release (or update this URL when naming changes). */
const DIRECT_EXE_URL =
  "https://github.com/tobegold574/proactive-ai-desktop/releases/latest/download/ProactiveAI.Setup.1.0.0.exe"

const RELEASES_URL = "https://github.com/tobegold574/proactive-ai-desktop/releases/latest"

export default function DownloadPage() {
  const t = useTranslations("Download")

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{t("title")}</h1>
            <p className="text-slate-600">{t("subtitle")}</p>
          </header>

          <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
            <Card className="flex h-full flex-col border-slate-200">
              <CardContent className="flex flex-1 flex-col space-y-3 p-6">
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Download className="w-5 h-5 text-blue-600" />
                  {t("direct")}
                </div>
                <p className="min-h-[2.75rem] flex-1 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                  {t("note1")}
                </p>
                <Button asChild className="mt-auto w-full">
                  <a href={DIRECT_EXE_URL}>{t("direct")}</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col border-slate-200">
              <CardContent className="flex flex-1 flex-col space-y-3 p-6">
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  {t("release")}
                </div>
                <p className="min-h-[2.75rem] flex-1 text-sm leading-relaxed text-slate-600">{t("note2")}</p>
                <Button asChild variant="secondary" className="mt-auto w-full">
                  <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer">
                    {t("release")}
                    <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

