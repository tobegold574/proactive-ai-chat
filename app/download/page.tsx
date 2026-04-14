"use client"

import { motion } from "framer-motion"
import { Download, ExternalLink, ShieldCheck } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WINDOWS_DESKTOP_RELEASE_URL } from "@/lib/site-config"

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      <main className="flex-1 pt-24 md:pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <header className="max-w-3xl">
            <Badge
              variant="outline"
              className="mb-4 text-blue-600 border-blue-200 bg-blue-50/80"
            >
              下载
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              下载桌面客户端
            </h1>
            <p className="text-slate-600 leading-relaxed">
              桌面端提供更好的本地体验与隐私控制。后续「社区资源包 / 插件市场」将通过深链与桌面联动完成一键导入。
            </p>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="border-slate-200">
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-slate-900">
                      Windows 版本
                    </h2>
                  </div>
                  <p className="text-sm text-slate-600">
                    从 GitHub Releases 获取最新版本与更新日志。
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4" />
                    建议仅从官方 Releases 下载
                  </div>
                </div>
                <Button asChild className="shrink-0">
                  <a
                    href={WINDOWS_DESKTOP_RELEASE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    前往下载
                    <ExternalLink className="w-4 h-4 ml-2 opacity-80" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

