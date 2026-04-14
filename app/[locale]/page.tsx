"use client"

import { useRouter } from "@/i18n/navigation"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  MessageCircle,
  Download,
  Star,
  Github,
  ExternalLink,
} from "lucide-react"
import { BrandIcon } from "@/components/brand-icon"
import { features, steps } from "@/config/content"
import { fadeInUp, fadeInLeft, fadeInRight } from "@/config/animations"
import { LocaleSwitcher } from "@/components/locale-switcher"

const WINDOWS_DESKTOP_RELEASE_URL =
  "https://github.com/tobegold574/proactive-ai-desktop/releases/tag/v1.0.0"

export default function Home() {
  const router = useRouter()
  const t = useTranslations("Home")
  const tNav = useTranslations("Nav")
  const tCommon = useTranslations("common")
  const featuresRef = useRef(null)
  const stepsRef = useRef(null)
  const downloadRef = useRef(null)
  const ctaRef = useRef(null)

  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const stepsInView = useInView(stepsRef, { once: true, margin: "-100px" })
  const downloadInView = useInView(downloadRef, { once: true, margin: "-100px" })
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" })

  return (
    <div className="min-h-screen bg-slate-50">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <BrandIcon size={36} priority className="shrink-0" alt={tCommon("brandAlt")} />
            <span className="text-lg font-bold text-slate-800 truncate">{t("brand")}</span>
          </div>
          <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
            <motion.div whileHover={{ scale: 1.05 }}>
              <a
                href="#features"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                {tNav("features")}
              </a>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <a
                href="#how-it-works"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                {tNav("howItWorks")}
              </a>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <a
                href="#download"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector("#download")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                {tNav("download")}
              </a>
            </motion.div>
            <LocaleSwitcher />
            <motion.div>
              <Button size="sm" onClick={() => router.push("/chat")} className="cursor-pointer">
                {tNav("getStarted")}
              </Button>
            </motion.div>
          </div>
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <LocaleSwitcher />
            <Button size="sm" onClick={() => router.push("/chat")} className="cursor-pointer">
              {tNav("getStarted")}
            </Button>
          </div>
        </div>
      </motion.nav>

      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="success" className="mb-6 bg-blue-50 text-blue-600 border-blue-200">
              <Star className="w-3 h-3 mr-1" />
              {t("badge")}
            </Badge>
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-slate-900"
          >
            {t("heroTitleBefore")}{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              {t("heroHighlight")}
            </span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {t("heroSub")}
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => router.push("/chat")}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {t("tryNow")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="secondary"
                size="lg"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector("#download")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                {t("downloadClient")}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section ref={featuresRef} id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              {t("sectionFeaturesTitle")}{" "}
              <span className="text-blue-500">{t("sectionFeaturesAccent")}</span>
            </h2>
            <p className="text-slate-600">{t("sectionFeaturesSub")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial="hidden"
                animate={featuresInView ? "visible" : "hidden"}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <Card className="group h-full">
                  <CardContent className="p-6 h-full">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900 group-hover:text-blue-500 transition-colors">
                      {t(`features.${feature.id}.title` as const)}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {t(`features.${feature.id}.description` as const)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={stepsRef} id="how-it-works" className="py-24 px-6 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            animate={stepsInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              {t("sectionStepsTitle")}{" "}
              <span className="text-blue-500">{t("sectionStepsAccent")}</span>
            </h2>
            <p className="text-slate-600">{t("sectionStepsSub")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial="hidden"
                animate={stepsInView ? "visible" : "hidden"}
                variants={index === 0 ? fadeInLeft : fadeInRight}
                transition={{ delay: 0.2 }}
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-slate-200 mb-4"
                >
                  <span className="text-2xl font-bold text-blue-500">{step.number}</span>
                </motion.div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900">
                  {t(`steps.${step.id}.title` as const)}
                </h3>
                <p className="text-sm text-slate-500">{t(`steps.${step.id}.description` as const)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={downloadRef} id="download" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate={downloadInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              {t("sectionDownloadTitle")}{" "}
              <span className="text-blue-500">{t("sectionDownloadAccent")}</span>
            </h2>
            <p className="text-slate-600">{t("sectionDownloadSub")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <motion.div
              initial="hidden"
              animate={downloadInView ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ delay: 0 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card className="group h-full text-left">
                <CardContent className="p-8 pt-8 h-full flex flex-col">
                  <motion.div whileHover={{ scale: 1.2 }} className="text-5xl mb-4" aria-hidden>
                    {"\u{1F5A5}\uFE0F"}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 group-hover:text-blue-500 transition-colors">
                    {t("desktopTitle")}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4 flex-1">{t("desktopDesc")}</p>
                  <Button asChild className="w-full cursor-pointer">
                    <a
                      href={WINDOWS_DESKTOP_RELEASE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t("downloadWindows")}
                      <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial="hidden"
              animate={downloadInView ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card className="group cursor-pointer h-full text-left">
                <CardContent className="p-8 pt-8 h-full">
                  <motion.div whileHover={{ scale: 1.2 }} className="text-5xl mb-4" aria-hidden>
                    {"\u{2328}\uFE0F"}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 group-hover:text-blue-500 transition-colors">
                    {t("tuiTitle")}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">{t("tuiDesc")}</p>
                  <Badge variant="secondary">{t("comingSoon")}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section ref={ctaRef} className="py-24 px-6 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold mb-4 text-slate-900">{t("ctaTitle")}</h2>
            <p className="text-slate-600 mb-8">{t("ctaSub")}</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => router.push("/chat")}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {t("ctaButton")}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <motion.div whileHover={{ scale: 1.1 }}>
              <BrandIcon size={20} alt={tCommon("brandAlt")} />
            </motion.div>
            <span className="font-medium text-slate-700">{t("footerProduct")}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <motion.a
              href="https://github.com/tobegold574/proactive-ai-chat"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 transition-colors flex items-center gap-1"
              whileHover={{ scale: 1.1 }}
            >
              <Github className="w-4 h-4" />
              GitHub
            </motion.a>
            <span>{t("footerCopyright")}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
