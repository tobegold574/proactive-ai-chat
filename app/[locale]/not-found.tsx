import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"

export default async function NotFound() {
  const t = await getTranslations("NotFound")
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 text-slate-900 p-6">
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <Link href="/" className="text-blue-600 hover:underline">
        {t("back")}
      </Link>
    </div>
  )
}
