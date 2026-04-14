import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { hasLocale } from "next-intl"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata.chat" })
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function ChatLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)
  return children
}
