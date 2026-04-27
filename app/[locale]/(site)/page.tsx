"use client"

import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, MessageCircle, Download, Star } from "lucide-react"
import { getFeatures, getSteps } from "@/config/content"
import { fadeInUp, fadeInLeft, fadeInRight } from "@/config/animations"

export default function Home() {
  const locale = useLocale()
  const router = useRouter()
  const tHome = useTranslations("Home")
  const features = getFeatures(locale)
  const steps = getSteps(locale)
  const featuresRef = useRef(null)
  const stepsRef = useRef(null)
  const ctaRef = useRef(null)

  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const stepsInView = useInView(stepsRef, { once: true, margin: "-100px" })
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" })

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="success" className="mb-6 bg-blue-50 text-blue-600 border-blue-200">
              <Star className="w-3 h-3 mr-1" />
              {tHome("badge")}
            </Badge>
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-slate-900"
          >
            {tHome("heroPrefix")}{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              {tHome("heroHighlight")}
            </span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {tHome("heroSubtitle")}
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
                {tHome("ctaTry")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push("/download")}
                className="cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" />
                {tHome("ctaDownload")}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section ref={featuresRef} className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              {tHome("featuresTitlePrefix")}{" "}
              <span className="text-blue-500">{tHome("featuresTitleHighlight")}</span>
            </h2>
            <p className="text-slate-600">{tHome("featuresSubtitle")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
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
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={stepsRef} className="py-24 px-6 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            animate={stepsInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              {tHome("howTitlePrefix")}{" "}
              <span className="text-blue-500">{tHome("howTitleHighlight")}</span>
            </h2>
            <p className="text-slate-600">{tHome("howSubtitle")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
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
                <h3 className="text-lg font-semibold mb-2 text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.description}</p>
              </motion.div>
            ))}
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
            <h2 className="text-3xl font-bold mb-4 text-slate-900">{tHome("ctaTitle")}</h2>
            <p className="text-slate-600 mb-8">{tHome("ctaSubtitle")}</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => router.push("/chat")}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {tHome("ctaTry")}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

