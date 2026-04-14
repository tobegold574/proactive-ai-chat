"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  MessageCircle,
  Download,
  Star,
  ExternalLink,
} from "lucide-react"
import { BrandIcon } from "@/components/brand-icon"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { features, steps } from "@/config/content"
import { fadeInUp, fadeInLeft, fadeInRight } from "@/config/animations"
import { WINDOWS_DESKTOP_RELEASE_URL } from "@/lib/site-config"

export default function Home() {
  const router = useRouter()
  const featuresRef = useRef(null)
  const stepsRef = useRef(null)
  const ctaRef = useRef(null)

  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const stepsInView = useInView(stepsRef, { once: true, margin: "-100px" })
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      <section className="pt-24 md:pt-28 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="success" className="mb-6 bg-blue-50 text-blue-600 border-blue-200">
              <Star className="w-3 h-3 mr-1" />
              开源免费 • 主动对话 AI
            </Badge>
          </motion.div>
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-slate-900"
          >
            不是只会{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              问一句答一句
            </span>
          </motion.h1>
          <motion.p 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            下一代 AI 对话体验。AI 会主动关心你，记得你的偏好，在合适的时机发起对话。
            就像一个真实的朋友。
          </motion.p>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={() => router.push("/chat")} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                <MessageCircle className="w-5 h-5 mr-2" />
                立即体验
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/download">
                  <Download className="w-4 h-4 mr-2" />
                  下载客户端
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
            className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500"
          >
            <Link href="/community" className="text-blue-600 hover:text-blue-700 font-medium hover:underline underline-offset-4">
              社区与桌面联动
            </Link>
            <Link href="/plugins" className="text-blue-600 hover:text-blue-700 font-medium hover:underline underline-offset-4">
              插件市场
            </Link>
          </motion.p>
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
              不一样的 <span className="text-blue-500">AI 对话</span>
            </h2>
            <p className="text-slate-600">重新定义人机交互</p>
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

      <section ref={stepsRef} id="how-it-works" className="py-24 px-6 bg-slate-100">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial="hidden"
            animate={stepsInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              工作 <span className="text-blue-500">原理</span>
            </h2>
            <p className="text-slate-600">两步开始你的主动 AI 对话</p>
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
                  <span className="text-2xl font-bold text-blue-500">
                    {step.number}
                  </span>
                </motion.div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 下载入口已拆分为独立页面：/download */}

      <section ref={ctaRef} className="py-24 px-6 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div 
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold mb-4 text-slate-900">准备好体验了吗？</h2>
            <p className="text-slate-600 mb-8">
              立即开始你的主动 AI 对话之旅
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={() => router.push("/chat")} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                <MessageCircle className="w-5 h-5 mr-2"/>
                开始体验
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
