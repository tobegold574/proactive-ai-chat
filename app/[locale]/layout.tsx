import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale, getTranslations } from "next-intl/server"
import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { routing } from "@/i18n/routing"
import "../globals.css"

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata.root" })
  return {
    title: t("title"),
    description: t("description"),
    icons: {
      icon: "/sparkle.png",
      apple: "/sparkle.png",
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)
  const messages = await getMessages()
  const htmlLang = locale === "zh" ? "zh-CN" : "en"

  return (
    <html lang={htmlLang} className="dark">
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
